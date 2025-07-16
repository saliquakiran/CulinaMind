#!/usr/bin/env python3
"""
Demo script showing how external APIs would enhance the knowledge base
"""

import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.culinary_apis import CulinaryAPIService
from utils.dynamic_knowledge_manager import DynamicKnowledgeManager

def demo_external_apis():
    """Demonstrate external API integration capabilities"""
    print("🚀 External API Integration Demo")
    print("=" * 50)
    
    # Initialize services
    api_service = CulinaryAPIService()
    dynamic_manager = DynamicKnowledgeManager()
    
    # Show API status
    print("\n1. 📡 API Status Check")
    api_status = api_service.get_api_status()
    for api, available in api_status.items():
        if api not in ['total_apis', 'available_apis']:
            status_icon = "✅" if available else "❌"
            print(f"   {status_icon} {api.replace('_', ' ').title()}: {'Available' if available else 'Not configured'}")
    
    print(f"   📊 Total APIs: {api_status['total_apis']}")
    print(f"   🔓 Available APIs: {api_status['available_apis']}")
    
    # Show what would happen with APIs configured
    print("\n2. 🔮 What Would Happen With APIs")
    print("   • Spoonacular: Access to 5,000+ recipes with nutrition data")
    print("   • Edamam: Recipe search with dietary restrictions")
    print("   • News API: Real-time culinary trends and news")
    print("   • Seasonal: Monthly ingredient updates")
    print("   • Trending: Popular recipe topics")
    
    # Show dynamic content capabilities
    print("\n3. 📊 Dynamic Content Capabilities")
    dynamic_summary = dynamic_manager.get_dynamic_content_summary()
    print(f"   • External Recipes: {dynamic_summary['external_recipes']} (would be 500+ with APIs)")
    print(f"   • Culinary News: {dynamic_summary['culinary_news']} (would be updated every 6 hours)")
    print(f"   • Trending Topics: {dynamic_summary['trending_topics']} (would be 8+ current trends)")
    print(f"   • Seasonal Ingredients: {dynamic_summary['seasonal_ingredients']} (would be monthly updates)")
    
    # Show what content would look like
    print("\n4. 🍳 Sample External Content (Simulated)")
    
    # Simulate trending topics
    trending_examples = [
        "Air Fryer Recipes - Currently trending cooking method",
        "Plant-Based Cooking - Growing dietary preference",
        "Sourdough Bread - Popular during pandemic",
        "Meal Prep Ideas - Time-saving cooking trend"
    ]
    
    for i, topic in enumerate(trending_examples, 1):
        print(f"   {i}. {topic}")
    
    # Simulate seasonal content
    print("\n5. 🌱 Seasonal Content (Current Month)")
    from datetime import datetime
    current_month = datetime.now().month
    seasonal_months = {
        1: "Winter: Citrus fruits, winter squash, root vegetables",
        2: "Late Winter: Winter greens, parsnips, citrus",
        3: "Early Spring: Asparagus, spring peas, rhubarb",
        4: "Spring: Spring onions, fresh herbs, asparagus",
        5: "Late Spring: Strawberries, spring greens, radishes",
        6: "Early Summer: Berries, zucchini, tomatoes",
        7: "Summer: Corn, bell peppers, summer squash",
        8: "Late Summer: Tomatoes, corn, summer squash",
        9: "Early Fall: Apples, pumpkins, winter squash",
        10: "Fall: Pumpkins, mushrooms, apples",
        11: "Late Fall: Root vegetables, winter squash, citrus",
        12: "Winter: Citrus fruits, winter squash, root vegetables"
    }
    
    print(f"   📅 {seasonal_months.get(current_month, 'Unknown season')}")
    
    # Show integration benefits
    print("\n6. 🎯 Integration Benefits")
    benefits = [
        "Content Volume: 18 → 500+ items (25x increase)",
        "Freshness: Static → 6-hour updates",
        "Relevance: Always current trends and seasonal content",
        "User Engagement: Fresh content keeps users returning",
        "SEO: Dynamic content improves search rankings",
        "Competitive Edge: Unique, comprehensive platform"
    ]
    
    for benefit in benefits:
        print(f"   ✅ {benefit}")
    
    # Show implementation steps
    print("\n7. 🚀 Implementation Steps")
    steps = [
        "Get API keys from Spoonacular, Edamam, News API",
        "Add keys to .env file",
        "Test API connections",
        "Integrate with current RAG system",
        "Deploy and monitor performance"
    ]
    
    for i, step in enumerate(steps, 1):
        print(f"   {i}. {step}")
    
    print("\n🎉 Demo completed! Your knowledge base is ready for transformation!")

def demo_with_mock_apis():
    """Demo with simulated API responses"""
    print("\n🔧 Mock API Integration Demo")
    print("=" * 40)
    
    # Simulate what external content would look like
    mock_external_content = [
        {
            'id': 'spoonacular_12345',
            'title': 'Creamy Mushroom Risotto',
            'content': 'Authentic Italian risotto with wild mushrooms and parmesan cheese.',
            'category': 'external_recipes',
            'difficulty': 'intermediate',
            'cuisine': 'italian',
            'source': 'spoonacular',
            'cooking_time': 45,
            'servings': 4
        },
        {
            'id': 'edamam_67890',
            'title': 'Vegan Buddha Bowl',
            'content': 'Nutritious plant-based bowl with quinoa, roasted vegetables, and tahini dressing.',
            'category': 'external_recipes',
            'difficulty': 'beginner',
            'cuisine': 'international',
            'source': 'edamam',
            'cooking_time': 25,
            'servings': 2
        }
    ]
    
    print("📝 Sample External Recipes:")
    for recipe in mock_external_content:
        print(f"   🍽️  {recipe['title']}")
        print(f"      Difficulty: {recipe['difficulty']}")
        print(f"      Cuisine: {recipe['cuisine']}")
        print(f"      Time: {recipe['cooking_time']} minutes")
        print(f"      Source: {recipe['source']}")
        print()
    
    print("💡 This is exactly what your system would look like with real APIs!")

if __name__ == "__main__":
    load_dotenv()
    
    # Check if any APIs are configured
    api_keys = [
        os.getenv('SPOONACULAR_API_KEY'),
        os.getenv('EDAMAM_APP_ID'),
        os.getenv('EDAMAM_APP_KEY'),
        os.getenv('NEWS_API_KEY')
    ]
    
    has_apis = any(key for key in api_keys)
    
    if has_apis:
        print("🔑 API keys detected! Running full demo...")
        demo_external_apis()
    else:
        print("⚠️  No API keys configured. Running mock demo...")
        demo_external_apis()
        demo_with_mock_apis()
    
    print("\n📋 Next Steps:")
    print("1. Get API keys from the services mentioned")
    print("2. Add them to your .env file")
    print("3. Test the integration")
    print("4. Deploy the enhanced system")
    print("\n🚀 Your knowledge base will transform from 18 to 500+ items overnight!") 