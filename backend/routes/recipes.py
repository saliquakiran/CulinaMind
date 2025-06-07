from flask import Blueprint, request, jsonify
import os
from utils.openai_service import generate_recipes
from models import db, User, FavoriteRecipe
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

# Define Blueprint for recipe-related routes
recipes_bp = Blueprint("recipes", __name__)

# Simple test route
@recipes_bp.route("/ping", methods=["GET"])
def ping():
    """Super simple ping route"""
    return {"ping": "pong"}

# Test route
@recipes_bp.route("/test", methods=["GET"])
def test_route():
    """Simple test route to verify routing works"""
    return {"message": "Recipes route is working!"}

# Test OpenAI connection
@recipes_bp.route("/test_openai", methods=["GET"])
def test_openai():
    """Test endpoint to check OpenAI API connection"""
    try:
        print("Testing OpenAI connection...")  # Debug log
        print(f"API Key exists: {bool(os.getenv('OPENAI_API_KEY'))}")  # Check if key exists
        
        # For now, just return success without calling OpenAI
        return jsonify({"status": 200, "message": "OpenAI test endpoint reached", "data": {"test": "success"}}), 200
        
    except Exception as e:
        print(f"OpenAI test failed with error: {str(e)}")  # Debug log
        return jsonify({"status": 500, "message": f"OpenAI test failed: {str(e)}"}), 500

# Test DALL-E image generation
@recipes_bp.route("/test_dalle", methods=["GET"])
def test_dalle():
    """Test endpoint to check DALL-E API connection"""
    try:
        from utils.openai_service import generate_recipe_image
        
        print("Testing DALL-E connection...")  # Debug log
        print(f"API Key exists: {bool(os.getenv('OPENAI_API_KEY'))}")  # Check if key exists
        
        # Test image generation
        test_image = generate_recipe_image("Grilled Chicken with Herbs")
        
        if isinstance(test_image, str) and test_image.startswith('http'):
            return jsonify({
                "status": 200, 
                "message": "DALL-E test successful", 
                "data": {"image_url": test_image}
            }), 200
        else:
            return jsonify({
                "status": 500, 
                "message": "DALL-E test failed", 
                "data": {"error": test_image}
            }), 500
        
    except Exception as e:
        print(f"DALL-E test failed with error: {str(e)}")  # Debug log
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"status": 500, "message": f"DALL-E test failed: {str(e)}"}), 500

# Generate recipes route (simplified)
@recipes_bp.route("/generate_recipes", methods=["POST"])
def generate_recipe_suggestions():
    """ Generates 4 AI-based recipe suggestions based on user inputs. """

    print("🔥 RECIPE ROUTE HIT! 🔥")  # Simple verification
    print("=== Recipe Generation Started ===")  # Debug log
    
    try:
        user_id = "test_user"  # Temporary test user
        print(f"User ID: {user_id}")  # Debug log
        
        try:
            data = request.json
            print(f"Request data: {data}")  # Debug log
        except Exception as e:
            print(f"Error parsing request JSON: {str(e)}")  # Debug log
            return jsonify({"status": 400, "message": f"Invalid JSON in request: {str(e)}"}), 400
        
        if not data:
            print("No request data received")  # Debug log
            return jsonify({"status": 400, "message": "No request data received"}), 400

        # Extract data from request
        ingredients = data.get('ingredients', [])
        cuisine = data.get('cuisine', '')
        dietary_restrictions = data.get('dietary_restrictions', [])
        time_limit = data.get('time_limit', '')
        serving_size = data.get('serving_size', '')
        strict_ingredients = data.get('strict_ingredients', False)

        # Validate required fields - support both ingredients-based and filter-based search
        selected_filters = [
            cuisine and cuisine.strip(),
            dietary_restrictions and len(dietary_restrictions) > 0,
            time_limit and time_limit.strip(),
            serving_size and serving_size.strip()
        ]
        selected_filters_count = len([f for f in selected_filters if f])
        
        if not ingredients and selected_filters_count < 2:
            return jsonify({"status": 400, "message": "Either provide at least 4 ingredients OR select at least 2 filters (cuisine, dietary restrictions, time limit, serving size)"}), 400
        
        if ingredients and len(ingredients) < 4:
            return jsonify({"status": 400, "message": "Please provide at least 4 ingredients"}), 400

        print(f"Calling OpenAI service with ingredients: {ingredients}")
        
        # Call OpenAI service to generate recipes
        try:
            recipes = generate_recipes(
                ingredients=ingredients,
                cuisine=cuisine,
                dietary_restrictions=dietary_restrictions,
                time_limit=time_limit,
                serving_size=serving_size,
                strict_ingredients=strict_ingredients
            )
            
            print(f"Successfully generated {len(recipes)} recipes")
            return jsonify({
                "status": 200, 
                "message": "Recipes generated successfully", 
                "data": recipes
            }), 200
            
        except Exception as openai_error:
            print(f"OpenAI service error: {str(openai_error)}")
            return jsonify({
                "status": 500, 
                "message": f"Failed to generate recipes: {str(openai_error)}"
            }), 500

    except Exception as e:
        import traceback
        print(f"=== Recipe Generation Error ===")  # Debug log
        print(f"Error type: {type(e)}")  # Debug log
        print(f"Error message: {str(e)}")  # Debug log
        print(f"Full traceback: {traceback.format_exc()}")  # Debug log
        return jsonify({"status": 500, "message": f"An error occurred while generating recipes: {str(e)}"}), 500

