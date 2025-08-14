import os
import json
from typing import List, Dict, Any, Tuple, Optional
import openai
from dotenv import load_dotenv
import numpy as np
import faiss
import pickle
from pathlib import Path
import logging
from utils.context_manager import ContextManager, UserProfile, SessionContext, ConversationContext
from utils.prompt_engineer import PromptEngineer, PromptType

load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedRAGService:
    """Enhanced RAG service with advanced context engineering"""
    
    def __init__(self, context_manager: ContextManager = None):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.embedding_model = "text-embedding-3-small"
        self.knowledge_base = self._load_culinary_knowledge()
        self.embeddings = None
        self.faiss_index = None
        self.context_manager = context_manager or ContextManager()
        self.prompt_engineer = PromptEngineer(self.context_manager)
        self._initialize_vector_search()
    
    def _load_culinary_knowledge(self) -> List[Dict[str, Any]]:
        """Load comprehensive culinary knowledge base with enhanced metadata"""
        return [
            # Enhanced knowledge items with more context
            {
                "id": "baking_001",
                "content": "To make fluffy pancakes, separate egg whites and beat until stiff peaks form. Fold into batter gently. Use buttermilk and let batter rest for 10 minutes. Cook on medium heat until bubbles form on surface. The key is gentle folding to preserve air bubbles.",
                "category": "baking",
                "title": "Fluffy Pancake Technique",
                "keywords": ["pancakes", "fluffy", "eggs", "buttermilk", "batter", "folding", "air bubbles"],
                "difficulty": "beginner",
                "cuisine": "western",
                "cooking_time": "15-20 minutes",
                "equipment": ["mixing bowl", "whisk", "frying pan", "spatula"],
                "skill_requirements": ["basic mixing", "stovetop cooking"],
                "dietary_info": {"vegetarian": True, "gluten_free": False, "dairy_free": False}
            },
            {
                "id": "technique_001",
                "content": "Sous vide cooking: Vacuum seal food in bags, cook in precise temperature water bath. Beef at 130°F for medium-rare, chicken at 165°F for safety. Finish with high-heat sear for texture. Perfect for consistent results and meal prep.",
                "category": "techniques",
                "title": "Sous Vide Cooking",
                "keywords": ["sous vide", "vacuum seal", "temperature control", "searing", "consistency"],
                "difficulty": "intermediate",
                "cuisine": "modern",
                "cooking_time": "1-24 hours",
                "equipment": ["sous vide machine", "vacuum sealer", "water bath", "searing pan"],
                "skill_requirements": ["temperature control", "food safety", "searing"],
                "dietary_info": {"vegetarian": True, "gluten_free": True, "dairy_free": True}
            },
            # Add more enhanced knowledge items...
        ]
    
    def _initialize_vector_search(self):
        """Initialize vector embeddings and FAISS index"""
        try:
            embeddings_file = Path("models/ai/culinary_embeddings.pkl")
            index_file = Path("models/ai/culinary_faiss_index.bin")
            
            if embeddings_file.exists() and index_file.exists():
                logger.info("Loading pre-computed embeddings and FAISS index...")
                with open(embeddings_file, 'rb') as f:
                    self.embeddings = pickle.load(f)
                self.faiss_index = faiss.read_index(str(index_file))
                logger.info("Successfully loaded pre-computed embeddings and index")
            else:
                logger.info("Computing embeddings and building FAISS index...")
                self._compute_embeddings()
                self._build_faiss_index()
                self._save_embeddings_and_index()
                logger.info("Successfully computed embeddings and built index")
                
        except Exception as e:
            logger.error(f"Error initializing vector search: {str(e)}")
            self.embeddings = None
            self.faiss_index = None
    
    def _compute_embeddings(self):
        """Compute embeddings for all knowledge base items"""
        try:
            texts = []
            for item in self.knowledge_base:
                # Enhanced text for better embeddings
                text = f"{item['title']} {item['content']} {' '.join(item['keywords'])} {item['category']} {item['difficulty']} {item['cuisine']}"
                texts.append(text)
            
            response = self.openai_client.embeddings.create(
                input=texts,
                model=self.embedding_model
            )
            
            self.embeddings = np.array([embedding.embedding for embedding in response.data], dtype=np.float32)
            logger.info(f"Computed embeddings for {len(self.knowledge_base)} items")
            
        except Exception as e:
            logger.error(f"Error computing embeddings: {str(e)}")
            raise
    
    def _build_faiss_index(self):
        """Build FAISS index for efficient similarity search"""
        try:
            if self.embeddings is None:
                raise ValueError("Embeddings must be computed before building index")
            
            faiss.normalize_L2(self.embeddings)
            dimension = self.embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatIP(dimension)
            self.faiss_index.add(self.embeddings)
            
            logger.info(f"Built FAISS index with {self.faiss_index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Error building FAISS index: {str(e)}")
            raise
    
    def _save_embeddings_and_index(self):
        """Save embeddings and FAISS index to disk"""
        try:
            with open("models/ai/culinary_embeddings.pkl", 'wb') as f:
                pickle.dump(self.embeddings, f)
            
            faiss.write_index(self.faiss_index, "models/ai/culinary_faiss_index.bin")
            logger.info("Saved embeddings and FAISS index to disk")
            
        except Exception as e:
            logger.error(f"Error saving embeddings and index: {str(e)}")
    
    def _semantic_search(self, query: str, top_k: int = 5, 
                        user_profile: UserProfile = None) -> List[Tuple[float, Dict[str, Any]]]:
        """Perform semantic search with user profile consideration"""
        try:
            if self.faiss_index is None or self.embeddings is None:
                logger.warning("Vector search not available, falling back to keyword search")
                return self._simple_search(query, top_k, user_profile)
            
            # Get query embedding
            query_response = self.openai_client.embeddings.create(
                input=[query],
                model=self.embedding_model
            )
            query_embedding = np.array([query_response.data[0].embedding], dtype=np.float32)
            
            # Normalize query embedding
            faiss.normalize_L2(query_embedding)
            
            # Search FAISS index
            similarities, indices = self.faiss_index.search(query_embedding, top_k * 2)  # Get more results for filtering
            
            # Filter and re-rank based on user profile
            results = []
            for similarity, idx in zip(similarities[0], indices[0]):
                if idx < len(self.knowledge_base):
                    item = self.knowledge_base[idx]
                    adjusted_score = self._adjust_score_for_profile(similarity, item, user_profile)
                    results.append((float(adjusted_score), item))
            
            # Sort by adjusted score and return top-k
            results.sort(key=lambda x: x[0], reverse=True)
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            return self._simple_search(query, top_k, user_profile)
    
    def _adjust_score_for_profile(self, score: float, item: Dict[str, Any], 
                                user_profile: UserProfile = None) -> float:
        """Adjust relevance score based on user profile"""
        if not user_profile:
            return score
        
        adjusted_score = score
        
        # Adjust for skill level
        if user_profile.skill_level == "beginner" and item["difficulty"] == "beginner":
            adjusted_score *= 1.2
        elif user_profile.skill_level == "advanced" and item["difficulty"] == "advanced":
            adjusted_score *= 1.1
        
        # Adjust for dietary restrictions
        if user_profile.dietary_restrictions:
            dietary_info = item.get("dietary_info", {})
            for restriction in user_profile.dietary_restrictions:
                if restriction.lower() in dietary_info and dietary_info[restriction.lower()]:
                    adjusted_score *= 1.1
        
        # Adjust for cuisine preferences
        if user_profile.cuisine_preferences and item["cuisine"] in user_profile.cuisine_preferences:
            adjusted_score *= 1.15
        
        # Adjust for ingredient preferences
        if user_profile.ingredient_preferences:
            item_keywords = set(item.get("keywords", []))
            user_ingredients = set([ing.lower() for ing in user_profile.ingredient_preferences])
            if item_keywords.intersection(user_ingredients):
                adjusted_score *= 1.1
        
        return adjusted_score
    
    def _simple_search(self, query: str, top_k: int = 5, 
                      user_profile: UserProfile = None) -> List[Tuple[float, Dict[str, Any]]]:
        """Fallback keyword-based search with profile consideration"""
        import re
        
        query_lower = query.lower()
        query_words = set(re.findall(r'\b\w+\b', query_lower))
        
        scored_items = []
        for item in self.knowledge_base:
            item_keywords = set(item.get('keywords', []))
            item_text = f"{item['title']} {item['content']}".lower()
            
            # Calculate base relevance score
            keyword_matches = len(query_words.intersection(item_keywords))
            text_matches = sum(1 for word in query_words if word in item_text)
            base_score = keyword_matches * 2 + text_matches
            
            if base_score > 0:
                # Adjust for user profile
                adjusted_score = self._adjust_score_for_profile(base_score, item, user_profile)
                scored_items.append((float(adjusted_score), item))
        
        # Sort by score and return top-k
        scored_items.sort(key=lambda x: x[0], reverse=True)
        return scored_items[:top_k]
    
    def generate_contextual_response(self, user_id: str, session_id: str, 
                                   user_query: str, context: Dict[str, Any] = None) -> str:
        """Generate AI response with full context integration"""
        try:
            # Load user profile for personalized search
            user_profile = self.context_manager.load_user_profile(user_id)
            
            # Load conversation context for debugging
            conversation = self.context_manager.load_conversation_context(session_id)
            logger.info(f"Loaded conversation with {len(conversation.messages) if conversation else 0} messages for session {session_id}")
            
            # Retrieve relevant knowledge with profile consideration
            relevant_knowledge = self._semantic_search(user_query, top_k=5, user_profile=user_profile)
            
            # Build enhanced prompt
            enhanced_prompt = self.prompt_engineer.build_enhanced_prompt(
                user_id=user_id,
                session_id=session_id,
                query=user_query,
                context=context or {}
            )
            
            # Add retrieved knowledge to prompt
            if relevant_knowledge:
                knowledge_context = self._build_knowledge_context(relevant_knowledge, user_profile)
                enhanced_prompt += f"\n\nRELEVANT KNOWLEDGE:\n{knowledge_context}"
            
            # Add conversational behavior instruction
            conversational_instruction = """

IMPORTANT: You are a conversational AI assistant. Use the conversation history provided above to understand the context and avoid repeating questions. 

CONVERSATIONAL APPROACH:
- ALWAYS review the conversation history before responding
- Build upon previous exchanges instead of starting over
- If the user has already provided information, acknowledge it and move forward
- Only ask clarifying questions about NEW information you need
- Avoid asking questions that have already been answered in the conversation
- Reference previous parts of the conversation when relevant
- Be curious and show genuine interest in helping them achieve their cooking goals

Remember: A good conversation builds upon what has already been discussed, not by repeating the same questions."""

            enhanced_prompt += conversational_instruction

            # Generate response
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": enhanced_prompt},
                    {"role": "user", "content": user_query}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Save conversation context
            self.context_manager.add_message_to_conversation(
                session_id=session_id,
                user_id=user_id,
                message=user_query,
                response=ai_response,
                context_type="general"
            )
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Error generating contextual response: {str(e)}")
            return f"I'm having trouble processing your request right now. Please try again in a moment."
    
    def _build_knowledge_context(self, knowledge_items: List[Tuple[float, Dict[str, Any]]], 
                               user_profile: UserProfile = None) -> str:
        """Build context from retrieved knowledge items"""
        context_parts = []
        
        for score, item in knowledge_items:
            context_part = f"**{item['title']}** ({item['category']}, {item['difficulty']} level)\n{item['content']}"
            
            # Add relevant metadata
            if item.get('cooking_time'):
                context_part += f"\nCooking Time: {item['cooking_time']}"
            
            if item.get('equipment'):
                context_part += f"\nEquipment: {', '.join(item['equipment'])}"
            
            if item.get('dietary_info'):
                dietary_info = item['dietary_info']
                dietary_tags = [k for k, v in dietary_info.items() if v]
                if dietary_tags:
                    context_part += f"\nDietary: {', '.join(dietary_tags)}"
            
            context_parts.append(context_part)
        
        return "\n\n".join(context_parts)
    
    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences in context"""
        return self.context_manager.update_user_preferences(user_id, preferences)
    
    def get_personalized_recommendations(self, user_id: str, query: str = None) -> List[Dict[str, Any]]:
        """Get personalized recommendations based on user profile"""
        try:
            user_profile = self.context_manager.load_user_profile(user_id)
            if not user_profile:
                return []
            
            # Search for recommendations based on user preferences
            search_query = query or "cooking tips and techniques"
            if user_profile.cuisine_preferences:
                search_query += f" {', '.join(user_profile.cuisine_preferences)}"
            
            recommendations = self._semantic_search(search_query, top_k=10, user_profile=user_profile)
            
            return [item for score, item in recommendations]
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {str(e)}")
            return []
    
    def get_conversation_starter(self, user_id: str, session_id: str) -> str:
        """Get personalized conversation starter"""
        return self.prompt_engineer.create_conversation_starter(user_id, session_id)
    
    def cleanup_old_context(self) -> int:
        """Clean up old context data"""
        return self.context_manager.cleanup_old_context()

    def generate_contextual_recipes(self, user_id: str, session_id: str, 
                                  ingredients: List[str], cuisine: str = "", 
                                  dietary_restrictions: List[str] = None,
                                  time_limit: str = "", serving_size: str = "",
                                  strict_ingredients: bool = False,
                                  exemption: str = None) -> List[Dict[str, Any]]:
        """Generate context-aware recipes using the full context engineering system"""
        try:
            # Load user profile for personalization
            user_profile = self.context_manager.load_user_profile(user_id)
            
            # Build context for recipe generation
            recipe_context = {
                "ingredients": ingredients,
                "cuisine": cuisine,
                "dietary_restrictions": dietary_restrictions or [],
                "time_limit": time_limit,
                "serving_size": serving_size,
                "strict_ingredients": strict_ingredients,
                "exemption": exemption
            }
            
            # Build enhanced prompt for recipe generation
            enhanced_prompt = self.prompt_engineer.build_enhanced_prompt(
                user_id=user_id,
                session_id=session_id,
                query="Generate personalized recipes based on my preferences and available ingredients",
                context=recipe_context
            )
            
            # Add recipe-specific context
            recipe_specific_context = self._build_recipe_context(recipe_context, user_profile)
            enhanced_prompt += f"\n\nRECIPE GENERATION CONTEXT:\n{recipe_specific_context}"
            
            # Generate recipes using OpenAI
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": enhanced_prompt},
                    {"role": "user", "content": self._build_recipe_request_prompt(recipe_context)}
                ],
                temperature=0.8,
                max_tokens=2000
            )
            
            # Parse the response
            ai_response = response.choices[0].message.content.strip()
            recipes = self._parse_recipe_response(ai_response)
            
            # Save recipe generation to conversation context
            self.context_manager.add_message_to_conversation(
                session_id=session_id,
                user_id=user_id,
                message=f"Generated recipes with ingredients: {', '.join(ingredients)}",
                response=f"Generated {len(recipes)} personalized recipes",
                context_type="recipe_generation"
            )
            
            return recipes
            
        except Exception as e:
            logger.error(f"Error generating contextual recipes: {str(e)}")
            return []
    
    def _build_recipe_context(self, recipe_context: Dict[str, Any], 
                            user_profile: UserProfile = None) -> str:
        """Build recipe-specific context"""
        context_parts = []
        
        # Basic recipe requirements
        if recipe_context.get('ingredients'):
            context_parts.append(f"Available Ingredients: {', '.join(recipe_context['ingredients'])}")
        
        if recipe_context.get('cuisine'):
            context_parts.append(f"Preferred Cuisine: {recipe_context['cuisine']}")
        
        if recipe_context.get('dietary_restrictions'):
            context_parts.append(f"Dietary Restrictions: {', '.join(recipe_context['dietary_restrictions'])}")
        
        if recipe_context.get('time_limit'):
            context_parts.append(f"Time Constraint: {recipe_context['time_limit']}")
        
        if recipe_context.get('serving_size'):
            context_parts.append(f"Serving Size: {recipe_context['serving_size']}")
        
        if recipe_context.get('strict_ingredients') is not None:
            mode = "strict" if recipe_context['strict_ingredients'] else "flexible"
            context_parts.append(f"Ingredient Usage: {mode} mode")
        
        if recipe_context.get('exemption'):
            context_parts.append(f"Exclude Cuisine: {recipe_context['exemption']}")
        
        # User profile considerations
        if user_profile:
            if user_profile.skill_level:
                context_parts.append(f"User Skill Level: {user_profile.skill_level}")
            
            if user_profile.cooking_equipment:
                context_parts.append(f"Available Equipment: {', '.join(user_profile.cooking_equipment[:5])}")
            
            if user_profile.ingredient_preferences:
                context_parts.append(f"Preferred Ingredients: {', '.join(user_profile.ingredient_preferences[:5])}")
            
            if user_profile.ingredient_dislikes:
                context_parts.append(f"Ingredients to Avoid: {', '.join(user_profile.ingredient_dislikes[:3])}")
            
            if user_profile.health_goals:
                context_parts.append(f"Health Goals: {', '.join(user_profile.health_goals)}")
        
        return "\n".join(context_parts)
    
    def _build_recipe_request_prompt(self, recipe_context: Dict[str, Any]) -> str:
        """Build the specific recipe generation request prompt"""
        prompt = f"""Generate 4 COMPLETELY DISTINCT and diverse recipe suggestions using the following user input:
