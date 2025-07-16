#!/usr/bin/env python3
"""
Script to clear existing favorites in the database for testing purposes.
This will remove all existing favorites so you can test with fresh data.
"""

from app import app, db
from models.user import FavoriteRecipe

def clear_favorites():
    """Clear all existing favorites from the database"""
    with app.app_context():
        try:
            # Get count of existing favorites
            favorites_count = FavoriteRecipe.query.count()
            print(f"Found {favorites_count} existing favorites")
            
            if favorites_count == 0:
                print("No favorites to clear")
                return
            
            # Clear all favorites
            FavoriteRecipe.query.delete()
            db.session.commit()
            
            print(f"Successfully cleared {favorites_count} favorites")
            print("You can now test adding new recipes to favorites")
            
        except Exception as e:
            print(f"Error clearing favorites: {e}")
            db.session.rollback()

if __name__ == "__main__":
    print("⚠️  WARNING: This will delete ALL existing favorites!")
    print("Are you sure you want to continue? (y/N)")
    
    response = input().strip().lower()
    if response == 'y':
        clear_favorites()
    else:
        print("Operation cancelled") 