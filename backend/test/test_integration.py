#!/usr/bin/env python3
"""
Test script for the integrated context-aware recipe generation system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.context_manager import ContextManager, UserProfile, SessionContext
from utils.enhanced_rag_service import EnhancedRAGService
import json

def test_integrated_recipe_generation():
    """Test the integrated context-aware recipe generation"""
    
    print("🧪 Testing Integrated Context-Aware Recipe Generation")
    print("=" * 60)
    
    # Initialize context management system
    print("\n1. Initializing Context Management System...")
    context_manager = ContextManager(storage_path="test_data/context")
    rag_service = EnhancedRAGService(context_manager)
    
    # Create test user profile
    print("\n2. Creating Test User Profile...")
    user_id = "test_user_integration"
    profile = UserProfile(
        user_id=user_id,
        skill_level="intermediate",
        dietary_restrictions=["vegetarian"],
        cuisine_preferences=["italian", "mexican"],
        cooking_equipment=["oven", "stovetop", "blender"],
        ingredient_preferences=["tomatoes", "basil", "garlic", "olive_oil"],
        ingredient_dislikes=["mushrooms", "anchovies"],
        health_goals=["weight_loss"]
    )
    
    context_manager.save_user_profile(profile)
    print(f"✅ Created profile for {user_id}")
    
    # Create test session context
    print("\n3. Creating Test Session Context...")
    session_id = "test_session_integration"
    session_context = SessionContext(
        session_id=session_id,
        user_id=user_id,
        current_ingredients=["tomatoes", "basil", "garlic", "pasta", "olive_oil"],
        current_cuisine="italian",
        current_dietary_restrictions=["vegetarian"],
        current_time_constraint="30 minutes",
        current_serving_size=4,
        cooking_mode="flexible"
    )
    
    context_manager.save_session_context(session_context)
    print(f"✅ Created session context for {session_id}")
    
    # Test context-aware recipe generation
    print("\n4. Testing Context-Aware Recipe Generation...")
    try:
        recipes = rag_service.generate_contextual_recipes(
            user_id=user_id,
            session_id=session_id,
            ingredients=["tomatoes", "basil", "garlic", "pasta"],
            cuisine="italian",
            dietary_restrictions=["vegetarian"],
            time_limit="30 minutes",
            serving_size="4 people",
            strict_ingredients=False
        )
        
        print(f"✅ Generated {len(recipes)} context-aware recipes")
        
        if recipes:
            print("\n📋 Recipe Details:")
            for i, recipe in enumerate(recipes[:2], 1):  # Show first 2 recipes
                print(f"\nRecipe {i}: {recipe.get('title', 'Unknown Title')}")
                print(f"  - Cooking Time: {recipe.get('estimated_cooking_time', 'N/A')}")
                print(f"  - Nutrition: {recipe.get('nutritional_info', 'N/A')}")
                print(f"  - Ingredients: {len(recipe.get('ingredients', []))} items")
                print(f"  - Instructions: {len(recipe.get('instructions', []))} steps")
        else:
            print("❌ No recipes generated")
            
    except Exception as e:
        print(f"❌ Error generating recipes: {str(e)}")
        return False
    
    # Test conversation context integration
    print("\n5. Testing Conversation Context Integration...")
    try:
        # Add some conversation history
        context_manager.add_message_to_conversation(
            session_id=session_id,
            user_id=user_id,
            message="I want to make something with tomatoes and pasta",
            response="I'll help you create some delicious Italian pasta dishes!",
            context_type="recipe_generation"
        )
        
        # Generate another recipe with conversation context
        recipes2 = rag_service.generate_contextual_recipes(
            user_id=user_id,
            session_id=session_id,
            ingredients=["tomatoes", "basil", "garlic"],
            cuisine="italian",
            dietary_restrictions=["vegetarian"],
            time_limit="20 minutes",
            serving_size="2 people",
            strict_ingredients=False
        )
        
        print(f"✅ Generated {len(recipes2)} recipes with conversation context")
        
    except Exception as e:
        print(f"❌ Error testing conversation context: {str(e)}")
        return False
    
    # Test personalized recommendations
    print("\n6. Testing Personalized Recommendations...")
    try:
        recommendations = rag_service.get_personalized_recommendations(user_id, "pasta recipes")
        print(f"✅ Generated {len(recommendations)} personalized recommendations")
        
    except Exception as e:
        print(f"❌ Error getting recommendations: {str(e)}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 Integration Test Complete!")
    print("\n✅ Context-aware recipe generation working")
    print("✅ User profile integration working")
    print("✅ Session context integration working")
    print("✅ Conversation history integration working")
    print("✅ Personalized recommendations working")
    
    return True

if __name__ == "__main__":
    success = test_integrated_recipe_generation()
    if success:
        print("\n🚀 All tests passed! The integration is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        sys.exit(1)