- Ingredients available: {', '.join(recipe_context.get('ingredients', []))}
- Preferred Cuisine: {recipe_context.get('cuisine', '')}
- Dietary Restrictions: {', '.join(recipe_context.get('dietary_restrictions', []))}
- Maximum Cooking Time: {recipe_context.get('time_limit', '')}
- Number of Servings: {recipe_context.get('serving_size', '')}
"""
        
        if recipe_context.get('exemption'):
            prompt += f"\n- Do not use these ingredients: {recipe_context['exemption']}"
        
        if recipe_context.get('strict_ingredients') is not None:
            if recipe_context['strict_ingredients']:
                prompt += "\n- STRICT MODE: Only use the ingredients provided above. Do not include any other ingredients in the recipe."
            else:
                prompt += "\n- FLEXIBLE MODE: You MUST include the listed ingredients PLUS additional complementary ingredients to create a complete, flavorful dish. Each recipe should have 2-4 additional main ingredients (vegetables, proteins, spices, herbs, etc.) that enhance the dish. Do not just use the provided ingredients alone."
        
        prompt += """

Each recipe should follow the format below in **valid JSON array**:
[
    {
        "title": "Descriptive recipe title",
        "ingredients": [
            "List all ingredients with quantities and measurements (e.g., '1 cup chopped carrots')"
        ],
        "instructions": [
            "Write very detailed, step-by-step cooking instructions.",
            "Each step should describe the cooking process thoroughly, including preparation, techniques, temperature, timing, and sensory cues (e.g., 'stir until golden brown', 'simmer until sauce thickens').",
            "Avoid vague actions. Be specific and educational so that even a beginner can follow."
        ],
        "estimated_cooking_time": "Total cooking time (e.g., '40 minutes')",
        "nutritional_info": "Estimated nutrition per serving (e.g., '500 kcal, 20g protein, 15g fat')",
        "time_breakdown": {
            "1": "10 minutes",
            "2": "15 minutes",
            "3": "20 minutes",
            "4": "25 minutes",
            "5": "30 minutes",
            "T": "Total cooking time (must equal estimated_cooking_time)"
        }
    },
    ...
]

