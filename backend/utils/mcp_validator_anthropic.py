"""
Anthropic MCP Validator for CulinaMind
Proper implementation that communicates with the Anthropic MCP server.
"""

import asyncio
import json
import logging
import subprocess
import sys
import os
import time
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class AnthropicMCPValidator:
    """MCP validator service using Anthropic's official MCP protocol"""
    
    def __init__(self):
        self.server_process = None
        # Get absolute path to the MCP server
        self.server_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mcp_server_anthropic.py")
        self.initialized = False
        
    def _get_timestamp(self):
        """Get current timestamp"""
        return time.time()
    
    async def _start_server(self):
        """Start the MCP server process"""
        if self.server_process is None or self.server_process.poll() is not None:
            try:
                # Ensure the server file exists
                if not os.path.exists(self.server_path):
                    raise Exception(f"MCP server file not found at: {self.server_path}")
                
                logger.info(f"Starting MCP server from: {self.server_path}")
                
                # Start the server process
                self.server_process = subprocess.Popen(
                    [sys.executable, self.server_path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=0,  # Unbuffered
                    cwd=os.path.dirname(self.server_path)  # Set working directory
                )
                
                # Give the server a moment to start
                await asyncio.sleep(0.5)
                
                # Check if the process is still running
                if self.server_process.poll() is not None:
                    stderr_output = self.server_process.stderr.read()
                    raise Exception(f"MCP server failed to start. Error: {stderr_output}")
                
                logger.info("MCP server started successfully")
                self.initialized = False
            except Exception as e:
                logger.error(f"Failed to start MCP server: {str(e)}")
                if self.server_process:
                    self.server_process.terminate()
                    self.server_process = None
                raise
    
    async def _initialize_server(self):
        """Initialize the MCP server"""
        if not self.initialized:
            # Initialize the server
            init_request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {
                        "name": "culinamind-client",
                        "version": "1.0.0"
                    }
                }
            }
            
            try:
                await self._send_request_direct(init_request)
                self.initialized = True
                logger.info("MCP server initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize MCP server: {str(e)}")
                raise
    
    async def _send_request_direct(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Send a request to the MCP server and get response (direct, no recursion)"""
        try:
            # Check if server is still running
            if self.server_process is None or self.server_process.poll() is not None:
                raise Exception("MCP server is not running")
            
            # Send request
            request_json = json.dumps(request) + "\n"
            self.server_process.stdin.write(request_json)
            self.server_process.stdin.flush()
            
            # Read response with timeout
            try:
                response_line = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, self.server_process.stdout.readline
                    ),
                    timeout=15.0  # Increased timeout
                )
            except asyncio.TimeoutError:
                raise Exception("MCP server response timeout")
            
            if response_line:
                response_text = response_line.strip()
                logger.debug(f"MCP server response: {response_text}")
                return json.loads(response_text)
            else:
                raise Exception("No response from MCP server")
                
        except Exception as e:
            logger.error(f"Error communicating with MCP server: {str(e)}")
            # Reset server state on error
            self.initialized = False
            if self.server_process:
                self.server_process.terminate()
                self.server_process = None
            raise
    
    async def _send_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Send a request to the MCP server and get response"""
        await self._start_server()
        await self._initialize_server()
        return await self._send_request_direct(request)
    
    async def validate_entry(self, input_text: str, category: str) -> Dict[str, Any]:
        """Validate a user entry using Anthropic MCP"""
        try:
            # Call the validate_entry tool
            validate_request = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "validate_entry",
                    "arguments": {
                        "query": input_text,
                        "category": category
                    }
                }
            }
            
            response = await self._send_request(validate_request)
            
            if "result" in response and "content" in response["result"]:
                content = response["result"]["content"][0]["text"]
                return json.loads(content)
            else:
                logger.error(f"MCP server error: {response}")
                return {
                    "isValid": False,
                    "confidence": 0.0,
                    "reason": "MCP server error",
                    "sources": [],
                    "suggestions": [],
                    "category_match": False
                }
                
        except Exception as e:
            logger.error(f"Error validating entry: {str(e)}")
            return {
                "isValid": False,
                "confidence": 0.0,
                "reason": f"Validation error: {str(e)}",
                "sources": [],
                "suggestions": [],
                "category_match": False
            }
    
    async def web_search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Perform web search using Anthropic MCP"""
        try:
            # Call the web_search tool
            search_request = {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": "web_search",
                    "arguments": {
                        "query": query,
                        "max_results": max_results
                    }
                }
            }
            
            response = await self._send_request(search_request)
            
            if "result" in response and "content" in response["result"]:
                content = response["result"]["content"][0]["text"]
                result_data = json.loads(content)
                return result_data.get("results", [])
            else:
                logger.error(f"MCP web search error: {response}")
                return []
                
        except Exception as e:
            logger.error(f"Error performing web search: {str(e)}")
            return []
    
    def validate_entry_sync(self, input_text: str, category: str) -> Dict[str, Any]:
        """Synchronous wrapper for validate_entry"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.validate_entry(input_text, category))
        except RuntimeError:
            # If no event loop is running, create a new one
            return asyncio.run(self.validate_entry(input_text, category))
    
    def web_search_sync(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Synchronous wrapper for web_search"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.web_search(query, max_results))
        except RuntimeError:
            # If no event loop is running, create a new one
            return asyncio.run(self.web_search(query, max_results))
    
    def cleanup(self):
        """Cleanup server process"""
        if self.server_process:
            self.server_process.terminate()
            self.server_process = None
        self.initialized = False
    
    def __del__(self):
        """Cleanup server process on destruction"""
        self.cleanup()

# Create global instance
anthropic_mcp_validator = AnthropicMCPValidator()
