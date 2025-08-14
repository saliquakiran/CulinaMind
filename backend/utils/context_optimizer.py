import json
import re
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
import logging
from utils.context_manager import ContextManager, UserProfile, SessionContext, ConversationContext

logger = logging.getLogger(__name__)

class ContextOptimizer:
    """Advanced context optimization system for managing token limits and relevance"""
    
    def __init__(self, context_manager: ContextManager):
        self.context_manager = context_manager
        self.max_context_tokens = 3000  # Conservative limit for GPT-3.5-turbo
        self.max_conversation_messages = 10
        self.relevance_threshold = 0.3
        
    def optimize_context_for_query(self, user_id: str, session_id: str, 
                                 query: str, base_prompt: str) -> str:
        """Optimize context for a specific query while staying within token limits"""
        try:
            # Load all context
            user_profile = self.context_manager.load_user_profile(user_id)
            conversation = self.context_manager.load_conversation_context(session_id)
            session = self.context_manager.load_session_context(session_id)
            
            # Build optimized context sections
            optimized_sections = []
            
            # 1. Essential user profile context (always include)
            if user_profile:
                essential_profile = self._extract_essential_profile_context(user_profile, query)
                if essential_profile:
                    optimized_sections.append(f"USER PROFILE:\n{essential_profile}")
            
            # 2. Current session context (high priority)
            if session:
                session_context = self._build_session_context(session)
                if session_context:
                    optimized_sections.append(f"CURRENT SESSION:\n{session_context}")
            
            # 3. Relevant conversation history (filtered by relevance)
            if conversation and conversation.messages:
                relevant_messages = self._filter_relevant_messages(conversation.messages, query)
                if relevant_messages:
                    conversation_context = self._build_conversation_context(relevant_messages)
                    optimized_sections.append(f"RELEVANT CONVERSATION:\n{conversation_context}")
            
            # 4. Combine and optimize
            full_context = "\n\n".join(optimized_sections)
            
            # 5. Check token limit and truncate if necessary
            optimized_context = self._truncate_to_token_limit(full_context, base_prompt, query)
            
            # Build final prompt
            if optimized_context:
                return f"""{base_prompt}

CONTEXT INFORMATION:
{optimized_context}

CURRENT QUERY: {query}

Please use the context information above to provide a personalized and relevant response."""
            else:
                return f"{base_prompt}\n\nCURRENT QUERY: {query}"
                
        except Exception as e:
            logger.error(f"Error optimizing context: {str(e)}")
            return f"{base_prompt}\n\nCURRENT QUERY: {query}"
    
    def _extract_essential_profile_context(self, profile: UserProfile, query: str) -> str:
        """Extract only the most relevant profile information for the query"""
        context_parts = []
        query_lower = query.lower()
        
        # Always include skill level
        if profile.skill_level:
            context_parts.append(f"Skill Level: {profile.skill_level}")
        
        # Include dietary restrictions if relevant
        if profile.dietary_restrictions and any(
            restriction.lower() in query_lower 
            for restriction in profile.dietary_restrictions
        ):
            context_parts.append(f"Dietary Restrictions: {', '.join(profile.dietary_restrictions)}")
        
        # Include cuisine preferences if relevant
        if profile.cuisine_preferences and any(
            cuisine.lower() in query_lower 
            for cuisine in profile.cuisine_preferences
        ):
            context_parts.append(f"Preferred Cuisines: {', '.join(profile.cuisine_preferences)}")
        
        # Include equipment if cooking-related
        if profile.cooking_equipment and any(
            word in query_lower 
            for word in ['cook', 'bake', 'fry', 'grill', 'equipment', 'tool']
        ):
            context_parts.append(f"Available Equipment: {', '.join(profile.cooking_equipment[:5])}")  # Limit to 5 items
        
        # Include ingredient preferences if ingredient-related
        if profile.ingredient_preferences and any(
            word in query_lower 
            for word in ['ingredient', 'recipe', 'cook', 'make']
        ):
            context_parts.append(f"Preferred Ingredients: {', '.join(profile.ingredient_preferences[:5])}")
        
        # Include dislikes if substitution-related
        if profile.ingredient_dislikes and any(
            word in query_lower 
            for word in ['substitute', 'replace', 'instead', 'avoid']
        ):
            context_parts.append(f"Ingredients to Avoid: {', '.join(profile.ingredient_dislikes[:3])}")
        
        return "\n".join(context_parts)
    
    def _filter_relevant_messages(self, messages: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Filter conversation messages by relevance to current query"""
        if not messages:
            return []
        
        query_lower = query.lower()
        query_words = set(re.findall(r'\b\w+\b', query_lower))
        
        scored_messages = []
        for msg in messages:
            message_text = f"{msg.get('user_message', '')} {msg.get('ai_response', '')}".lower()
            message_words = set(re.findall(r'\b\w+\b', message_text))
            
            # Calculate relevance score
            common_words = query_words.intersection(message_words)
            relevance_score = len(common_words) / max(len(query_words), 1)
            
            if relevance_score > self.relevance_threshold:
                scored_messages.append((relevance_score, msg))
        
        # Sort by relevance and return top messages
        scored_messages.sort(key=lambda x: x[0], reverse=True)
        return [msg for score, msg in scored_messages[:self.max_conversation_messages]]
    
    def _build_conversation_context(self, messages: List[Dict[str, Any]]) -> str:
        """Build conversation context from filtered messages"""
        context_parts = []
        for msg in messages:
            context_parts.append(f"User: {msg['user_message']}")
            context_parts.append(f"AI: {msg['ai_response']}")
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
    
    def _truncate_to_token_limit(self, context: str, base_prompt: str, query: str) -> str:
        """Truncate context to fit within token limits"""
        # Rough token estimation (1 token ≈ 0.75 words)
        base_tokens = len(base_prompt.split()) * 0.75
        query_tokens = len(query.split()) * 0.75
        available_tokens = self.max_context_tokens - base_tokens - query_tokens - 100  # Buffer
        
        if available_tokens <= 0:
            return ""
        
        # Estimate context tokens
        context_words = len(context.split())
        context_tokens = context_words * 0.75
        
        if context_tokens <= available_tokens:
            return context
        
        # Truncate context proportionally
        target_words = int(available_tokens / 0.75)
        words = context.split()
        
        if len(words) <= target_words:
            return context
        
        # Truncate from the end, but try to keep complete sentences
        truncated_words = words[:target_words]
        
        # Find the last complete sentence
        truncated_text = " ".join(truncated_words)
        last_period = truncated_text.rfind('.')
        last_exclamation = truncated_text.rfind('!')
        last_question = truncated_text.rfind('?')
        
        last_sentence_end = max(last_period, last_exclamation, last_question)
        
        if last_sentence_end > target_words * 0.7:  # If we can keep most of the content
            return truncated_text[:last_sentence_end + 1]
        else:
            return " ".join(truncated_words) + "..."
    
    def optimize_knowledge_retrieval(self, knowledge_items: List[Tuple[float, Dict[str, Any]]], 
                                   query: str, user_profile: UserProfile = None) -> List[Dict[str, Any]]:
        """Optimize retrieved knowledge items for relevance and diversity"""
        if not knowledge_items:
            return []
        
        # Filter by relevance threshold
        relevant_items = [
            item for score, item in knowledge_items 
            if score > self.relevance_threshold
        ]
        
        if not relevant_items:
            # If no items meet threshold, take top 3
            relevant_items = [item for score, item in knowledge_items[:3]]
        
        # Ensure diversity by category
        diverse_items = self._ensure_diversity(relevant_items)
        
        # Limit to reasonable number
        return diverse_items[:5]
    
    def _ensure_diversity(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure diversity in knowledge items by category"""
        if len(items) <= 3:
            return items
        
        # Group by category
        categories = {}
        for item in items:
            category = item.get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(item)
        
        # Select diverse items
        diverse_items = []
        max_per_category = 2
        
        for category, category_items in categories.items():
            diverse_items.extend(category_items[:max_per_category])
        
        # If we still have too many, take the top ones
        if len(diverse_items) > 5:
            diverse_items = diverse_items[:5]
        
        return diverse_items
    
    def get_context_summary(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Get a summary of current context for debugging/monitoring"""
        try:
            user_profile = self.context_manager.load_user_profile(user_id)
            conversation = self.context_manager.load_conversation_context(session_id)
            session = self.context_manager.load_session_context(session_id)
            
            summary = {
                'user_profile': {
                    'skill_level': user_profile.skill_level if user_profile else None,
                    'dietary_restrictions_count': len(user_profile.dietary_restrictions) if user_profile else 0,
                    'cuisine_preferences_count': len(user_profile.cuisine_preferences) if user_profile else 0,
                    'equipment_count': len(user_profile.cooking_equipment) if user_profile else 0
                },
                'conversation': {
                    'message_count': len(conversation.messages) if conversation else 0,
                    'last_activity': conversation.last_activity.isoformat() if conversation and conversation.last_activity else None
                },
                'session': {
                    'ingredients_count': len(session.current_ingredients) if session else 0,
                    'cuisine': session.current_cuisine if session else None,
                    'cooking_mode': session.cooking_mode if session else None
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting context summary: {str(e)}")
            return {'error': str(e)}
    
    def cleanup_old_context(self) -> int:
        """Clean up old context data"""
        return self.context_manager.cleanup_old_context()
