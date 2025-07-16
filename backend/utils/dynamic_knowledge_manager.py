import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from pathlib import Path
import threading
import time
from utils.culinary_apis import CulinaryAPIService

logger = logging.getLogger(__name__)

class DynamicKnowledgeManager:
    """Manages dynamic knowledge base with external APIs, user content, and real-time updates"""
    
    def __init__(self, db_path: str = "data/dynamic_knowledge.db"):
        self.db_path = db_path
        self.api_service = CulinaryAPIService()
        self.update_interval = timedelta(hours=6)  # Update every 6 hours
        self.last_update = None
        self.update_lock = threading.Lock()
        
        # Initialize database
        self._init_database()
        
        # Start background update thread
        self._start_background_updates()
    
    def _init_database(self):
        """Initialize SQLite database for dynamic knowledge"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables for different content types
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS external_recipes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT,
                    difficulty TEXT,
                    cuisine TEXT,
                    keywords TEXT,
                    source TEXT,
                    external_url TEXT,
                    cooking_time INTEGER,
                    servings INTEGER,
                    ingredients TEXT,
                    instructions TEXT,
                    nutrition TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS culinary_news (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT,
                    difficulty TEXT,
                    cuisine TEXT,
                    keywords TEXT,
                    source TEXT,
                    external_url TEXT,
                    published_at TEXT,
                    author TEXT,
                    source_name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS trending_topics (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT,
                    difficulty TEXT,
                    cuisine TEXT,
                    keywords TEXT,
                    source TEXT,
                    trend_score INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS seasonal_ingredients (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT,
                    difficulty TEXT,
                    cuisine TEXT,
                    keywords TEXT,
                    source TEXT,
                    season INTEGER,
                    ingredient TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_generated_content (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    category TEXT,
                    difficulty TEXT,
                    cuisine TEXT,
                    keywords TEXT,
                    user_id TEXT,
                    rating REAL DEFAULT 0.0,
                    review_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_external_recipes_category ON external_recipes(category)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_external_recipes_difficulty ON external_recipes(difficulty)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_external_recipes_cuisine ON external_recipes(cuisine)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_published ON culinary_news(published_at)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_topics(trend_score)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_seasonal_season ON seasonal_ingredients(season)')
            
            conn.commit()
            conn.close()
            
            logger.info("Dynamic knowledge database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
    
    def _start_background_updates(self):
        """Start background thread for periodic updates"""
        def update_worker():
            while True:
                try:
                    self._perform_scheduled_update()
                    time.sleep(self.update_interval.total_seconds())
                except Exception as e:
                    logger.error(f"Error in background update: {str(e)}")
                    time.sleep(3600)  # Wait 1 hour on error
        
        update_thread = threading.Thread(target=update_worker, daemon=True)
        update_thread.start()
        logger.info("Background update thread started")
    
    def _perform_scheduled_update(self):
        """Perform scheduled update of external content"""
        with self.update_lock:
            try:
                logger.info("Starting scheduled knowledge base update...")
                
                # Update trending topics
                trending = self.api_service.get_trending_recipes()
                self._update_trending_topics(trending)
                
                # Update seasonal ingredients
                seasonal = self.api_service.get_seasonal_ingredients()
                self._update_seasonal_ingredients(seasonal)
                
                # Update culinary news
                news = self.api_service.get_culinary_news(max_results=5)
                self._update_culinary_news(news)
                
                self.last_update = datetime.now()
                logger.info("Scheduled knowledge base update completed")
                
            except Exception as e:
                logger.error(f"Error in scheduled update: {str(e)}")
    
    def _update_trending_topics(self, trending_items: List[Dict[str, Any]]):
        """Update trending topics in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for item in trending_items:
                cursor.execute('''
                    INSERT OR REPLACE INTO trending_topics 
                    (id, title, content, category, difficulty, cuisine, keywords, source, trend_score, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item['id'], item['title'], item['content'], item['category'],
                    item['difficulty'], item['cuisine'], json.dumps(item['keywords']),
                    item['source'], item['trend_score'], datetime.now()
                ))
            
            conn.commit()
            conn.close()
            logger.info(f"Updated {len(trending_items)} trending topics")
            
        except Exception as e:
            logger.error(f"Error updating trending topics: {str(e)}")
    
    def _update_seasonal_ingredients(self, seasonal_items: List[Dict[str, Any]]):
        """Update seasonal ingredients in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for item in seasonal_items:
                cursor.execute('''
                    INSERT OR REPLACE INTO seasonal_ingredients 
                    (id, title, content, category, difficulty, cuisine, keywords, source, season, ingredient, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item['id'], item['title'], item['content'], item['category'],
                    item['difficulty'], item['cuisine'], json.dumps(item['keywords']),
                    item['source'], item['season'], item['ingredient'], datetime.now()
                ))
            
            conn.commit()
            conn.close()
            logger.info(f"Updated {len(seasonal_items)} seasonal ingredients")
            
        except Exception as e:
            logger.error(f"Error updating seasonal ingredients: {str(e)}")
    
    def _update_culinary_news(self, news_items: List[Dict[str, Any]]):
        """Update culinary news in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for item in news_items:
                cursor.execute('''
                    INSERT OR REPLACE INTO culinary_news 
                    (id, title, content, category, difficulty, cuisine, keywords, source, external_url, published_at, author, source_name, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item['id'], item['title'], item['content'], item['category'],
                    item['difficulty'], item['cuisine'], json.dumps(item['keywords']),
                    item['source'], item['external_url'], item['published_at'],
                    item['author'], item['source_name'], datetime.now()
                ))
            
            conn.commit()
            conn.close()
            logger.info(f"Updated {len(news_items)} culinary news articles")
            
        except Exception as e:
            logger.error(f"Error updating culinary news: {str(e)}")
    
    def search_external_recipes(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for recipes from external APIs"""
        try:
            # First check cache/database
            cached_recipes = self._get_cached_external_recipes(query, max_results)
            
            if cached_recipes and len(cached_recipes) >= max_results:
                return cached_recipes
            
            # Fetch fresh from APIs
            fresh_recipes = self.api_service.get_all_external_content(query)
            
            # Store in database
            self._store_external_recipes(fresh_recipes)
            
            return fresh_recipes[:max_results]
            
        except Exception as e:
            logger.error(f"Error searching external recipes: {str(e)}")
            return []
    
    def _get_cached_external_recipes(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Get cached external recipes from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Simple keyword search in cached recipes
            cursor.execute('''
                SELECT * FROM external_recipes 
                WHERE title LIKE ? OR content LIKE ? OR keywords LIKE ?
                ORDER BY last_accessed DESC, access_count DESC
                LIMIT ?
            ''', (f'%{query}%', f'%{query}%', f'%{query}%', max_results))
            
            rows = cursor.fetchall()
            conn.close()
            
            if not rows:
                return []
            
            # Convert rows to dict format
            recipes = []
            for row in rows:
                recipes.append({
                    'id': row[0], 'title': row[1], 'content': row[2],
                    'category': row[3], 'difficulty': row[4], 'cuisine': row[5],
                    'keywords': json.loads(row[6]) if row[6] else [],
                    'source': row[7], 'external_url': row[8], 'cooking_time': row[9],
                    'servings': row[10], 'ingredients': json.loads(row[11]) if row[11] else [],
                    'instructions': json.loads(row[12]) if row[12] else [],
                    'nutrition': json.loads(row[13]) if row[13] else {}
                })
            
            return recipes
            
        except Exception as e:
            logger.error(f"Error getting cached recipes: {str(e)}")
            return []
    
    def _store_external_recipes(self, recipes: List[Dict[str, Any]]):
        """Store external recipes in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for recipe in recipes:
                cursor.execute('''
                    INSERT OR REPLACE INTO external_recipes 
                    (id, title, content, category, difficulty, cuisine, keywords, source, external_url, 
                     cooking_time, servings, ingredients, instructions, nutrition, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    recipe['id'], recipe['title'], recipe['content'], recipe['category'],
                    recipe['difficulty'], recipe['cuisine'], json.dumps(recipe['keywords']),
                    recipe['source'], recipe['external_url'], recipe['cooking_time'],
                    recipe['servings'], json.dumps(recipe['ingredients']),
                    json.dumps(recipe['instructions']), json.dumps(recipe.get('nutrition', {})),
                    datetime.now()
                ))
            
            conn.commit()
            conn.close()
            logger.info(f"Stored {len(recipes)} external recipes in database")
            
        except Exception as e:
            logger.error(f"Error storing external recipes: {str(e)}")
    
    def get_trending_content(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get trending content from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM trending_topics 
                ORDER BY trend_score ASC, last_accessed DESC
                LIMIT ?
            ''', (max_results,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [self._row_to_dict(row, 'trending_topics') for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting trending content: {str(e)}")
            return []
    
    def get_seasonal_content(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get seasonal content from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            current_month = datetime.now().month
            cursor.execute('''
                SELECT * FROM seasonal_ingredients 
                WHERE season = ?
                ORDER BY last_accessed DESC
                LIMIT ?
            ''', (current_month, max_results))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [self._row_to_dict(row, 'seasonal_ingredients') for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting seasonal content: {str(e)}")
            return []
    
    def get_news_content(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get culinary news from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM culinary_news 
                ORDER BY published_at DESC, last_accessed DESC
                LIMIT ?
            ''', (max_results,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [self._row_to_dict(row, 'culinary_news') for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting news content: {str(e)}")
            return []
    
    def _row_to_dict(self, row: tuple, table_name: str) -> Dict[str, Any]:
        """Convert database row to dictionary"""
        if table_name == 'trending_topics':
            return {
                'id': row[0], 'title': row[1], 'content': row[2],
                'category': row[3], 'difficulty': row[4], 'cuisine': row[5],
                'keywords': json.loads(row[6]) if row[6] else [],
                'source': row[7], 'trend_score': row[8]
            }
        elif table_name == 'seasonal_ingredients':
            return {
                'id': row[0], 'title': row[1], 'content': row[2],
                'category': row[3], 'difficulty': row[4], 'cuisine': row[5],
                'keywords': json.loads(row[6]) if row[6] else [],
                'source': row[7], 'season': row[8], 'ingredient': row[9]
            }
        elif table_name == 'culinary_news':
            return {
                'id': row[0], 'title': row[1], 'content': row[2],
                'category': row[3], 'difficulty': row[4], 'cuisine': row[5],
                'keywords': json.loads(row[6]) if row[6] else [],
                'source': row[7], 'external_url': row[8], 'published_at': row[9],
                'author': row[10], 'source_name': row[11]
            }
        else:
            return {}
    
    def get_dynamic_content_summary(self) -> Dict[str, Any]:
        """Get summary of all dynamic content"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Count items in each table
            cursor.execute('SELECT COUNT(*) FROM external_recipes')
            external_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM culinary_news')
            news_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM trending_topics')
            trending_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM seasonal_ingredients')
            seasonal_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM user_generated_content')
            user_content_count = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'external_recipes': external_count,
                'culinary_news': news_count,
                'trending_topics': trending_count,
                'seasonal_ingredients': seasonal_count,
                'user_generated_content': user_content_count,
                'total_dynamic_items': external_count + news_count + trending_count + seasonal_count + user_content_count,
                'last_update': self.last_update.isoformat() if self.last_update else None,
                'api_status': self.api_service.get_api_status()
            }
            
        except Exception as e:
            logger.error(f"Error getting dynamic content summary: {str(e)}")
            return {} 