# Add recipe to favorites
@recipes_bp.route("/favorite", methods=["POST"])
def add_to_favorites():
    """Add a recipe to user's favorites"""
    try:
        # Temporarily use a test user ID for testing
        current_user_id = 1  # Test user ID
        
        # Check if test user exists, if not create one
        test_user = User.query.get(current_user_id)
        if not test_user:
            test_user = User(
                id=current_user_id,
                first_name="Test",
                last_name="User",
                email="test@example.com"
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"Created test user with ID: {current_user_id}")
        
        data = request.json
        
        if not data:
            return jsonify({"status": 400, "message": "No recipe data provided"}), 400
        
        # Debug logging
        print(f"=== ADDING TO FAVORITES DEBUG ===")
        print(f"Received recipe data: {data}")
        print(f"Title: {data.get('title')}")
        print(f"Image URL: {data.get('image_url')}")
        print(f"Time: {data.get('time')}")
        print(f"Nutritional value: {data.get('nutritional_value')}")
        print(f"Time breakdown: {data.get('time_breakdown')}")
        print(f"=== END DEBUG ===")
        
        # Check if recipe already exists in favorites
        existing_favorite = FavoriteRecipe.query.filter_by(
            user_id=current_user_id,
            title=data.get('title')
        ).first()
        
        if existing_favorite:
            return jsonify({"status": 409, "message": "Recipe already in favorites"}), 409
        
        # Create new favorite recipe - using correct field names from the model
        favorite_recipe = FavoriteRecipe(
            user_id=current_user_id,
            title=data.get('title'),
            ingredients=json.dumps(data.get('ingredients', [])),
            instructions=json.dumps(data.get('instructions', [])),
            image_url=data.get('image_url', ''),  # Add image_url field
            time=data.get('time', ''),
            nutritional_value=data.get('nutritional_value', ''),
            time_breakdown=json.dumps(data.get('time_breakdown', {}))
        )
        
        print(f"=== SAVING TO DATABASE ===")
        print(f"Title: {favorite_recipe.title}")
        print(f"Image URL: {favorite_recipe.image_url}")
        print(f"Time: {favorite_recipe.time}")
        print(f"Nutritional value: {favorite_recipe.nutritional_value}")
        print(f"Time breakdown: {favorite_recipe.time_breakdown}")
        print(f"=== END SAVING DEBUG ===")
        
        db.session.add(favorite_recipe)
        db.session.commit()
        
        return jsonify({
            "status": 200,
            "message": "Recipe added to favorites successfully",
            "data": {
                "id": favorite_recipe.id,
                "title": favorite_recipe.title
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding to favorites: {str(e)}")
        return jsonify({"status": 500, "message": "Failed to add recipe to favorites"}), 500

# Get user's favorite recipes
@recipes_bp.route("/favorites", methods=["GET"])
def get_favorites():
    """Get all favorite recipes for the current user"""
    try:
        # Temporarily use a test user ID for testing
        current_user_id = 1  # Test user ID
        
        # Check if test user exists, if not create one
        test_user = User.query.get(current_user_id)
        if not test_user:
            test_user = User(
                id=current_user_id,
                first_name="Test",
                last_name="User",
                email="test@example.com"
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"Created test user with ID: {current_user_id}")
        
        favorites = FavoriteRecipe.query.filter_by(user_id=current_user_id).all()
        
        favorites_data = []
        for favorite in favorites:
            # Use the model's to_dict method to get properly formatted data
            favorite_dict = favorite.to_dict()
            print(f"Favorite recipe: {favorite.title} -> image_url: {favorite_dict.get('image_url', 'NONE')}")
            favorites_data.append(favorite_dict)
        
        return jsonify({
            "status": 200,
            "message": "Favorites retrieved successfully",
            "data": favorites_data
        }), 200
        
    except Exception as e:
        print(f"Error getting favorites: {str(e)}")
        return jsonify({"status": 500, "message": "Failed to retrieve favorites"}), 500

# Remove recipe from favorites
@recipes_bp.route("/favorite/<int:recipe_id>", methods=["DELETE"])
def remove_from_favorites(recipe_id):
    """Remove a recipe from user's favorites"""
    try:
        # Temporarily use a test user ID for testing
        current_user_id = 1  # Test user ID
        
        # Check if test user exists, if not create one
        test_user = User.query.get(current_user_id)
        if not test_user:
            test_user = User(
                id=current_user_id,
                first_name="Test",
                last_name="User",
                email="test@example.com"
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"Created test user with ID: {current_user_id}")
        
        favorite = FavoriteRecipe.query.filter_by(
            id=recipe_id,
            user_id=current_user_id
        ).first()
        
        if not favorite:
            return jsonify({"status": 404, "message": "Favorite recipe not found"}), 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({
            "status": 200,
            "message": "Recipe removed from favorites successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing from favorites: {str(e)}")
        return jsonify({"status": 500, "message": "Failed to remove recipe from favorites"}), 500
