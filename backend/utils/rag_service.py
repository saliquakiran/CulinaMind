import os
import json
from typing import List, Dict, Any, Tuple
import openai
from dotenv import load_dotenv
import numpy as np
import faiss
import pickle
from pathlib import Path
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CulinaryRAGService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.embedding_model = "text-embedding-3-small"  # Latest OpenAI embedding model
        self.knowledge_base = self._load_culinary_knowledge()
        self.embeddings = None
        self.faiss_index = None
        self._initialize_vector_search()
        
    def _load_culinary_knowledge(self) -> List[Dict[str, Any]]:
        """Load comprehensive culinary knowledge base"""
        return [
            # Baking & Pastry
            {
                "id": "baking_001",
                "content": "To make fluffy pancakes, separate egg whites and beat until stiff peaks form. Fold into batter gently. Use buttermilk and let batter rest for 10 minutes. Cook on medium heat until bubbles form on surface. The key is gentle folding to preserve air bubbles.",
                "category": "baking",
                "title": "Fluffy Pancake Technique",
                "keywords": ["pancakes", "fluffy", "eggs", "buttermilk", "batter", "folding", "air bubbles"],
                "difficulty": "beginner",
                "cuisine": "western"
            },
            {
                "id": "baking_002",
                "content": "Perfect pie crust: Use cold butter and ice water. Don't overwork the dough. Let it rest in the fridge for at least 30 minutes. Roll out on a floured surface, fold into quarters for transfer. Blind bake with weights for 15 minutes before filling.",
                "category": "baking",
                "title": "Perfect Pie Crust",
                "keywords": ["pie crust", "cold butter", "ice water", "dough", "resting", "blind bake"],
                "difficulty": "intermediate",
                "cuisine": "western"
            },
            {
                "id": "baking_003",
                "content": "Sourdough bread: Maintain starter at room temperature, feed daily with equal parts flour and water. Autolyse dough for 30 minutes before adding salt. Stretch and fold every 30 minutes for 3 hours. Bulk ferment until 50% rise, then shape and cold proof overnight.",
                "category": "baking",
                "title": "Sourdough Bread Method",
                "keywords": ["sourdough", "starter", "autolyse", "stretch and fold", "bulk ferment", "cold proof"],
                "difficulty": "advanced",
                "cuisine": "western"
            },
            
            # Cooking Techniques
            {
                "id": "technique_001",
                "content": "Sous vide cooking: Vacuum seal food in bags, cook in precise temperature water bath. Beef at 130°F for medium-rare, chicken at 165°F for safety. Finish with high-heat sear for texture. Perfect for consistent results and meal prep.",
                "category": "techniques",
                "title": "Sous Vide Cooking",
                "keywords": ["sous vide", "vacuum seal", "temperature control", "searing", "consistency"],
                "difficulty": "intermediate",
                "cuisine": "modern"
            },
            {
                "id": "technique_002",
                "content": "Reverse searing: Cook meat in low oven (200-250°F) until internal temperature is 10-15°F below target. Rest for 10 minutes, then sear on high heat for crust. Results in even doneness and perfect crust without overcooking.",
                "category": "techniques",
                "title": "Reverse Searing Method",
                "keywords": ["reverse sear", "low temperature", "even cooking", "crust", "resting"],
                "difficulty": "intermediate",
                "cuisine": "western"
            },
            {
                "id": "technique_003",
                "content": "Smoking techniques: Cold smoking for flavor (below 90°F), hot smoking for cooking (165-185°F). Use wood chips soaked in water. Control airflow for consistent smoke. Different woods impart unique flavors: hickory for strong, apple for mild, mesquite for bold.",
                "category": "techniques",
                "title": "Smoking Fundamentals",
                "keywords": ["smoking", "cold smoke", "hot smoke", "wood chips", "airflow", "wood flavors"],
                "difficulty": "advanced",
                "cuisine": "bbq"
            },
            
            # Ingredient Substitutions
            {
                "id": "substitution_001",
                "content": "Egg substitutes: 1/4 cup applesauce for binding, 1/4 cup mashed banana for moisture, 1 tbsp ground flaxseed + 3 tbsp water for structure, 1/4 cup silken tofu for protein, 1/4 cup yogurt for richness. Each works best in different recipes.",
                "category": "substitutions",
                "title": "Egg Substitutes",
                "keywords": ["eggs", "substitutes", "applesauce", "banana", "flaxseed", "tofu", "yogurt"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "substitution_002",
                "content": "Dairy alternatives: Almond milk for drinking, coconut milk for richness, oat milk for neutral flavor, cashew milk for creaminess. For butter: coconut oil, olive oil, or avocado oil. For cheese: nutritional yeast, cashew cheese, or store-bought alternatives.",
                "category": "substitutions",
                "title": "Dairy Alternatives",
                "keywords": ["dairy", "almond milk", "coconut milk", "oat milk", "cashew milk", "butter alternatives"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "substitution_003",
                "content": "Gluten-free flour blends: Mix 40% rice flour, 30% sorghum flour, 20% potato starch, 10% tapioca starch. Add xanthan gum for binding (1/4 tsp per cup). For all-purpose: 60% white rice, 20% brown rice, 20% potato starch.",
                "category": "substitutions",
                "title": "Gluten-Free Flour Blends",
                "keywords": ["gluten-free", "flour blends", "rice flour", "sorghum", "potato starch", "xanthan gum"],
                "difficulty": "intermediate",
                "cuisine": "universal"
            },
            
            # Cuisine-Specific Techniques
            {
                "id": "cuisine_001",
                "content": "Chinese stir-frying: Use wok on high heat, preheat until smoking. Add oil, swirl to coat. Cook aromatics first (ginger, garlic, scallions), then protein, then vegetables. Add sauce last, toss quickly. The key is high heat and quick cooking.",
                "category": "cuisine_specific",
                "title": "Chinese Stir-Frying",
                "keywords": ["stir-fry", "wok", "high heat", "aromatics", "quick cooking", "chinese"],
                "difficulty": "intermediate",
                "cuisine": "chinese"
            },
            {
                "id": "cuisine_002",
                "content": "Italian pasta cooking: Use large pot with plenty of salted water (1 tbsp salt per pound pasta). Cook until al dente (firm to bite). Reserve pasta water for sauce consistency. Never rinse pasta after cooking. Toss with sauce immediately.",
                "category": "cuisine_specific",
                "title": "Italian Pasta Method",
                "keywords": ["pasta", "al dente", "salted water", "pasta water", "sauce", "italian"],
                "difficulty": "beginner",
                "cuisine": "italian"
            },
            {
                "id": "cuisine_003",
                "content": "French sauce making: Start with roux (equal parts flour and butter), cook until desired color. Add liquid gradually while whisking. Simmer to thicken, season with salt and pepper. Finish with acid (lemon, vinegar) and herbs. Strain for smooth texture.",
                "category": "cuisine_specific",
                "title": "French Sauce Technique",
                "keywords": ["french sauce", "roux", "thickening", "whisking", "acid", "herbs", "straining"],
                "difficulty": "intermediate",
                "cuisine": "french"
            },
            
            # Food Safety & Science
            {
                "id": "safety_001",
                "content": "Cooking temperatures: Rare beef 125°F, medium 135°F, well-done 145°F. Chicken 165°F, fish 145°F, pork 145°F. Use meat thermometer for accuracy. Rest meat 5-10 minutes after cooking for juices to redistribute.",
                "category": "food_safety",
                "title": "Safe Cooking Temperatures",
                "keywords": ["temperature", "beef", "chicken", "fish", "pork", "thermometer", "resting"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "safety_002",
                "content": "Cross-contamination prevention: Use separate cutting boards for raw meat and vegetables. Wash hands after handling raw meat. Sanitize surfaces with hot soapy water or bleach solution. Store raw meat below ready-to-eat foods in refrigerator.",
                "category": "food_safety",
                "title": "Cross-Contamination Prevention",
                "keywords": ["cross-contamination", "cutting boards", "hand washing", "sanitizing", "storage"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "science_001",
                "content": "Maillard reaction: Browning reaction between amino acids and reducing sugars at 140-165°C (284-329°F). Creates complex flavors and aromas. Occurs in searing meat, toasting bread, roasting coffee. Control heat and moisture for optimal results.",
                "category": "food_science",
                "title": "Maillard Reaction",
                "keywords": ["maillard reaction", "browning", "amino acids", "sugars", "temperature", "flavor"],
                "difficulty": "intermediate",
                "cuisine": "universal"
            },
            
            # Meal Planning & Efficiency
            {
                "id": "planning_001",
                "content": "Meal prep strategies: Cook proteins in bulk (chicken, beef, beans). Roast vegetables in large batches. Prepare sauces and dressings ahead. Use freezer-friendly containers. Plan 3-4 days of meals, shop once per week. Prep ingredients on Sunday for weekday cooking.",
                "category": "meal_planning",
                "title": "Meal Prep Strategies",
                "keywords": ["meal prep", "bulk cooking", "roasting", "sauces", "freezing", "planning"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "planning_002",
                "content": "Quick dinner ideas: Stir-fry with pre-cut vegetables and protein, pasta with jarred sauce and frozen vegetables, sheet pan dinner with chicken and vegetables, breakfast for dinner with eggs and toast, or grain bowls with leftover proteins and fresh vegetables.",
                "category": "meal_planning",
                "title": "Quick Dinner Ideas",
                "keywords": ["dinner", "quick", "stir-fry", "pasta", "sheet pan", "breakfast", "grain bowls"],
                "difficulty": "beginner",
                "cuisine": "universal"
            },
            {
                "id": "efficiency_001",
                "content": "Kitchen efficiency: Mise en place (prep all ingredients before cooking), use multiple burners simultaneously, clean as you go, use kitchen timer for multiple dishes, organize workspace for smooth workflow. Plan cooking order to maximize oven and stovetop usage.",
                "category": "efficiency",
                "title": "Kitchen Efficiency Tips",
                "keywords": ["mise en place", "multiple burners", "clean as you go", "timer", "organization"],
                "difficulty": "beginner",
                "cuisine": "universal"
            }
        ]
    
    def _initialize_vector_search(self):
        """Initialize vector embeddings and FAISS index"""
        try:
            # Check if embeddings are already saved
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
            # Fallback to simple search if vector search fails
            self.embeddings = None
            self.faiss_index = None
    
    def _compute_embeddings(self):
        """Compute embeddings for all knowledge base items"""
        try:
            # Prepare text for embedding (combine title, content, and keywords)
            texts = []
            for item in self.knowledge_base:
                text = f"{item['title']} {item['content']} {' '.join(item['keywords'])}"
                texts.append(text)
            
            # Get embeddings from OpenAI
            response = self.openai_client.embeddings.create(
                input=texts,
                model=self.embedding_model
            )
            
            # Extract embeddings
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
            
            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(self.embeddings)
            
            # Create FAISS index (using Inner Product for normalized vectors = cosine similarity)
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
            # Save embeddings
            with open("models/ai/culinary_embeddings.pkl", 'wb') as f:
                pickle.dump(self.embeddings, f)
            
            # Save FAISS index
            faiss.write_index(self.faiss_index, "models/ai/culinary_faiss_index.bin")
            
            logger.info("Saved embeddings and FAISS index to disk")
            
        except Exception as e:
            logger.error(f"Error saving embeddings and index: {str(e)}")
    
    def _semantic_search(self, query: str, top_k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """Perform semantic search using vector embeddings"""
        try:
            if self.faiss_index is None or self.embeddings is None:
                logger.warning("Vector search not available, falling back to keyword search")
                return self._simple_search(query, top_k)
            
            # Get query embedding
            query_response = self.openai_client.embeddings.create(
                input=[query],
                model=self.embedding_model
            )
            query_embedding = np.array([query_response.data[0].embedding], dtype=np.float32)
            
            # Normalize query embedding
            faiss.normalize_L2(query_embedding)
            
            # Search FAISS index
            similarities, indices = self.faiss_index.search(query_embedding, top_k)
            
            # Return results with similarity scores
            results = []
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx < len(self.knowledge_base):
                    results.append((float(similarity), self.knowledge_base[idx]))
            
            logger.info(f"Semantic search returned {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            logger.info("Falling back to keyword search")
            return self._simple_search(query, top_k)
    
    def _simple_search(self, query: str, top_k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """Fallback keyword-based search"""
        import re
        
        query_lower = query.lower()
        query_words = set(re.findall(r'\b\w+\b', query_lower))
        
        scored_items = []
        for item in self.knowledge_base:
            item_keywords = set(item.get('keywords', []))
            item_text = f"{item['title']} {item['content']}".lower()
            
            # Calculate relevance score
            keyword_matches = len(query_words.intersection(item_keywords))
            text_matches = sum(1 for word in query_words if word in item_text)
            total_score = keyword_matches * 2 + text_matches
            
            if total_score > 0:
                scored_items.append((float(total_score), item))
        
        # Sort by score and return top-k
        scored_items.sort(key=lambda x: x[0], reverse=True)
        return scored_items[:top_k]
    
    def retrieve_relevant_knowledge(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve most relevant knowledge using semantic search"""
        results = self._semantic_search(query, top_k)
        return [item for score, item in results]
    
    def generate_response(self, user_query: str, user_context: str = "") -> str:
        """Generate AI response using enhanced RAG approach"""
        try:
            # Retrieve relevant knowledge using semantic search
            relevant_knowledge = self.retrieve_relevant_knowledge(user_query, top_k=5)
            
            if not relevant_knowledge:
                return "I'd be happy to help you with cooking questions! While I don't have specific information about that exact topic, I can provide general culinary guidance. Feel free to ask about cooking techniques, recipe modifications, or general cooking tips."
            
            # Create enhanced context from retrieved knowledge
            context_items = []
            for item in relevant_knowledge:
                context_items.append(f"**{item['title']}** ({item['category']}, {item['difficulty']} level)\n{item['content']}")
            
            context = "\n\n".join(context_items)
            
            # Enhanced system prompt with better structure
            system_prompt = f"""You are an expert culinary AI assistant with deep knowledge of cooking techniques, food science, and culinary best practices. Use the following cooking knowledge to answer the user's question accurately and helpfully:

{context}

Guidelines:
- Provide practical, actionable cooking advice based on the knowledge above
- Be encouraging and supportive, especially for beginners
- If the knowledge doesn't fully cover the question, acknowledge it and provide the best guidance possible
- Keep responses conversational but informative and educational
- Include specific tips, techniques, and step-by-step instructions when relevant
- Mention difficulty levels and suggest alternatives for different skill levels
- Keep responses under 300 words unless more detail is specifically requested
- Always prioritize food safety and best practices"""

            # Generate response using OpenAI
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"User question: {user_query}\nUser context: {user_context}"}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"I'm having trouble processing your request right now. Please try again in a moment. Error: {str(e)}"
    
    def get_cooking_tips(self, category: str = None) -> List[str]:
        """Get random cooking tips, optionally filtered by category"""
        if category:
            filtered_items = [item for item in self.knowledge_base if item["category"] == category]
        else:
            filtered_items = self.knowledge_base
        
        import random
        random.shuffle(filtered_items)
        return [item["content"] for item in filtered_items[:3]]
    
    def suggest_recipe_modifications(self, original_recipe: str, user_request: str) -> str:
        """Suggest modifications to a recipe based on user request"""
        try:
            # First, retrieve relevant modification knowledge
            modification_knowledge = self.retrieve_relevant_knowledge(f"recipe modification {user_request}", top_k=3)
            
            context = ""
            if modification_knowledge:
                context = "\n\n".join([f"**{item['title']}**: {item['content']}" for item in modification_knowledge])
            
            prompt = f"""Original recipe: {original_recipe}

User request for modification: {user_request}

{context if context else "Use general culinary knowledge to suggest modifications."}

Please suggest specific modifications to the recipe that address the user's request. Include:
- Ingredient substitutions if needed
- Cooking method adjustments
- Timing changes
- Alternative techniques
- Safety considerations if relevant

Make the suggestions practical and easy to implement. Keep response under 300 words."""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a culinary expert who helps modify recipes based on user requests and cooking best practices."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error suggesting recipe modifications: {str(e)}")
            return f"I'm having trouble suggesting modifications right now. Please try again in a moment."
    
    def search_by_category(self, category: str, difficulty: str = None) -> List[Dict[str, Any]]:
        """Search knowledge base by category and optional difficulty"""
        results = []
        for item in self.knowledge_base:
            if item["category"] == category:
                if difficulty is None or item["difficulty"] == difficulty:
                    results.append(item)
        return results
    
    def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        categories = {}
        difficulties = {}
        cuisines = {}
        
        for item in self.knowledge_base:
            # Count by category
            cat = item["category"]
            categories[cat] = categories.get(cat, 0) + 1
            
            # Count by difficulty
            diff = item["difficulty"]
            difficulties[diff] = difficulties.get(diff, 0) + 1
            
            # Count by cuisine
            cui = item["cuisine"]
            cuisines[cui] = cuisines.get(cui, 0) + 1
        
        return {
            "total_items": len(self.knowledge_base),
            "categories": categories,
            "difficulties": difficulties,
            "cuisines": cuisines,
            "vector_search_available": self.faiss_index is not None
        }