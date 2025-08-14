#!/usr/bin/env python3
"""
CulinaMind Context Engineering Demo

This script demonstrates the context engineering capabilities of CulinaMind.
It shows how user profiles, session context, and conversation history
are used to provide personalized culinary assistance.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.context_manager import ContextManager, UserProfile, SessionContext
from utils.prompt_engineer import PromptEngineer
from utils.enhanced_rag_service import EnhancedRAGService
from utils.context_optimizer import ContextOptimizer
import json

def demo_context_engineering():
    """Demonstrate context engineering features"""
    
    print("🍳 CulinaMind Context Engineering Demo")
    print("=" * 50)
    
    # Initialize context management system
    print("\n1. Initializing Context Management System...")
    context_manager = ContextManager(storage_path="demo_data/context")
    prompt_engineer = PromptEngineer(context_manager)
    rag_service = EnhancedRAGService(context_manager)
    optimizer = ContextOptimizer(context_manager)
    
    # Create demo user profile
    print("\n2. Creating User Profile...")
    user_id = "demo_user_123"
    profile = UserProfile(
        user_id=user_id,
        skill_level="intermediate",
        dietary_restrictions=["vegetarian"],
        cuisine_preferences=["italian", "mexican", "indian"],
        cooking_equipment=["oven", "stovetop", "blender", "food_processor"],
        ingredient_preferences=["tomatoes", "basil", "garlic", "olive_oil", "cheese"],
        ingredient_dislikes=["mushrooms", "anchovies"],
        health_goals=["weight_loss", "muscle_gain"]
    )
    
    context_manager.save_user_profile(profile)
    print(f"✅ Created profile for {user_id}")
    print(f"   - Skill Level: {profile.skill_level}")
    print(f"   - Dietary Restrictions: {', '.join(profile.dietary_restrictions)}")
    print(f"   - Cuisine Preferences: {', '.join(profile.cuisine_preferences)}")
    
    # Create demo session context
    print("\n3. Creating Session Context...")
    session_id = "demo_session_456"
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
    print(f"   - Ingredients: {', '.join(session_context.current_ingredients)}")
    print(f"   - Cuisine: {session_context.current_cuisine}")
    print(f"   - Time Constraint: {session_context.current_time_constraint}")
    
    # Simulate conversation history
    print("\n4. Simulating Conversation History...")
    conversation_messages = [
        ("What can I make with these ingredients?", "I can suggest several Italian vegetarian pasta dishes using your tomatoes, basil, and garlic."),
        ("I want something quick and easy", "Perfect! I'll recommend a simple 20-minute pasta dish that's beginner-friendly."),
        ("What about nutritional value?", "Great question! I'll focus on recipes that are high in protein and fiber, perfect for your health goals.")
    ]
    
    for user_msg, ai_response in conversation_messages:
        context_manager.add_message_to_conversation(
            session_id=session_id,
            user_id=user_id,
            message=user_msg,
            response=ai_response,
            context_type="recipe_generation"
        )
    
    print(f"✅ Added {len(conversation_messages)} conversation messages")
    
    # Demonstrate context-aware prompt generation
    print("\n5. Demonstrating Context-Aware Prompt Generation...")
    query = "I want to make a healthy pasta dish"
    
    enhanced_prompt = prompt_engineer.build_enhanced_prompt(
        user_id=user_id,
        session_id=session_id,
        query=query,
        context={"health_focus": True, "time_constraint": "30 minutes"}
    )
    
    print("✅ Generated enhanced prompt with context:")
    print(f"   - Query: {query}")
    print(f"   - Prompt length: {len(enhanced_prompt)} characters")
    print(f"   - Context sections: {enhanced_prompt.count('CONTEXT')}")
    
    # Demonstrate context optimization
    print("\n6. Demonstrating Context Optimization...")
    optimized_context = optimizer.optimize_context_for_query(
        user_id=user_id,
        session_id=session_id,
        query=query,
        base_prompt="You are a culinary assistant."
    )
    
    print("✅ Optimized context for token limits:")
    print(f"   - Optimized length: {len(optimized_context)} characters")
    print(f"   - Estimated tokens: {len(optimized_context.split()) * 0.75:.0f}")
    
    # Demonstrate personalized recommendations
    print("\n7. Demonstrating Personalized Recommendations...")
    recommendations = rag_service.get_personalized_recommendations(user_id, "pasta recipes")
    
    print(f"✅ Generated {len(recommendations)} personalized recommendations")
    for i, rec in enumerate(recommendations[:3], 1):
        print(f"   {i}. {rec.get('title', 'Unknown')} ({rec.get('category', 'Unknown')})")
    
    # Demonstrate context summary
    print("\n8. Demonstrating Context Summary...")
    summary = optimizer.get_context_summary(user_id, session_id)
    
    print("✅ Context Summary:")
    print(json.dumps(summary, indent=2))
    
    # Demonstrate conversation starter
    print("\n9. Demonstrating Personalized Conversation Starter...")
    greeting = rag_service.get_conversation_starter(user_id, session_id)
    
    print("✅ Personalized Greeting:")
    print(f"   {greeting}")
    
    print("\n" + "=" * 50)
    print("�� Context Engineering Demo Complete!")
    print("\nKey Features Demonstrated:")
    print("✅ User profile management with preferences")
    print("✅ Session context tracking")
    print("✅ Conversation history management")
    print("✅ Context-aware prompt generation")
    print("✅ Token optimization and context filtering")
    print("✅ Personalized recommendations")
    print("✅ Context summarization and monitoring")
    
    print("\nNext Steps:")
    print("1. Integrate with your Flask application")
    print("2. Set up proper database storage")
    print("3. Configure OpenAI API keys")
    print("4. Test with real user interactions")
    print("5. Monitor context performance and optimize")

if __name__ == "__main__":
    demo_context_engineering()
