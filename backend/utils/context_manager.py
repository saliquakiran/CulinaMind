import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ContextType(Enum):
    USER_PROFILE = "user_profile"
    CONVERSATION_HISTORY = "conversation_history"
    COOKING_PREFERENCES = "cooking_preferences"
    DIETARY_RESTRICTIONS = "dietary_restrictions"
    SKILL_LEVEL = "skill_level"
    EQUIPMENT_AVAILABLE = "equipment_available"
    INGREDIENT_PREFERENCES = "ingredient_preferences"
    RECIPE_HISTORY = "recipe_history"
    SESSION_CONTEXT = "session_context"

@dataclass
class UserProfile:
    """User profile context for personalized AI responses"""
    user_id: str
    skill_level: str = "beginner"  # beginner, intermediate, advanced
    dietary_restrictions: List[str] = None
    cuisine_preferences: List[str] = None
    cooking_equipment: List[str] = None
    ingredient_preferences: List[str] = None
    ingredient_dislikes: List[str] = None
    cooking_time_preferences: Dict[str, str] = None  # weekday, weekend, etc.
    serving_size_preferences: Dict[str, int] = None
    health_goals: List[str] = None
    last_updated: datetime = None
    
    def __post_init__(self):
        if self.dietary_restrictions is None:
            self.dietary_restrictions = []
        if self.cuisine_preferences is None:
            self.cuisine_preferences = []
        if self.cooking_equipment is None:
            self.cooking_equipment = []
        if self.ingredient_preferences is None:
            self.ingredient_preferences = []
        if self.ingredient_dislikes is None:
            self.ingredient_dislikes = []
        if self.cooking_time_preferences is None:
            self.cooking_time_preferences = {}
        if self.serving_size_preferences is None:
            self.serving_size_preferences = {}
        if self.health_goals is None:
            self.health_goals = []
        if self.last_updated is None:
            self.last_updated = datetime.now()

@dataclass
class ConversationContext:
    """Context for ongoing conversations"""
    session_id: str
    user_id: str
    messages: List[Dict[str, Any]] = None
    current_topic: str = None
    cooking_session_type: str = None  # recipe_generation, cooking_help
    active_recipe: Dict[str, Any] = None
    last_activity: datetime = None
    
    def __post_init__(self):
        if self.messages is None:
            self.messages = []
        if self.last_activity is None:
            self.last_activity = datetime.now()

@dataclass
class SessionContext:
    """Current session context"""
    session_id: str
    user_id: str
    current_ingredients: List[str] = None
    current_cuisine: str = None
    current_dietary_restrictions: List[str] = None
    current_time_constraint: str = None
    current_serving_size: int = None
    cooking_mode: str = None  # strict_ingredients, flexible
    session_start_time: datetime = None
    
    def __post_init__(self):
        if self.current_ingredients is None:
            self.current_ingredients = []
        if self.current_dietary_restrictions is None:
            self.current_dietary_restrictions = []
        if self.session_start_time is None:
            self.session_start_time = datetime.now()