Rules:
- Only output valid JSON with 4 complete recipe objects inside an array.
- TIME BREAKDOWN FORMAT: Use numbered keys (1, 2, 3, 4, 5...) for each instruction step and "T" for total time. Each step number should correspond to the instruction step number exactly.
- Make sure instructions are as detailed as possible, like from a cookbook.
- No extra explanations, introductions, or wrapping text.
- For flexible mode: Each recipe MUST include 2-6 additional ingredients beyond the provided ones to create a complete dish.
- DIVERSITY REQUIREMENT: Each recipe must be fundamentally different from the others - different cooking methods (baking, frying, grilling, slow cooking, etc.), different flavor profiles (spicy, sweet, savory, tangy, etc.), different dish types (main course, side dish, soup, salad, etc.), and different cultural influences. Avoid creating similar recipes with just ingredient substitutions.
"""
        
        return prompt
    
    def _parse_recipe_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse the AI response to extract recipes"""
        try:
            import json
            import re
            
            # Try to extract JSON from the response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                recipes = json.loads(json_str)
                
                # Validate and clean up recipes
                cleaned_recipes = []
                for recipe in recipes:
                    if isinstance(recipe, dict) and 'title' in recipe:
                        cleaned_recipe = {
                            'title': recipe.get('title', ''),
                            'ingredients': recipe.get('ingredients', []),
                            'instructions': recipe.get('instructions', []),
                            'estimated_cooking_time': recipe.get('estimated_cooking_time', ''),
                            'nutritional_info': recipe.get('nutritional_info', ''),
                            'time_breakdown': recipe.get('time_breakdown', {}),
                            'image_url': recipe.get('image_url', '')
                        }
                        cleaned_recipes.append(cleaned_recipe)
                
                return cleaned_recipes
            else:
                logger.error("Could not extract JSON from recipe response")
                return []
                
        except Exception as e:
            logger.error(f"Error parsing recipe response: {str(e)}")
            return []

