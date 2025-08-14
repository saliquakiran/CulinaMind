#!/usr/bin/env python3
"""
CulinaMind Context Engineering Test Suite

This is a comprehensive test suite for the context engineering system.
Run this file to test all components of the context engineering implementation.
"""

import os
import sys
import json
import tempfile
import shutil
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.context_manager import ContextManager, UserProfile, SessionContext, ConversationContext
from utils.prompt_engineer import PromptEngineer, PromptType
from utils.context_optimizer import ContextOptimizer

def test_context_manager():
    """Test ContextManager functionality"""
    print("🧪 Testing ContextManager...")
    
    # Create temporary directory for testing
    test_dir = tempfile.mkdtemp()
    print(f"   Using test directory: {test_dir}")
    
    cm = ContextManager(storage_path=test_dir)
    
    try:
        # Test user profile
        profile = UserProfile(
            user_id="test_user",
            skill_level="intermediate",
            dietary_restrictions=["vegetarian"],
            cuisine_preferences=["italian", "mexican"]
        )
        
        assert cm.save_user_profile(profile) == True
        loaded_profile = cm.load_user_profile("test_user")
        assert loaded_profile.skill_level == "intermediate"
        assert "vegetarian" in loaded_profile.dietary_restrictions
        print("   ✅ User profile management works")
        
        # Test session context
        session = SessionContext(
            session_id="test_session",
            user_id="test_user",
            current_ingredients=["tomatoes", "basil"],
            current_cuisine="italian"
        )
        
        assert cm.save_session_context(session) == True
        loaded_session = cm.load_session_context("test_session")
        assert "tomatoes" in loaded_session.current_ingredients
        print("   ✅ Session context management works")
        
        # Test conversation context
        cm.add_message_to_conversation(
            session_id="test_session",
            user_id="test_user",
            message="Hello",
            response="Hi there!",
            context_type="general"
        )
        
        conversation = cm.load_conversation_context("test_session")
        assert len(conversation.messages) == 1
        assert conversation.messages[0]["user_message"] == "Hello"
        print("   ✅ Conversation context management works")
        
    finally:
        # Cleanup
        shutil.rmtree(test_dir)
        print(f"   🧹 Cleaned up test directory: {test_dir}")
    
    print("✅ ContextManager tests passed\n")

def test_prompt_engineer():
    """Test PromptEngineer functionality"""
    print("🧪 Testing PromptEngineer...")
    
    test_dir = tempfile.mkdtemp()
    print(f"   Using test directory: {test_dir}")
    
    cm = ContextManager(storage_path=test_dir)
    pe = PromptEngineer(cm)
    
    try:
        # Test prompt type detection
        assert pe.determine_prompt_type("How do I make pasta?", {}) == PromptType.RECIPE_GENERATION
        assert pe.determine_prompt_type("What is sous vide?", {}) == PromptType.TECHNIQUE_EXPLANATION
        assert pe.determine_prompt_type("Can I substitute flour?", {}) == PromptType.INGREDIENT_SUBSTITUTION
        print("   ✅ Prompt type detection works")
        
        # Test prompt building
        prompt = pe.build_enhanced_prompt(
            user_id="test_user",
            session_id="test_session",
            query="How do I make pasta?",
            context={"cuisine": "italian"}
        )
        
        assert "How do I make pasta?" in prompt
        assert "CURRENT QUERY:" in prompt
        print("   ✅ Prompt building works")
        
    finally:
        shutil.rmtree(test_dir)
        print(f"   🧹 Cleaned up test directory: {test_dir}")
    
    print("✅ PromptEngineer tests passed\n")

def test_context_optimizer():
    """Test ContextOptimizer functionality"""
    print("🧪 Testing ContextOptimizer...")
    
    test_dir = tempfile.mkdtemp()
    print(f"   Using test directory: {test_dir}")
    
    cm = ContextManager(storage_path=test_dir)
    co = ContextOptimizer(cm)
    
    try:
        # Create test context
        profile = UserProfile("test_user", skill_level="beginner")
        cm.save_user_profile(profile)
        
        session = SessionContext("test_session", "test_user")
        session.current_ingredients = ["tomatoes", "basil"]
        cm.save_session_context(session)
        
        # Test context optimization
        optimized = co.optimize_context_for_query(
            user_id="test_user",
            session_id="test_session",
            query="How do I make pasta?",
            base_prompt="You are a culinary assistant."
        )
        
        assert "How do I make pasta?" in optimized
        assert "CURRENT QUERY:" in optimized
        print("   ✅ Context optimization works")
        
        # Test context summary
        summary = co.get_context_summary("test_user", "test_session")
        assert "user_profile" in summary
        assert "session" in summary
        print("   ✅ Context summary works")
        
    finally:
        shutil.rmtree(test_dir)
        print(f"   🧹 Cleaned up test directory: {test_dir}")
    
    print("✅ ContextOptimizer tests passed\n")

def test_integration():
    """Test integration between components"""
    print("🧪 Testing Integration...")
    
    test_dir = tempfile.mkdtemp()
    print(f"   Using test directory: {test_dir}")
    
    cm = ContextManager(storage_path=test_dir)
    
    try:
        # Create comprehensive test data
        profile = UserProfile(
            user_id="integration_test_user",
            skill_level="intermediate",
            dietary_restrictions=["vegetarian"],
            cuisine_preferences=["italian"],
            cooking_equipment=["oven", "stovetop"],
            ingredient_preferences=["tomatoes", "basil", "garlic"]
        )
        cm.save_user_profile(profile)
        
        session = SessionContext(
            session_id="integration_test_session",
            user_id="integration_test_user",
            current_ingredients=["tomatoes", "basil", "garlic", "pasta"],
            current_cuisine="italian",
            current_dietary_restrictions=["vegetarian"],
            current_time_constraint="30 minutes"
        )
        cm.save_session_context(session)
        
        # Test prompt engineering with context
        pe = PromptEngineer(cm)
        prompt = pe.build_enhanced_prompt(
            user_id="integration_test_user",
            session_id="integration_test_session",
            query="What can I make for dinner?",
            context={"health_focus": True}
        )
        
        # Check that context is included
        assert "USER PROFILE:" in prompt
        assert "CURRENT SESSION:" in prompt
        assert "vegetarian" in prompt
        assert "italian" in prompt
        assert "tomatoes" in prompt
        print("   ✅ Integration test passed - context properly injected")
        
    finally:
        shutil.rmtree(test_dir)
        print(f"   🧹 Cleaned up test directory: {test_dir}")
    
    print("✅ Integration tests passed\n")

def main():
    """Run all tests"""
    print("🚀 Starting CulinaMind Context Engineering Tests")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        test_context_manager()
        test_prompt_engineer()
        test_context_optimizer()
        test_integration()
        
        print("🎉 All tests passed successfully!")
        print("✅ Context engineering system is working correctly")
        print()
        print("📁 Test files are saved in:")
        print("   - Main test file: backend/test_context_engineering.py")
        print("   - Demo script: backend/examples/context_engineering_demo.py")
        print("   - Documentation: CONTEXT_ENGINEERING_GUIDE.md")
        print("   - Summary: CONTEXT_ENGINEERING_SUMMARY.md")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
