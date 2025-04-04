from flask import Blueprint, request, jsonify
from utils.openai_service import generate_recipes, generate_recipe_image  # AI-based recipe and image generation
from flask_jwt_extended import jwt_required, get_jwt_identity  # JWT for authentication
from models.user import db, FavoriteRecipe  # DB models
import json

# Define Blueprint for recipe-related routes
recipes_bp = Blueprint("recipes", __name__)

# Standard response format
def response(status: int, message: str, data=None):
    return jsonify({
        "status": status,
        "message": message,
        "data": data
    }), status

# Endpoint to generate AI-based recipe suggestions
@recipes_bp.route("/generate_recipes", methods=["POST"])
@jwt_required()
def generate_recipe_suggestions():
    """ Generates 4 AI-based recipe suggestions based on user inputs. """

    user_id = get_jwt_identity()
    data = request.json

    required_fields = ["ingredients", "cuisine", "dietary_restrictions", "time_limit", "serving_size"]
    if not all(field in data for field in required_fields):
        return response(400, "Missing required fields")

    # Apply exemption logic only if cuisine is "Surprise Me"
    exemption = data.get("exemption", None) if data["cuisine"].lower() == "surprise me" else None

    # Flag to strictly match ingredients
    strict_ingredients = data.get("strict_ingredients", False)

    try:
        # Generate recipes using OpenAI
        recipe_suggestions = generate_recipes(
            data["ingredients"], data["cuisine"], 
            data["dietary_restrictions"], data["time_limit"], 
            data["serving_size"], exemption, strict_ingredients
        )

        if "error" in recipe_suggestions:
            return response(500, "Failed to generate recipes", recipe_suggestions)

        recipes_with_images = []
        for recipe in recipe_suggestions:
            if not isinstance(recipe, dict) or "title" not in recipe:
                continue

            # Generate an image based on the recipe title
            image_url = generate_recipe_image(recipe["title"])

            # Extract or default values
            time_breakdown = recipe.get("time_breakdown", {})
            estimated_time = recipe.get("estimated_cooking_time", "Unknown Time")

            # Construct response recipe object
            recipes_with_images.append({
                "title": recipe["title"],
                "ingredients": recipe["ingredients"],
                "instructions": recipe["instructions"],
                "estimated_cooking_time": estimated_time,
                "nutritional_info": recipe["nutritional_info"],
                "time_breakdown": time_breakdown,
                "image_url": image_url
            })

        return response(200, "Recipes generated successfully", recipes_with_images)

    except Exception as e:
        return response(500, "An error occurred while generating recipes", str(e))

# Save a recipe to user's favorites
@recipes_bp.route("/favorite", methods=["POST"])
@jwt_required()
def save_favorite():
    user_id = get_jwt_identity()
    data = request.json

    required_fields = ["title", "ingredients", "instructions", "image_url", "time", "nutritional_value", "time_breakdown"]
    if not all(field in data for field in required_fields):
        return response(400, "Missing required fields")

    try:
        # Create FavoriteRecipe instance and persist it
        favorite_recipe = FavoriteRecipe(
            user_id=user_id,
            title=data["title"],
            ingredients=json.dumps(data["ingredients"]),
            instructions=json.dumps(data["instructions"]),
            image_url=data["image_url"],
            time=data["time"],
            nutritional_value=data["nutritional_value"],
            time_breakdown=json.dumps(data["time_breakdown"]),
        )

        db.session.add(favorite_recipe)
        db.session.commit()

        return response(201, "Recipe saved to favorites", {"recipe_id": favorite_recipe.id})

    except Exception as e:
        return response(500, "An error occurred while saving the favorite recipe", str(e))

# Retrieve all favorite recipes of the user
@recipes_bp.route("/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()

    try:
        # Query all favorites by user
        favorites = FavoriteRecipe.query.filter_by(user_id=user_id).all()

        # Deserialize and build the response list
        favorites_list = [{
            "id": f.id,
            "title": f.title,
            "ingredients": json.loads(f.ingredients),
            "instructions": json.loads(f.instructions),
            "image_url": f.image_url,
            "time": f.time,
            "nutritional_value": f.nutritional_value,
            "time_breakdown": json.loads(f.time_breakdown) if f.time_breakdown else {},
        } for f in favorites]

        return response(200, "Favorite recipes retrieved successfully", favorites_list)

    except Exception as e:
        return response(500, "An error occurred while fetching favorite recipes", str(e))

# Delete a specific favorite recipe
@recipes_bp.route("/favorite/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_favorite(recipe_id):
    user_id = get_jwt_identity()

    try:
        # Lookup favorite by ID and user
        favorite = FavoriteRecipe.query.filter_by(id=recipe_id, user_id=user_id).first()

        if not favorite:
            return response(404, "Favorite recipe not found")

        db.session.delete(favorite)
        db.session.commit()

        return response(200, "Favorite recipe deleted successfully")

    except Exception as e:
        return response(500, "An error occurred while deleting the favorite recipe", str(e))
