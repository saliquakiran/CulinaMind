#!/usr/bin/env python3
"""
Anthropic MCP Server for CulinaMind Web Search
This implements the official Model Context Protocol (MCP) for web search functionality.
"""

import asyncio
import json
import logging
import sys
from typing import Any, Dict, List, Optional
import httpx
from anthropic import Anthropic
import os
from dotenv import load_dotenv
from config import Config

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnthropicMCPServer:
    """MCP Server implementation using Anthropic's official MCP protocol"""
    
    def __init__(self):
        self.anthropic_client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        self.common_terms = self._load_common_terms()
        
    def _load_common_terms(self) -> Dict[str, Dict[str, Any]]:
        """Load a knowledge base of common culinary terms"""
        return {
            # Dietary restrictions
            "halal": {"category": "dietary", "isValid": True, "confidence": 0.95, "description": "Islamic dietary law"},
            "kosher": {"category": "dietary", "isValid": True, "confidence": 0.95, "description": "Jewish dietary law"},
            "vegan": {"category": "dietary", "isValid": True, "confidence": 0.98, "description": "Plant-based diet excluding all animal products"},
            "vegetarian": {"category": "dietary", "isValid": True, "confidence": 0.98, "description": "Plant-based diet excluding meat"},
            "keto": {"category": "dietary", "isValid": True, "confidence": 0.95, "description": "Low-carb, high-fat diet"},
            "ketogenic": {"category": "dietary", "isValid": True, "confidence": 0.95, "description": "Low-carb, high-fat diet"},
            "paleo": {"category": "dietary", "isValid": True, "confidence": 0.90, "description": "Paleolithic diet"},
            "gluten-free": {"category": "dietary", "isValid": True, "confidence": 0.90, "description": "Diet excluding gluten"},
            "dairy-free": {"category": "dietary", "isValid": True, "confidence": 0.90, "description": "Diet excluding dairy products"},
            "lactose-free": {"category": "dietary", "isValid": True, "confidence": 0.90, "description": "Diet excluding lactose"},
            "pescatarian": {"category": "dietary", "isValid": True, "confidence": 0.85, "description": "Vegetarian diet that includes fish"},
            "flexitarian": {"category": "dietary", "isValid": True, "confidence": 0.80, "description": "Mostly vegetarian with occasional meat"},
            "raw": {"category": "dietary", "isValid": True, "confidence": 0.85, "description": "Raw food diet"},
            "whole30": {"category": "dietary", "isValid": True, "confidence": 0.85, "description": "30-day elimination diet"},
            "mediterranean": {"category": "dietary", "isValid": True, "confidence": 0.90, "description": "Mediterranean diet pattern"},
            
            # Cuisines
            "italian": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Italian cuisine"},
            "chinese": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Chinese cuisine"},
            "japanese": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Japanese cuisine"},
            "mexican": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Mexican cuisine"},
            "indian": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Indian cuisine"},
            "french": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "French cuisine"},
            "thai": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Thai cuisine"},
            "korean": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Korean cuisine"},
            "greek": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Greek cuisine"},
            "spanish": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "Spanish cuisine"},
            "american": {"category": "cuisine", "isValid": True, "confidence": 0.95, "description": "American cuisine"},
            "middle eastern": {"category": "cuisine", "isValid": True, "confidence": 0.90, "description": "Middle Eastern cuisine"},
            "mediterranean": {"category": "cuisine", "isValid": True, "confidence": 0.90, "description": "Mediterranean cuisine"},
            
            # Equipment
            "oven": {"category": "equipment", "isValid": True, "confidence": 0.95, "description": "Kitchen oven for baking and roasting"},
            "stovetop": {"category": "equipment", "isValid": True, "confidence": 0.95, "description": "Stovetop for cooking"},
            "microwave": {"category": "equipment", "isValid": True, "confidence": 0.95, "description": "Microwave oven"},
            "blender": {"category": "equipment", "isValid": True, "confidence": 0.95, "description": "Kitchen blender"},
            "food processor": {"category": "equipment", "isValid": True, "confidence": 0.95, "description": "Food processor"},
            "slow cooker": {"category": "equipment", "isValid": True, "confidence": 0.90, "description": "Slow cooker or crock pot"},
            "instant pot": {"category": "equipment", "isValid": True, "confidence": 0.90, "description": "Instant Pot pressure cooker"},
            "air fryer": {"category": "equipment", "isValid": True, "confidence": 0.90, "description": "Air fryer"},
            "grill": {"category": "equipment", "isValid": True, "confidence": 0.90, "description": "Grill for outdoor cooking"},
            "wok": {"category": "equipment", "isValid": True, "confidence": 0.85, "description": "Wok for stir-frying"},
            "cast iron": {"category": "equipment", "isValid": True, "confidence": 0.85, "description": "Cast iron cookware"},
            "non-stick": {"category": "equipment", "isValid": True, "confidence": 0.85, "description": "Non-stick cookware"},
            
            # Health conditions
            "diabetes": {"category": "health", "isValid": True, "confidence": 0.95, "description": "Diabetes dietary considerations"},
            "heart disease": {"category": "health", "isValid": True, "confidence": 0.95, "description": "Heart disease dietary considerations"},
            "high blood pressure": {"category": "health", "isValid": True, "confidence": 0.95, "description": "High blood pressure dietary considerations"},
            "celiac": {"category": "health", "isValid": True, "confidence": 0.95, "description": "Celiac disease (gluten intolerance)"},
            "lactose intolerant": {"category": "health", "isValid": True, "confidence": 0.95, "description": "Lactose intolerance"},
            "allergies": {"category": "health", "isValid": True, "confidence": 0.90, "description": "Food allergies"},
            "weight loss": {"category": "health", "isValid": True, "confidence": 0.90, "description": "Weight loss dietary goals"},
            "muscle gain": {"category": "health", "isValid": True, "confidence": 0.90, "description": "Muscle gain dietary goals"},
            "energy": {"category": "health", "isValid": True, "confidence": 0.85, "description": "Energy-focused dietary goals"},
            "digestive health": {"category": "health", "isValid": True, "confidence": 0.85, "description": "Digestive health considerations"},
        }
    
    async def perform_web_search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Perform web search for culinary information"""
        try:
            # For now, return simulated results based on common terms
            # In a real implementation, this would use a web search API
            matching_terms = []
            
            for term, data in self.common_terms.items():
                if term in query.lower():
                    matching_terms.append({
                        "title": f"Information about {term}",
                        "content": data["description"],
                        "url": f"https://example.com/{term}",
                        "source": "CulinaMind Knowledge Base",
                        "relevance_score": data["confidence"]
                    })
            
            # If no matches found, create a generic result
            if not matching_terms:
                matching_terms.append({
                    "title": f"Search results for: {query}",
                    "content": f"This is a simulated search result for '{query}'. In a real implementation, this would contain actual web search results.",
                    "url": f"https://example.com/search?q={query}",
                    "source": "Simulated Search Engine",
                    "relevance_score": 0.7
                })
            
            return matching_terms[:max_results]
            
        except Exception as e:
            logger.error(f"Error performing web search: {str(e)}")
            return []
    
    async def validate_entry(self, query: str, category: str) -> Dict[str, Any]:
        """Validate user entry against common terms and category"""
        query_lower = query.lower().strip()
        
        if not query_lower:
            return {
                "isValid": False,
                "confidence": 0.0,
                "reason": "Empty query provided",
                "sources": [],
                "suggestions": [],
                "category_match": False
            }
        
        # Check against common terms first
        best_match = None
        best_confidence = 0.0
        
        for term, data in self.common_terms.items():
            if term in query_lower and data["category"] == category:
                if data["confidence"] > best_confidence:
                    best_confidence = data["confidence"]
                    best_match = data
        
        if best_match:
            return {
                "isValid": True,
                "confidence": best_match["confidence"],
                "reason": f"Found match: {best_match['description']}",
                "sources": [{"title": f"Knowledge base entry for {query}", "url": f"https://example.com/{query}"}],
                "suggestions": [],
                "category_match": True
            }
        
        # Check if it's a valid term but wrong category
        category_matches = [term for term, data in self.common_terms.items() if term in query_lower]
        
        if category_matches:
            return {
                "isValid": False,
                "confidence": 0.3,
                "reason": f"Term found but not in {category} category",
                "sources": [],
                "suggestions": [f"Try using '{category_matches[0]}' in the correct category"],
                "category_match": False
            }
        
        # If not found in knowledge base, try web search and generate suggestions
        try:
            search_results = await self.perform_web_search(f"{query} {category} cooking food", max_results=5)
            
            if search_results:
                # Use AI to validate and generate suggestions
                validation_prompt = f"""
                Based on the search results, validate "{query}" as a {category} term for a cooking/recipe app and provide suggestions.
                
                Search results: {json.dumps(search_results, indent=2)}
                
                Also, provide 3-5 similar or related terms that would be valid {category} entries, based on the search results and common culinary knowledge.
                
                Return a JSON response with:
                - isValid: boolean
                - confidence: float (0.0 to 1.0)
                - reason: string explaining the validation
                - category_match: boolean
                - suggestions: array of 3-5 similar/related terms that are valid for {category}
                """
                
                try:
                    response = self.anthropic_client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=500,
                        messages=[{"role": "user", "content": validation_prompt}]
                    )
                    
                    # Parse AI response
                    content = response.content[0].text
                    try:
                        import re
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            ai_result = json.loads(json_match.group())
                            return {
                                "isValid": ai_result.get("isValid", True),
                                "confidence": ai_result.get("confidence", 0.6),
                                "reason": ai_result.get("reason", f"Validated via web search: {query}"),
                                "sources": [{"title": result["title"], "url": result["url"]} for result in search_results[:2]],
                                "suggestions": ai_result.get("suggestions", []),
                                "category_match": ai_result.get("category_match", True)
                            }
                    except:
                        pass
                except Exception as e:
                    logger.error(f"AI validation error: {str(e)}")
                
                # Fallback: generate suggestions from common terms
                suggestions = self._generate_suggestions(query_lower, category)
                return {
                    "isValid": True,
                    "confidence": 0.6,
                    "reason": f"Found web references for {query} in {category} context",
                    "sources": [{"title": result["title"], "url": result["url"]} for result in search_results[:2]],
                    "suggestions": suggestions,
                    "category_match": True
                }
            else:
                # Generate suggestions even when no web results found
                suggestions = self._generate_suggestions(query_lower, category)
                return {
                    "isValid": False,
                    "confidence": 0.1,
                    "reason": "Term not recognized in knowledge base and no web references found",
                    "sources": [],
                    "suggestions": suggestions,
                    "category_match": False
                }
                
        except Exception as e:
            logger.error(f"Error in web search validation: {str(e)}")
            suggestions = self._generate_suggestions(query_lower, category)
            return {
                "isValid": False,
                "confidence": 0.1,
                "reason": "Term not recognized in knowledge base",
                "sources": [],
                "suggestions": suggestions,
                "category_match": False
            }
    
    def _generate_suggestions(self, query: str, category: str) -> List[str]:
        """Generate suggestions based on common terms and fuzzy matching"""
        suggestions = []
        
        # Get all terms in the category
        category_terms = [term for term, data in self.common_terms.items() if data["category"] == category]
        
        # Simple fuzzy matching - find terms that share common substrings
        query_words = query.split()
        for term in category_terms:
            term_words = term.split()
            
            # Check for word overlap
            overlap = set(query_words) & set(term_words)
            if overlap:
                suggestions.append(term)
            
            # Check for substring matches
            elif any(word in term for word in query_words if len(word) > 2):
                suggestions.append(term)
        
        # If no good matches, suggest popular terms in the category
        if not suggestions:
            popular_terms = sorted(category_terms, key=lambda x: self.common_terms[x]["confidence"], reverse=True)
            suggestions = popular_terms[:5]
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    async def handle_mcp_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP protocol requests"""
        try:
            method = request.get("method")
            params = request.get("params", {})
            
            if method == "initialize":
                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "culinamind-web-search",
                            "version": "1.0.0"
                        }
                    }
                }
            
            elif method == "tools/list":
                return {
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": {
                        "tools": [
                            {
                                "name": "web_search",
                                "description": "Perform web search for culinary information",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "query": {"type": "string", "description": "Search query"},
                                        "max_results": {"type": "integer", "description": "Maximum results", "default": 5}
                                    },
                                    "required": ["query"]
                                }
                            },
                            {
                                "name": "validate_entry",
                                "description": "Validate user entries for culinary categories",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "query": {"type": "string", "description": "Entry to validate"},
                                        "category": {"type": "string", "description": "Category (dietary, cuisine, equipment, health)"}
                                    },
                                    "required": ["query", "category"]
                                }
                            }
                        ]
                    }
                }
            
            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                
                if tool_name == "web_search":
                    query = tool_args.get("query")
                    max_results = tool_args.get("max_results", 5)
                    results = await self.perform_web_search(query, max_results)
                    
                    return {
                        "jsonrpc": "2.0",
                        "id": request.get("id"),
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps({
                                        "query": query,
                                        "results": results,
                                        "timestamp": asyncio.get_event_loop().time()
                                    }, indent=2)
                                }
                            ]
                        }
                    }
                
                elif tool_name == "validate_entry":
                    query = tool_args.get("query")
                    category = tool_args.get("category")
                    validation = await self.validate_entry(query, category)
                    
                    return {
                        "jsonrpc": "2.0",
                        "id": request.get("id"),
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(validation, indent=2)
                                }
                            ]
                        }
                    }
            
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }
            
        except Exception as e:
            logger.error(f"Error handling MCP request: {str(e)}")
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }

async def main():
    """Main function to run the MCP server"""
    server = AnthropicMCPServer()
    
    # Read from stdin and write to stdout (stdio transport)
    while True:
        try:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
                
            request = json.loads(line.strip())
            response = await server.handle_mcp_request(request)
            print(json.dumps(response))
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in main loop: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