class ContextManager:
    """Advanced context management system for CulinaMind AI agent"""
    
    def __init__(self, storage_path: str = "data/context"):
        self.storage_path = storage_path
        self._ensure_storage_directory()
        self.context_cache = {}
        self.max_context_age = timedelta(hours=24)  # Context expires after 24 hours
        
    def _ensure_storage_directory(self):
        """Ensure storage directory exists"""
        os.makedirs(self.storage_path, exist_ok=True)
        os.makedirs(f"{self.storage_path}/profiles", exist_ok=True)
        os.makedirs(f"{self.storage_path}/conversations", exist_ok=True)
        os.makedirs(f"{self.storage_path}/sessions", exist_ok=True)
    
    def _get_file_path(self, context_type: ContextType, identifier: str) -> str:
        """Get file path for context storage"""
        if context_type == ContextType.USER_PROFILE:
            return f"{self.storage_path}/profiles/{identifier}.json"
        elif context_type == ContextType.CONVERSATION_HISTORY:
            return f"{self.storage_path}/conversations/{identifier}.json"
        elif context_type == ContextType.SESSION_CONTEXT:
            return f"{self.storage_path}/sessions/{identifier}.json"
        else:
            return f"{self.storage_path}/{context_type.value}_{identifier}.json"
    
    def save_user_profile(self, profile: UserProfile) -> bool:
        """Save user profile context"""
        try:
            file_path = self._get_file_path(ContextType.USER_PROFILE, profile.user_id)
            profile.last_updated = datetime.now()
            
            with open(file_path, 'w') as f:
                json.dump(asdict(profile), f, default=str, indent=2)
            
            self.context_cache[f"profile_{profile.user_id}"] = profile
            logger.info(f"Saved user profile for user {profile.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving user profile: {str(e)}")
            return False
    
    def load_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Load user profile context"""
        try:
            # Check cache first
            cache_key = f"profile_{user_id}"
            if cache_key in self.context_cache:
                return self.context_cache[cache_key]
            
            file_path = self._get_file_path(ContextType.USER_PROFILE, user_id)
            
            if not os.path.exists(file_path):
                # Create default profile
                profile = UserProfile(user_id=user_id)
                self.save_user_profile(profile)
                return profile
            
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Convert datetime strings back to datetime objects
            if 'last_updated' in data and data['last_updated']:
                data['last_updated'] = datetime.fromisoformat(data['last_updated'])
            
            profile = UserProfile(**data)
            self.context_cache[cache_key] = profile
            return profile
            
        except Exception as e:
            logger.error(f"Error loading user profile: {str(e)}")
            return None
    
    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update specific user preferences"""
        try:
            profile = self.load_user_profile(user_id)
            if not profile:
                return False
            
            # Update profile with new preferences
            for key, value in preferences.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            
            return self.save_user_profile(profile)
            
        except Exception as e:
            logger.error(f"Error updating user preferences: {str(e)}")
            return False
    
    def save_conversation_context(self, context: ConversationContext) -> bool:
        """Save conversation context"""
        try:
            file_path = self._get_file_path(ContextType.CONVERSATION_HISTORY, context.session_id)
            context.last_activity = datetime.now()
            
            with open(file_path, 'w') as f:
                json.dump(asdict(context), f, default=str, indent=2)
            
            self.context_cache[f"conversation_{context.session_id}"] = context
            return True
            
        except Exception as e:
            logger.error(f"Error saving conversation context: {str(e)}")
            return False
    
    def load_conversation_context(self, session_id: str) -> Optional[ConversationContext]:
        """Load conversation context"""
        try:
            cache_key = f"conversation_{session_id}"
            if cache_key in self.context_cache:
                return self.context_cache[cache_key]
            
            file_path = self._get_file_path(ContextType.CONVERSATION_HISTORY, session_id)
            
            if not os.path.exists(file_path):
                return None
            
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Convert datetime strings back to datetime objects
            if 'last_activity' in data and data['last_activity']:
                data['last_activity'] = datetime.fromisoformat(data['last_activity'])
            
            context = ConversationContext(**data)
            self.context_cache[cache_key] = context
            return context
            
        except Exception as e:
            logger.error(f"Error loading conversation context: {str(e)}")
            return None
    
    def add_message_to_conversation(self, session_id: str, user_id: str, 
                                  message: str, response: str, 
                                  context_type: str = "general") -> bool:
        """Add message to conversation history"""
        try:
            conversation = self.load_conversation_context(session_id)
            if not conversation:
                conversation = ConversationContext(session_id=session_id, user_id=user_id)
            
            message_entry = {
                "timestamp": datetime.now().isoformat(),
                "user_message": message,
                "ai_response": response,
                "context_type": context_type
            }
            
            conversation.messages.append(message_entry)
            
            # Keep only last 50 messages to manage context size
            if len(conversation.messages) > 50:
                conversation.messages = conversation.messages[-50:]
            
            return self.save_conversation_context(conversation)
            
        except Exception as e:
            logger.error(f"Error adding message to conversation: {str(e)}")
            return False
    
    def save_session_context(self, context: SessionContext) -> bool:
        """Save current session context"""
        try:
            file_path = self._get_file_path(ContextType.SESSION_CONTEXT, context.session_id)
            
            with open(file_path, 'w') as f:
                json.dump(asdict(context), f, default=str, indent=2)
            
            self.context_cache[f"session_{context.session_id}"] = context
            return True
            
        except Exception as e:
            logger.error(f"Error saving session context: {str(e)}")
            return False
    
    def load_session_context(self, session_id: str) -> Optional[SessionContext]:
        """Load current session context"""
        try:
            cache_key = f"session_{session_id}"
            if cache_key in self.context_cache:
                return self.context_cache[cache_key]
            
            file_path = self._get_file_path(ContextType.SESSION_CONTEXT, session_id)
            
            if not os.path.exists(file_path):
                return None
            
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Convert datetime strings back to datetime objects
            if 'session_start_time' in data and data['session_start_time']:
                data['session_start_time'] = datetime.fromisoformat(data['session_start_time'])
            
            context = SessionContext(**data)
            self.context_cache[cache_key] = context
            return context
            
        except Exception as e:
            logger.error(f"Error loading session context: {str(e)}")
            return None
    
    def build_contextual_prompt(self, user_id: str, session_id: str, 
                              base_prompt: str, query: str) -> str:
        """Build enhanced prompt with full context"""
        try:
            # Load all relevant context
            user_profile = self.load_user_profile(user_id)
            conversation = self.load_conversation_context(session_id)
            session = self.load_session_context(session_id)
            
            # Build context sections
            context_sections = []
            
            # User profile context
            if user_profile:
                profile_context = self._build_profile_context(user_profile)
                if profile_context:
                    context_sections.append(f"USER PROFILE:\n{profile_context}")
            
            # Session context
            if session:
                session_context = self._build_session_context(session)
                if session_context:
                    context_sections.append(f"CURRENT SESSION:\n{session_context}")
            
            # Recent conversation context
            if conversation and conversation.messages:
                recent_context = self._build_conversation_context(conversation)
                if recent_context:
                    context_sections.append(f"RECENT CONVERSATION:\n{recent_context}")
            
            # Combine all context
            full_context = "\n\n".join(context_sections)
            
            # Build final prompt
            if full_context:
                enhanced_prompt = f"""{base_prompt}

CONTEXT INFORMATION:
{full_context}

CURRENT QUERY: {query}

Please use the context information above to provide a personalized and relevant response. Consider the user's preferences, current session details, and conversation history when crafting your response."""
            else:
                enhanced_prompt = f"{base_prompt}\n\nCURRENT QUERY: {query}"
            
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error building contextual prompt: {str(e)}")
            return f"{base_prompt}\n\nCURRENT QUERY: {query}"
    
    def _build_profile_context(self, profile: UserProfile) -> str:
        """Build user profile context string"""
        context_parts = []
        
        if profile.skill_level:
            context_parts.append(f"Skill Level: {profile.skill_level}")
        
        if profile.dietary_restrictions:
            context_parts.append(f"Dietary Restrictions: {', '.join(profile.dietary_restrictions)}")
        
        if profile.cuisine_preferences:
            context_parts.append(f"Preferred Cuisines: {', '.join(profile.cuisine_preferences)}")
        
        if profile.cooking_equipment:
            context_parts.append(f"Available Equipment: {', '.join(profile.cooking_equipment)}")
        
        if profile.ingredient_preferences:
            context_parts.append(f"Preferred Ingredients: {', '.join(profile.ingredient_preferences)}")
        
        if profile.ingredient_dislikes:
            context_parts.append(f"Ingredients to Avoid: {', '.join(profile.ingredient_dislikes)}")
        
        if profile.health_goals:
            context_parts.append(f"Health Goals: {', '.join(profile.health_goals)}")
        
        return "\n".join(context_parts)
    
    def _build_session_context(self, session: SessionContext) -> str:
        """Build current session context string"""
        context_parts = []
        
        if session.current_ingredients:
            context_parts.append(f"Current Ingredients: {', '.join(session.current_ingredients)}")
        
        if session.current_cuisine:
            context_parts.append(f"Current Cuisine: {session.current_cuisine}")
        
        if session.current_dietary_restrictions:
            context_parts.append(f"Current Dietary Restrictions: {', '.join(session.current_dietary_restrictions)}")
        
        if session.current_time_constraint:
            context_parts.append(f"Time Constraint: {session.current_time_constraint}")
        
        if session.current_serving_size:
            context_parts.append(f"Serving Size: {session.current_serving_size}")
        
        if session.cooking_mode:
            context_parts.append(f"Cooking Mode: {session.cooking_mode}")
        
        return "\n".join(context_parts)
    
    def _build_conversation_context(self, conversation: ConversationContext) -> str:
        """Build recent conversation context string"""
        if not conversation.messages:
            return ""
        
        # Get last 10 messages for better context (increased from 5)
        recent_messages = conversation.messages[-10:]
        
        context_parts = []
        context_parts.append("CONVERSATION HISTORY:")
        context_parts.append("=" * 50)
        
        for i, msg in enumerate(recent_messages):
            context_parts.append(f"Exchange {i+1}:")
            context_parts.append(f"User: {msg['user_message']}")
            context_parts.append(f"AI: {msg['ai_response']}")
            context_parts.append("")  # Add spacing between exchanges
        
        context_parts.append("=" * 50)
        context_parts.append("IMPORTANT: Use the conversation history above to understand the context and avoid repeating questions. Build upon previous exchanges to provide more helpful responses.")
        
        return "\n".join(context_parts)
    
    def cleanup_old_context(self) -> int:
        """Clean up old context files"""
        cleaned_count = 0
        cutoff_time = datetime.now() - self.max_context_age
        
        try:
            for context_type in [ContextType.CONVERSATION_HISTORY, ContextType.SESSION_CONTEXT]:
                context_dir = f"{self.storage_path}/{context_type.value}s"
                if os.path.exists(context_dir):
                    for filename in os.listdir(context_dir):
                        file_path = os.path.join(context_dir, filename)
                        if os.path.isfile(file_path):
                            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                            if file_time < cutoff_time:
                                os.remove(file_path)
                                cleaned_count += 1
                                logger.info(f"Cleaned up old context file: {filename}")
        
        except Exception as e:
            logger.error(f"Error cleaning up old context: {str(e)}")
        
        return cleaned_count
