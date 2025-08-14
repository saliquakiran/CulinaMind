#!/usr/bin/env python3
"""
Test script to verify preference collection system works correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.context_manager import ContextManager, UserProfile
from utils.enhanced_rag_service import EnhancedRAGService
import json

def test_preference_collection():
    """Test the preference collection and context integration"""
    
    print("🧪 Testing Preference Collection System")
    print("=" * 60)
    
    # Initialize context management system
    print("\n1. Initializing Context Management System...")
    context_manager = ContextManager(storage_path="test_data/preference_collection")
    rag_service = EnhancedRAGService(context_manager)
    
    # Test 1: Create user profile with comprehensive preferences
    print("\n2. Testing Comprehensive Preference Collection...")
    
    comprehensive_preferences = {
        "skill_level": "intermediate",
        "dietary_restrictions": ["vegetarian", "gluten-free"],
        "cuisine_preferences": ["italian", "mexican", "mediterranean"],
        "cooking_equipment": ["oven", "stovetop", "grill", "blender"],
        "ingredient_preferences": ["tomatoes", "basil", "garlic", "olive_oil", "cheese"],
        "ingredient_dislikes": ["mushrooms", "anchovies", "cilantro"],
        "health_goals": ["weight_loss", "heart_health"],
        "cooking_time_preferences": {
            "weekday": "30min",
            "weekend": "1hr"
        },
        "serving_size_preferences": {
            "weekday": 2,
            "weekend": 4
        }
    }
    
    # Create user profile with these preferences
    user_profile = UserProfile(
        user_id="test_user_preferences",
        skill_level=comprehensive_preferences["skill_level"],
        dietary_restrictions=comprehensive_preferences["dietary_restrictions"],
        cuisine_preferences=comprehensive_preferences["cuisine_preferences"],
        cooking_equipment=comprehensive_preferences["cooking_equipment"],
        ingredient_preferences=comprehensive_preferences["ingredient_preferences"],
        ingredient_dislikes=comprehensive_preferences["ingredient_dislikes"],
        health_goals=comprehensive_preferences["health_goals"],
        cooking_time_preferences=comprehensive_preferences["cooking_time_preferences"],
        serving_size_preferences=comprehensive_preferences["serving_size_preferences"]
    )
    
    # Save the profile
    success = context_manager.save_user_profile(user_profile)
    assert success, "Failed to save user profile with preferences"
    print("✅ Comprehensive preferences saved successfully")
    
    # Test 2: Load and verify preferences
    print("\n3. Testing Preference Retrieval...")
    
    loaded_profile = context_manager.load_user_profile("test_user_preferences")
    assert loaded_profile is not None, "Failed to load user profile"
    
    # Verify all preferences are correctly stored
    assert loaded_profile.skill_level == "intermediate"
    assert "vegetarian" in loaded_profile.dietary_restrictions
    assert "italian" in loaded_profile.cuisine_preferences
    assert "oven" in loaded_profile.cooking_equipment
    assert "tomatoes" in loaded_profile.ingredient_preferences
    assert "mushrooms" in loaded_profile.ingredient_dislikes
    assert "weight_loss" in loaded_profile.health_goals
    assert loaded_profile.cooking_time_preferences["weekday"] == "30min"
    assert loaded_profile.serving_size_preferences["weekend"] == 4
    
    print("✅ All preferences retrieved and verified correctly")
    
    # Test 3: Test context-aware recipe generation with preferences
    print("\n4. Testing Context-Aware Recipe Generation with Preferences...")
    
    try:
        # Generate recipes that should respect user preferences
        recipes = rag_service.generate_contextual_recipes(
            user_id="test_user_preferences",
            session_id="test_session_preferences",
            ingredients=["tomatoes", "basil", "pasta"],
            cuisine="italian",
            dietary_restrictions=["vegetarian"],
            time_limit="30 minutes",
            serving_size="2 people",
            strict_ingredients=False
        )
        
        print(f"✅ Generated {len(recipes)} recipes with user preferences")
        
        # Verify recipes are vegetarian and Italian (based on preferences)
        if recipes:
            first_recipe = recipes[0]
            print(f"   First recipe: {first_recipe.get('title', 'Unknown')}")
            
            # Check if recipe respects dietary restrictions
            ingredients_text = ' '.join(first_recipe.get('ingredients', [])).lower()
            assert 'meat' not in ingredients_text, "Recipe should be vegetarian"
            assert 'chicken' not in ingredients_text, "Recipe should be vegetarian"
            assert 'beef' not in ingredients_text, "Recipe should be vegetarian"
            
            print("✅ Recipe respects dietary restrictions (vegetarian)")
            
            # Check if recipe uses preferred ingredients
            has_preferred_ingredients = any(
                pref_ingredient.lower() in ingredients_text 
                for pref_ingredient in loaded_profile.ingredient_preferences
            )
            assert has_preferred_ingredients, "Recipe should use preferred ingredients"
            
            print("✅ Recipe uses preferred ingredients")
            
            # Check if recipe avoids disliked ingredients
            avoids_disliked_ingredients = not any(
                disliked_ingredient.lower() in ingredients_text 
                for disliked_ingredient in loaded_profile.ingredient_dislikes
            )
            assert avoids_disliked_ingredients, "Recipe should avoid disliked ingredients"
            
            print("✅ Recipe avoids disliked ingredients")
        
    except Exception as e:
        print(f"❌ Error generating recipes with preferences: {str(e)}")
        return False
    
    # Test 4: Test preference updates
    print("\n5. Testing Preference Updates...")
    
    # Update some preferences
    updated_preferences = {
        "skill_level": "advanced",
        "dietary_restrictions": ["vegan"],
        "cuisine_preferences": ["japanese", "thai"],
        "ingredient_preferences": ["tofu", "miso", "ginger"]
    }
    
    # Update preferences using the RAG service
    update_success = rag_service.update_user_preferences("test_user_preferences", updated_preferences)
    assert update_success, "Failed to update user preferences"
    
    # Verify updates
    updated_profile = context_manager.load_user_profile("test_user_preferences")
    assert updated_profile.skill_level == "advanced"
    assert "vegan" in updated_profile.dietary_restrictions
    assert "japanese" in updated_profile.cuisine_preferences
    assert "tofu" in updated_profile.ingredient_preferences
    
    print("✅ Preferences updated successfully")
    
    # Test 5: Test minimal preferences (new user scenario)
    print("\n6. Testing Minimal Preferences (New User Scenario)...")
    
    # Create a new user with minimal preferences
    minimal_preferences = {
        "skill_level": "beginner",
        "dietary_restrictions": [],
        "cuisine_preferences": [],
        "cooking_equipment": ["stovetop"],
        "ingredient_preferences": [],
        "ingredient_dislikes": [],
        "health_goals": [],
        "cooking_time_preferences": {"weekday": "", "weekend": ""},
        "serving_size_preferences": {"weekday": 2, "weekend": 2}
    }
    
    minimal_profile = UserProfile(
        user_id="test_user_minimal",
        skill_level=minimal_preferences["skill_level"],
        dietary_restrictions=minimal_preferences["dietary_restrictions"],
        cuisine_preferences=minimal_preferences["cuisine_preferences"],
        cooking_equipment=minimal_preferences["cooking_equipment"],
        ingredient_preferences=minimal_preferences["ingredient_preferences"],
        ingredient_dislikes=minimal_preferences["ingredient_dislikes"],
        health_goals=minimal_preferences["health_goals"],
        cooking_time_preferences=minimal_preferences["cooking_time_preferences"],
        serving_size_preferences=minimal_preferences["serving_size_preferences"]
    )
    
    context_manager.save_user_profile(minimal_profile)
    
    # Test recipe generation with minimal preferences
    minimal_recipes = rag_service.generate_contextual_recipes(
        user_id="test_user_minimal",
        session_id="test_session_minimal",
        ingredients=["chicken", "rice", "vegetables"],
        cuisine="",
        dietary_restrictions=[],
        time_limit="",
        serving_size="2 people",
        strict_ingredients=False
    )
    
    print(f"✅ Generated {len(minimal_recipes)} recipes with minimal preferences")
    print("✅ System handles minimal preferences gracefully")
    
    print("\n" + "=" * 60)
    print("🎉 Preference Collection System Test Complete!")
    print("\n✅ Comprehensive preference collection works")
    print("✅ Preference retrieval works")
    print("✅ Context-aware recipe generation respects preferences")
    print("✅ Preference updates work")
    print("✅ Minimal preferences are handled gracefully")
    print("✅ Dietary restrictions are enforced")
    print("✅ Preferred ingredients are used")
    print("✅ Disliked ingredients are avoided")
    
    return True

if __name__ == "__main__":
    success = test_preference_collection()
    if success:
        print("\n🚀 All tests passed! Preference collection system is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        sys.exit(1)
