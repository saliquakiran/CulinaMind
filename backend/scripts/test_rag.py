#!/usr/bin/env python3
"""
Test script for the enhanced RAG service with vector embeddings
"""

import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.rag_service import CulinaryRAGService

def test_rag_service():
    """Test the enhanced RAG service functionality"""
    print("🧪 Testing Enhanced RAG Service...")
    print("=" * 50)
    
    try:
        # Initialize the service
        print("1. Initializing RAG service...")
        rag_service = CulinaryRAGService()
        print("✅ RAG service initialized successfully")
        
        # Test knowledge base stats
        print("\n2. Testing knowledge base statistics...")
        stats = rag_service.get_knowledge_stats()
        print(f"   Total items: {stats['total_items']}")
        print(f"   Categories: {len(stats['categories'])}")
        print(f"   Difficulties: {len(stats['difficulties'])}")
        print(f"   Cuisines: {len(stats['cuisines'])}")
        print(f"   Vector search available: {stats['vector_search_available']}")
        
        # Test semantic search
        print("\n3. Testing semantic search...")
        test_queries = [
            "How do I make fluffy pancakes?",
            "What are good substitutes for eggs?",
            "How to cook rice perfectly?",
            "Sous vide cooking techniques",
            "Chinese stir-fry methods"
        ]
        
        for query in test_queries:
            print(f"\n   Query: '{query}'")
            results = rag_service.retrieve_relevant_knowledge(query, top_k=3)
            print(f"   Results: {len(results)} found")
            for i, result in enumerate(results, 1):
                print(f"     {i}. {result['title']} ({result['category']})")
        
        # Test response generation
        print("\n4. Testing AI response generation...")
        test_question = "How can I make my pancakes fluffier?"
        response = rag_service.generate_response(test_question)
        print(f"   Question: {test_question}")
        print(f"   Response: {response[:200]}...")
        
        # Test recipe modification
        print("\n5. Testing recipe modification...")
        original_recipe = "Basic pancake recipe: 1 cup flour, 1 egg, 1 cup milk, 1 tbsp sugar, 1 tsp baking powder"
        modification_request = "Make it gluten-free and vegan"
        suggestions = rag_service.suggest_recipe_modifications(original_recipe, modification_request)
        print(f"   Original: {original_recipe}")
        print(f"   Request: {modification_request}")
        print(f"   Suggestions: {suggestions[:200]}...")
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv()
    
    # Check if OpenAI API key is available
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ OPENAI_API_KEY not found in environment variables")
        print("Please set your OpenAI API key in a .env file")
        sys.exit(1)
    
    test_rag_service() 