#!/usr/bin/env python3
"""
Test script for Anthropic MCP integration
"""

import asyncio
import json
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.mcp_validator_anthropic import anthropic_mcp_validator

async def test_validation():
    """Test the Anthropic MCP validation functionality"""
    print("🧪 Testing Anthropic MCP Validation...")
    
    # Test cases
    test_cases = [
        ("vegan", "dietary"),
        ("italian", "cuisine"),
        ("oven", "equipment"),
        ("low-carb", "health"),
        ("invalid_term", "dietary"),
    ]
    
    for query, category in test_cases:
        print(f"\n🔍 Testing: '{query}' in category '{category}'")
        try:
            result = await anthropic_mcp_validator.validate_entry(query, category)
            print(f"   ✅ Valid: {result['isValid']}")
            print(f"   📊 Confidence: {result['confidence']:.2f}")
            print(f"   💭 Reason: {result['reason']}")
            if result['suggestions']:
                print(f"   💡 Suggestions: {', '.join(result['suggestions'])}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

async def test_web_search():
    """Test the Anthropic MCP web search functionality"""
    print("\n🌐 Testing Anthropic MCP Web Search...")
    
    test_queries = [
        "vegan recipes",
        "italian cooking techniques",
        "low-carb diet benefits"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Searching: '{query}'")
        try:
            results = await anthropic_mcp_validator.web_search(query, max_results=3)
            print(f"   📊 Found {len(results)} results")
            for i, result in enumerate(results, 1):
                print(f"   {i}. {result.get('title', 'No title')}")
                print(f"      📝 {result.get('content', 'No content')[:100]}...")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

async def main():
    """Main test function"""
    print("🚀 Starting Anthropic MCP Integration Tests")
    print("=" * 50)
    
    try:
        await test_validation()
        await test_web_search()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        return 1
    
    finally:
        # Cleanup
        anthropic_mcp_validator.cleanup()
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
