import json
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
from utils.context_manager import ContextManager, UserProfile, SessionContext, ConversationContext

logger = logging.getLogger(__name__)

class PromptType(Enum):
    RECIPE_GENERATION = "recipe_generation"
    COOKING_ASSISTANCE = "cooking_assistance"
    INGREDIENT_SUBSTITUTION = "ingredient_substitution"
    TECHNIQUE_EXPLANATION = "technique_explanation"
    GENERAL_QUERY = "general_query"

class PromptEngineer:
    """Advanced prompt engineering system for CulinaMind AI agent"""
    
    def __init__(self, context_manager: ContextManager):
        self.context_manager = context_manager
        self.prompt_templates = self._initialize_prompt_templates()
    
    def _initialize_prompt_templates(self) -> Dict[str, str]:
        """Initialize prompt templates for different use cases"""
        return {
            PromptType.RECIPE_GENERATION.value: """You are CulinaMind, an expert culinary AI assistant specializing in personalized recipe generation. You have deep knowledge of cooking techniques, food science, and global cuisines.

Your role is to engage in a conversational manner to understand the user's needs before generating recipes. Ask clarifying questions to provide the most helpful and personalized recommendations.

CONVERSATIONAL APPROACH:
- Ask follow-up questions to understand preferences, dietary needs, skill level, and available ingredients
- Probe for specific details like cooking time constraints, serving size, cuisine preferences, and dietary restrictions
- Suggest alternatives and ask for confirmation before proceeding
- Offer multiple options and ask which direction interests them most

Key capabilities:
- Generate diverse, restaurant-quality recipes
- Adapt recipes for dietary restrictions and preferences
- Provide detailed cooking instructions with timing
- Suggest ingredient substitutions and modifications
- Consider skill level and available equipment
- Optimize for taste, nutrition, and presentation
- Engage conversationally to understand user needs better""",

            PromptType.COOKING_ASSISTANCE.value: """You are CulinaMind, a knowledgeable cooking assistant with expertise in culinary techniques, food science, and kitchen problem-solving.

Your role is to engage conversationally to understand the user's specific situation before providing guidance. Ask clarifying questions to give the most relevant and helpful advice.

CONVERSATIONAL APPROACH:
- Ask about the user's current cooking situation, skill level, and available equipment
- Probe for specific details about what went wrong or what they're trying to achieve
- Ask follow-up questions about their experience level with the technique
- Suggest multiple approaches and ask which one they'd prefer to try
- Check if they have specific dietary restrictions or preferences that might affect the solution

Key capabilities:
- Explain cooking techniques in detail
- Troubleshoot cooking problems
- Provide safety guidance
- Suggest equipment alternatives
- Offer timing and temperature advice
- Adapt techniques for different skill levels
- Engage conversationally to understand the full context""",


            PromptType.INGREDIENT_SUBSTITUTION.value: """You are CulinaMind, an expert in ingredient substitutions and recipe modifications.

Your role is to engage conversationally to understand the user's specific needs and constraints before suggesting substitutions. Ask clarifying questions to provide the most suitable alternatives.

CONVERSATIONAL APPROACH:
- Ask about the specific recipe context and what the original ingredient is used for
- Probe for dietary restrictions, allergies, or preferences that might limit options
- Ask about availability of ingredients in their area or budget constraints
- Inquire about their skill level and comfort with different cooking techniques
- Suggest multiple alternatives and ask which one they'd prefer to try
- Ask follow-up questions about the final dish to ensure the substitution will work well

Key capabilities:
- Suggest appropriate ingredient substitutions
- Maintain flavor and texture balance
- Consider dietary restrictions and allergies
- Provide quantity adjustments
- Explain why substitutions work
- Offer multiple alternatives when possible
- Engage conversationally to understand the full context""",

            PromptType.TECHNIQUE_EXPLANATION.value: """You are CulinaMind, a culinary educator specializing in cooking techniques and food science.

Your role is to engage conversationally to understand the user's learning goals and experience level before explaining techniques. Ask clarifying questions to provide the most helpful and personalized explanations.

CONVERSATIONAL APPROACH:
- Ask about the user's current skill level and experience with the technique
- Probe for their specific goals - are they trying to master a technique or just understand it?
- Ask about their available equipment and cooking setup
- Inquire about any previous attempts or challenges they've faced
- Suggest different learning approaches and ask which resonates with them
- Ask follow-up questions to ensure they understand and can apply the information

Key capabilities:
- Break down complex techniques into simple steps
- Explain the science behind cooking methods
- Provide visual and sensory cues
- Offer practice tips and common mistakes
- Adapt explanations for different skill levels
- Connect techniques to broader culinary principles
- Engage conversationally to understand their learning needs""",

            PromptType.GENERAL_QUERY.value: """You are CulinaMind, a comprehensive culinary AI assistant with broad knowledge of cooking, food science, and culinary culture.

Your role is to engage conversationally to understand what the user is really looking for before providing information. Ask clarifying questions to give the most relevant and helpful responses.

CONVERSATIONAL APPROACH:
- Ask follow-up questions to understand their specific interests and goals
- Probe for their cooking experience level and what they're trying to achieve
- Ask about their preferences, dietary needs, and available resources
- Suggest different angles or approaches and ask which interests them most
- Offer to dive deeper into specific aspects they find interesting
- Ask if they have any related questions or want to explore other topics

Key capabilities:
- Answer diverse cooking questions
- Provide culinary knowledge and trivia
- Offer general cooking advice
- Explain food science concepts
- Share cultural cooking insights
- Guide users to appropriate resources
- Engage conversationally to understand their true needs"""
        }
    
    def determine_prompt_type(self, query: str, context: Dict[str, Any]) -> PromptType:
        """Determine the appropriate prompt type based on query and context"""
        query_lower = query.lower()
        
        # Recipe generation keywords
        recipe_keywords = [
            "recipe", "cook", "make", "prepare", "ingredients", "dish", "meal",
            "breakfast", "lunch", "dinner", "snack", "appetizer", "dessert"
        ]
        
        # Cooking assistance keywords
        cooking_keywords = [
            "how to", "technique", "method", "troubleshoot", "problem", "help",
            "why", "what if", "fix", "correct", "adjust"
        ]
        
        
        # Substitution keywords
        substitution_keywords = [
            "substitute", "replace", "alternative", "instead of", "don't have",
            "allergic", "intolerant", "can't eat"
        ]
        
        # Technique explanation keywords
        technique_keywords = [
            "explain", "what is", "define", "technique", "method", "science",
            "why does", "how does", "process"
        ]
        
        # Check for specific patterns
        if any(keyword in query_lower for keyword in recipe_keywords):
            return PromptType.RECIPE_GENERATION
        elif any(keyword in query_lower for keyword in cooking_keywords):
            return PromptType.COOKING_ASSISTANCE
        elif any(keyword in query_lower for keyword in substitution_keywords):
            return PromptType.INGREDIENT_SUBSTITUTION
        elif any(keyword in query_lower for keyword in technique_keywords):
            return PromptType.TECHNIQUE_EXPLANATION
        else:
            return PromptType.GENERAL_QUERY
    
    def build_enhanced_prompt(self, user_id: str, session_id: str, 
                            query: str, context: Dict[str, Any] = None) -> str:
        """Build enhanced prompt with full context integration"""
        try:
            # Determine prompt type
            prompt_type = self.determine_prompt_type(query, context or {})
            
            # Get base template
            base_template = self.prompt_templates[prompt_type.value]
            
            # Build contextual prompt using context manager
            enhanced_prompt = self.context_manager.build_contextual_prompt(
                user_id=user_id,
                session_id=session_id,
                base_prompt=base_template,
                query=query
            )
            
            # Add specific context enhancements based on prompt type
            enhanced_prompt = self._add_type_specific_context(
                enhanced_prompt, prompt_type, context or {}
            )
            
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error building enhanced prompt: {str(e)}")
            return f"{self.prompt_templates[PromptType.GENERAL_QUERY.value]}\n\nQuery: {query}"
    
    def _add_type_specific_context(self, prompt: str, prompt_type: PromptType, 
                                 context: Dict[str, Any]) -> str:
        """Add type-specific context enhancements"""
        enhancements = []
        
        if prompt_type == PromptType.RECIPE_GENERATION:
            enhancements.extend(self._add_recipe_generation_context(context))
        elif prompt_type == PromptType.COOKING_ASSISTANCE:
            enhancements.extend(self._add_cooking_assistance_context(context))
        elif prompt_type == PromptType.INGREDIENT_SUBSTITUTION:
            enhancements.extend(self._add_substitution_context(context))
        elif prompt_type == PromptType.TECHNIQUE_EXPLANATION:
            enhancements.extend(self._add_technique_explanation_context(context))
        
        if enhancements:
            enhancement_text = "\n\n".join(enhancements)
            return f"{prompt}\n\nADDITIONAL CONTEXT:\n{enhancement_text}"
        
        return prompt
    
    def _add_recipe_generation_context(self, context: Dict[str, Any]) -> List[str]:
        """Add recipe generation specific context"""
        enhancements = []
        
        if context.get('ingredients'):
            enhancements.append(f"Available Ingredients: {', '.join(context['ingredients'])}")
        
        if context.get('cuisine'):
            enhancements.append(f"Preferred Cuisine: {context['cuisine']}")
        
        if context.get('dietary_restrictions'):
            enhancements.append(f"Dietary Restrictions: {', '.join(context['dietary_restrictions'])}")
        
        if context.get('time_limit'):
            enhancements.append(f"Time Constraint: {context['time_limit']}")
        
        if context.get('serving_size'):
            enhancements.append(f"Serving Size: {context['serving_size']}")
        
        if context.get('skill_level'):
            enhancements.append(f"User Skill Level: {context['skill_level']}")
        
        return enhancements
    
    def _add_cooking_assistance_context(self, context: Dict[str, Any]) -> List[str]:
        """Add cooking assistance specific context"""
        enhancements = []
        
        if context.get('current_recipe'):
            enhancements.append(f"Current Recipe: {context['current_recipe']}")
        
        if context.get('cooking_stage'):
            enhancements.append(f"Cooking Stage: {context['cooking_stage']}")
        
        if context.get('equipment_available'):
            enhancements.append(f"Available Equipment: {', '.join(context['equipment_available'])}")
        
        if context.get('problem_description'):
            enhancements.append(f"Problem: {context['problem_description']}")
        
        return enhancements
    
    
    def _add_substitution_context(self, context: Dict[str, Any]) -> List[str]:
        """Add ingredient substitution specific context"""
        enhancements = []
        
        if context.get('original_ingredient'):
            enhancements.append(f"Original Ingredient: {context['original_ingredient']}")
        
        if context.get('substitution_reason'):
            enhancements.append(f"Reason for Substitution: {context['substitution_reason']}")
        
        if context.get('recipe_context'):
            enhancements.append(f"Recipe Context: {context['recipe_context']}")
        
        return enhancements
    
    def _add_technique_explanation_context(self, context: Dict[str, Any]) -> List[str]:
        """Add technique explanation specific context"""
        enhancements = []
        
        if context.get('technique_name'):
            enhancements.append(f"Technique: {context['technique_name']}")
        
        if context.get('skill_level'):
            enhancements.append(f"User Skill Level: {context['skill_level']}")
        
        if context.get('specific_question'):
            enhancements.append(f"Specific Question: {context['specific_question']}")
        
        return enhancements
    
    def create_conversation_starter(self, user_id: str, session_id: str) -> str:
        """Create a personalized conversation starter"""
        try:
            user_profile = self.context_manager.load_user_profile(user_id)
            session_context = self.context_manager.load_session_context(session_id)
            
            starter_parts = ["Hello! I'm CulinaMind, your AI culinary assistant."]
            
            if user_profile and user_profile.skill_level:
                skill_greeting = {
                    "beginner": "I'm here to help you learn cooking basics and build confidence in the kitchen.",
                    "intermediate": "I'm excited to help you expand your cooking skills and try new techniques.",
                    "advanced": "I'm ready to help you master advanced techniques and explore complex culinary concepts."
                }
                starter_parts.append(skill_greeting.get(user_profile.skill_level, ""))
            
            if session_context and session_context.current_ingredients:
                starter_parts.append(f"I see you have {', '.join(session_context.current_ingredients[:3])} available. Would you like me to suggest some recipes?")
            
            starter_parts.append("What would you like to cook today?")
            
            return " ".join(starter_parts)
            
        except Exception as e:
            logger.error(f"Error creating conversation starter: {str(e)}")
            return "Hello! I'm CulinaMind, your AI culinary assistant. What would you like to cook today?"
    
    def optimize_prompt_length(self, prompt: str, max_tokens: int = 4000) -> str:
        """Optimize prompt length to fit within token limits"""
        # This is a simplified version - in production, you'd use a proper tokenizer
        estimated_tokens = len(prompt.split()) * 1.3  # Rough estimation
        
        if estimated_tokens <= max_tokens:
            return prompt
        
        # Truncate conversation history if too long
        if "RECENT CONVERSATION:" in prompt:
            parts = prompt.split("RECENT CONVERSATION:")
            if len(parts) == 2:
                conversation_part = parts[1]
                # Keep only last 3 messages
                lines = conversation_part.split('\n')
                user_lines = [line for line in lines if line.startswith('User:')]
                if len(user_lines) > 3:
                    # Find the start of the 3rd to last user message
                    start_idx = len(lines) - (len(user_lines) - 2) * 2
                    conversation_part = '\n'.join(lines[start_idx:])
                    prompt = parts[0] + "RECENT CONVERSATION:" + conversation_part
        
        return prompt
