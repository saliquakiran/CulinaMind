import os
import requests
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class CulinaryAPIService:
    """Service for integrating external culinary APIs and data sources"""
    
    def __init__(self):
        self.spoonacular_key = os.getenv('SPOONACULAR_API_KEY')
        self.edamam_app_id = os.getenv('EDAMAM_APP_ID')
        self.edamam_app_key = os.getenv('EDAMAM_APP_KEY')
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
        # API rate limiting and caching
        self.last_api_call = {}
        self.api_cache = {}
        self.cache_duration = timedelta(hours=1)
    
    def get_spoonacular_recipes(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Fetch recipes from Spoonacular API"""
        if not self.spoonacular_key:
            logger.warning("Spoonacular API key not configured")
            return []
        
        try:
            url = "https://api.spoonacular.com/recipes/complexSearch"
            params = {
                'apiKey': self.spoonacular_key,
                'query': query,
                'number': max_results,
                'addRecipeInformation': True,
                'fillIngredients': True,
                'instructionsRequired': True
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            recipes = []
            
            for recipe in data.get('results', []):
                recipes.append({
                    'id': f"spoonacular_{recipe['id']}",
                    'title': recipe['title'],
                    'content': recipe.get('summary', ''),
                    'category': 'external_recipes',
                    'difficulty': self._map_difficulty(recipe.get('readyInMinutes', 0)),
                    'cuisine': recipe.get('cuisines', ['international'])[0] if recipe.get('cuisines') else 'international',
                    'keywords': recipe.get('diets', []) + recipe.get('dishTypes', []),
                    'source': 'spoonacular',
                    'external_url': recipe.get('sourceUrl', ''),
                    'cooking_time': recipe.get('readyInMinutes', 0),
                    'servings': recipe.get('servings', 0),
                    'ingredients': [ing['name'] for ing in recipe.get('extendedIngredients', [])],
                    'instructions': recipe.get('analyzedInstructions', [])
                })
            
            logger.info(f"Fetched {len(recipes)} recipes from Spoonacular")
            return recipes
            
        except Exception as e:
            logger.error(f"Error fetching from Spoonacular: {str(e)}")
            return []
    
    def get_edamam_recipes(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Fetch recipes from Edamam API"""
        if not (self.edamam_app_id and self.edamam_app_key):
            logger.warning("Edamam API credentials not configured")
            return []
        
        try:
            url = "https://api.edamam.com/api/recipes/v2"
            params = {
                'type': 'public',
                'q': query,
                'app_id': self.edamam_app_id,
                'app_key': self.edamam_app_key,
                'from': 0,
                'to': max_results
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            recipes = []
            
            for recipe in data.get('hits', []):
                recipe_data = recipe['recipe']
                recipes.append({
                    'id': f"edamam_{recipe_data.get('uri', '').split('_')[-1]}",
                    'title': recipe_data.get('label', ''),
                    'content': f"Recipe with {len(recipe_data.get('ingredients', []))} ingredients",
                    'category': 'external_recipes',
                    'difficulty': self._map_difficulty(recipe_data.get('totalTime', 0)),
                    'cuisine': recipe_data.get('cuisineType', ['international'])[0] if recipe_data.get('cuisineType') else 'international',
                    'keywords': recipe_data.get('dietLabels', []) + recipe_data.get('healthLabels', []),
                    'source': 'edamam',
                    'external_url': recipe_data.get('url', ''),
                    'cooking_time': recipe_data.get('totalTime', 0),
                    'servings': recipe_data.get('yield', 0),
                    'ingredients': recipe_data.get('ingredientLines', []),
                    'nutrition': recipe_data.get('totalNutrients', {})
                })
            
            logger.info(f"Fetched {len(recipes)} recipes from Edamam")
            return recipes
            
        except Exception as e:
            logger.error(f"Error fetching from Edamam: {str(e)}")
            return []
    
    def get_culinary_news(self, query: str = "cooking", max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch culinary news and trends"""
        if not self.news_api_key:
            logger.warning("News API key not configured")
            return []
        
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                'apiKey': self.news_api_key,
                'q': f"{query} cooking food culinary",
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': max_results,
                'domains': 'foodnetwork.com,seriouseats.com,bonappetit.com,epicurious.com'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            articles = []
            
            for article in data.get('articles', []):
                articles.append({
                    'id': f"news_{hash(article.get('url', ''))}",
                    'title': article.get('title', ''),
                    'content': article.get('description', ''),
                    'category': 'culinary_news',
                    'difficulty': 'beginner',
                    'cuisine': 'international',
                    'keywords': ['trends', 'news', 'culinary'],
                    'source': 'news_api',
                    'external_url': article.get('url', ''),
                    'published_at': article.get('publishedAt', ''),
                    'author': article.get('author', ''),
                    'source_name': article.get('source', {}).get('name', '')
                })
            
            logger.info(f"Fetched {len(articles)} culinary news articles")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching culinary news: {str(e)}")
            return []
    
    def get_seasonal_ingredients(self) -> List[Dict[str, Any]]:
        """Get seasonal ingredients and produce information"""
        try:
            # This could integrate with USDA seasonal produce API or similar
            # For now, returning curated seasonal information
            current_month = datetime.now().month
            
            seasonal_data = {
                1: ['citrus fruits', 'winter squash', 'root vegetables'],
                2: ['citrus fruits', 'winter greens', 'parsnips'],
                3: ['asparagus', 'spring peas', 'rhubarb'],
                4: ['asparagus', 'spring onions', 'fresh herbs'],
                5: ['strawberries', 'spring greens', 'radishes'],
                6: ['berries', 'zucchini', 'tomatoes'],
                7: ['berries', 'corn', 'bell peppers'],
                8: ['tomatoes', 'corn', 'summer squash'],
                9: ['apples', 'pumpkins', 'winter squash'],
                10: ['apples', 'pumpkins', 'mushrooms'],
                11: ['winter squash', 'root vegetables', 'citrus'],
                12: ['citrus fruits', 'winter squash', 'root vegetables']
            }
            
            current_seasonal = seasonal_data.get(current_month, [])
            
            return [{
                'id': f"seasonal_{ingredient.replace(' ', '_')}",
                'title': f"Seasonal: {ingredient.title()}",
                'content': f"{ingredient.title()} is in season this month. Perfect for fresh, local cooking.",
                'category': 'seasonal_ingredients',
                'difficulty': 'beginner',
                'cuisine': 'universal',
                'keywords': ['seasonal', 'fresh', 'local', ingredient],
                'source': 'curated',
                'season': current_month,
                'ingredient': ingredient
            } for ingredient in current_seasonal]
            
        except Exception as e:
            logger.error(f"Error getting seasonal ingredients: {str(e)}")
            return []
    
    def get_trending_recipes(self) -> List[Dict[str, Any]]:
        """Get trending recipes and popular searches"""
        try:
            # This could integrate with Google Trends API or social media APIs
            # For now, returning curated trending topics
            trending_topics = [
                'air fryer recipes',
                'plant-based cooking',
                'sourdough bread',
                'meal prep ideas',
                'instant pot recipes',
                'keto-friendly dishes',
                'Mediterranean diet',
                'Asian fusion cooking'
            ]
            
            trending_items = []
            for topic in trending_topics:
                trending_items.append({
                    'id': f"trending_{topic.replace(' ', '_')}",
                    'title': f"Trending: {topic.title()}",
                    'content': f"{topic.title()} is currently trending in culinary circles. Great for exploring new cooking styles.",
                    'category': 'trending_topics',
                    'difficulty': 'beginner',
                    'cuisine': 'international',
                    'keywords': ['trending', 'popular', topic],
                    'source': 'trends',
                    'trend_score': trending_topics.index(topic) + 1
                })
            
            logger.info(f"Generated {len(trending_items)} trending topics")
            return trending_items
            
        except Exception as e:
            logger.error(f"Error getting trending recipes: {str(e)}")
            return []
    
    def _map_difficulty(self, cooking_time: int) -> str:
        """Map cooking time to difficulty level"""
        if cooking_time <= 30:
            return 'beginner'
        elif cooking_time <= 60:
            return 'intermediate'
        else:
            return 'advanced'
    
    def get_all_external_content(self, query: str = None) -> List[Dict[str, Any]]:
        """Fetch content from all available external sources"""
        all_content = []
        
        # Get recipes from multiple sources
        if query:
            all_content.extend(self.get_spoonacular_recipes(query, max_results=5))
            all_content.extend(self.get_edamam_recipes(query, max_results=5))
        
        # Get trending and seasonal content
        all_content.extend(self.get_trending_recipes())
        all_content.extend(self.get_seasonal_ingredients())
        
        # Get culinary news
        all_content.extend(self.get_culinary_news(max_results=3))
        
        logger.info(f"Fetched {len(all_content)} total external content items")
        return all_content
    
    def get_api_status(self) -> Dict[str, Any]:
        """Get status of all external APIs"""
        status = {
            'spoonacular': bool(self.spoonacular_key),
            'edamam': bool(self.edamam_app_id and self.edamam_app_key),
            'news_api': bool(self.news_api_key),
            'total_apis': 0,
            'available_apis': 0
        }
        
        status['total_apis'] = 3
        status['available_apis'] = sum([status['spoonacular'], status['edamam'], status['news_api']])
        
        return status 