import openai
import os
import json
from config import Config

# Initialize OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")


def generate_recipes(ingredients, cuisine, dietary_restrictions, time_limit, serving_size, exemption=None, strict_ingredients=False):
    """
    Generate AI-based recipe suggestions based on user input.
    Optionally enforces using only the provided ingredients.
    """

    # Construct prompt based on input preferences
    prompt = f"""
    Generate 4 unique and well-structured recipe suggestions using the following user input:
    - Ingredients available: {', '.join(ingredients)}
    - Preferred Cuisine: {cuisine}
    - Dietary Restrictions: {', '.join(dietary_restrictions)}
    - Maximum Cooking Time: {time_limit}
    - Number of Servings: {serving_size}
    """

    # If cuisine is "Surprise Me", avoid using exempted ingredients
    if cuisine.lower() == "surprise me" and exemption:
        prompt += f"\n- Do not use these ingredients: {exemption}"

    # Add strict or flexible ingredient handling instructions
    if strict_ingredients:
        prompt += "\n- Only use the ingredients provided above to provide recipes. Do not include any other ingredients."
    else:
        prompt += "\n- Give recipes that include the listed ingredients and other unlisted ingredients that if added would make the better dish out of the ingredients."

    # Append JSON formatting and validation instructions
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
                "Step 1": "e.g., 10 minutes",
                "Step 2": "e.g., 15 minutes",
                ...
                "Total Time": "Must equal estimated_cooking_time"
            }
        },
        ...
    ]

    Rules:
    - Only output valid JSON with 4 complete recipe objects inside an array.
    - Match "time_breakdown" entries to each instruction step exactly.
    - Make sure instructions are as detailed as possible, like from a cookbook.
    - No extra explanations, introductions, or wrapping text.
    """

    try:
        # Call OpenAI Chat API with custom prompt
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a Michelin-star AI chef that writes very detailed cooking recipes for home users."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # Extract and parse the generated JSON recipes
        response_text = response.choices[0].message.content.strip()
        return json.loads(response_text)

    except json.JSONDecodeError:
        return {"error": "Failed to parse OpenAI response as JSON"}

    except openai.OpenAIError as api_error:
        return {"error": "OpenAI API error", "details": str(api_error)}

    except Exception as e:
        return {"error": str(e)}


def generate_recipe_image(recipe_name):
    """Generate an AI-generated recipe image based on the name."""
    try:
        # Call OpenAI DALL·E API to generate an image for the recipe
        image_response = openai.images.generate(
            model="dall-e-3",
            prompt=f"A high-quality image of {recipe_name} plated beautifully, food photography style",
            n=1,
            size="1024x1024"
        )

        # Return the image URL
        return image_response.data[0].url

    except openai.OpenAIError as api_error:
        return {"error": "OpenAI API error", "details": str(api_error)}

    except Exception as e:
        return {"error": str(e)}
