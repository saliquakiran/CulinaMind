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

    print("=== OpenAI Service Started ===")  # Debug log
    print(f"API Key exists: {bool(openai.api_key)}")  # Debug log
    print(f"API Key length: {len(openai.api_key) if openai.api_key else 0}")  # Debug log
    print(f"API Key starts with 'sk-': {openai.api_key.startswith('sk-') if openai.api_key else False}")  # Debug log

    # Construct prompt based on input preferences
    prompt = f"""
    Generate 4 COMPLETELY DISTINCT and diverse recipe suggestions using the following user input:
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
        prompt += "\n- STRICT MODE: Only use the ingredients provided above. Do not include any other ingredients in the recipe."
    else:
        prompt += "\n- FLEXIBLE MODE: You MUST include the listed ingredients PLUS additional complementary ingredients to create a complete, flavorful dish. Each recipe should have 2-4 additional main ingredients (vegetables, proteins, spices, herbs, etc.) that enhance the dish. Do not just use the provided ingredients alone."

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

    print("Prompt constructed, calling OpenAI...")  # Debug log

    try:
        # Call OpenAI Chat API with custom prompt
        print("Making OpenAI API call...")  # Debug log
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a Michelin-star AI chef that writes very detailed cooking recipes for home users. When in flexible mode, you MUST include additional ingredients beyond what the user provides to create complete, restaurant-quality dishes. Never create recipes with just the minimal ingredients provided. You MUST create COMPLETELY DISTINCT recipes with different cooking methods, flavor profiles, and dish types to provide true variety. IMPORTANT: For time breakdown, use numbered keys (1, 2, 3, 4, 5...) that correspond to each instruction step, and 'T' for total time."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8
        )
        
        print("OpenAI API call successful!")  # Debug log
        print(f"Response choices: {len(response.choices)}")  # Debug log

        # Extract and parse the generated JSON recipes
        response_text = response.choices[0].message.content.strip()
        print(f"Response text length: {len(response_text)}")  # Debug log
        print(f"Response text preview: {response_text[:200]}...")  # Debug log
        
        parsed_recipes = json.loads(response_text)
        print(f"JSON parsed successfully. Type: {type(parsed_recipes)}, Length: {len(parsed_recipes) if isinstance(parsed_recipes, list) else 'Not a list'}")  # Debug log
        
        # Debug: Check if nutritional_info is present
        if isinstance(parsed_recipes, list) and len(parsed_recipes) > 0:
            print("=== AI RECIPE GENERATION DEBUG ===")
            for i, recipe in enumerate(parsed_recipes):
                print(f"Recipe {i+1}: {recipe.get('title', 'No title')}")
                print(f"  - Has nutritional_info: {'nutritional_info' in recipe}")
                print(f"  - nutritional_info value: {recipe.get('nutritional_info', 'MISSING')}")
                print(f"  - Has estimated_cooking_time: {'estimated_cooking_time' in recipe}")
                print(f"  - estimated_cooking_time value: {recipe.get('estimated_cooking_time', 'MISSING')}")
            print("=== END AI DEBUG ===")
            
            # Generate unique images for each recipe
            print("=== GENERATING RECIPE IMAGES ===")
            for i, recipe in enumerate(parsed_recipes):
                try:
                    print(f"Generating image for recipe {i+1}: {recipe.get('title', 'No title')}")
                    image_url = generate_recipe_image(recipe.get('title', ''))
                    print(f"  Raw image_url response: {image_url}")
                    print(f"  Type of image_url: {type(image_url)}")
                    
                    if isinstance(image_url, str) and image_url.startswith('http'):
                        recipe['image_url'] = image_url
                        print(f"  ✓ Image generated successfully: {image_url[:50]}...")
                    else:
                        print(f"  ✗ Image generation failed or returned invalid URL: {image_url}")
                        recipe['image_url'] = None
                except Exception as e:
                    print(f"  ✗ Error generating image: {str(e)}")
                    import traceback
                    print(f"  Full traceback: {traceback.format_exc()}")
                    recipe['image_url'] = None
            print("=== IMAGE GENERATION COMPLETE ===")
            print("Final recipes with image_urls:")
            for i, recipe in enumerate(parsed_recipes):
                print(f"  Recipe {i+1}: {recipe.get('title')} -> image_url: {recipe.get('image_url', 'NONE')}")
        
        return parsed_recipes

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")  # Debug log
        print(f"Response text that failed to parse: {response_text}")  # Debug log
        return {"error": "Failed to parse OpenAI response as JSON"}

    except openai.OpenAIError as api_error:
        print(f"OpenAI API error: {str(api_error)}")  # Debug log
        return {"error": "OpenAI API error", "details": str(api_error)}

    except Exception as e:
        print(f"Unexpected error in OpenAI service: {str(e)}")  # Debug log
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")  # Debug log
        return {"error": str(e)}


def generate_recipe_image(recipe_name):
    """Generate an AI-generated recipe image based on the name."""
    try:
        print(f"    Starting image generation for: {recipe_name}")
        
        # Create a more detailed and specific prompt for better image generation
        detailed_prompt = f"""
        Professional food photography of {recipe_name}, beautifully plated on a ceramic dish, 
        with perfect lighting, garnished with fresh herbs, shot from a 45-degree angle, 
        high resolution, restaurant quality, appetizing presentation, 
        warm and inviting atmosphere, no text or watermarks
        """
        
        print(f"    DALL-E prompt: {detailed_prompt.strip()}")
        print(f"    Calling DALL-E API...")
        
        # Call OpenAI DALL·E API to generate an image for the recipe
        image_response = openai.images.generate(
            model="dall-e-3",
            prompt=detailed_prompt.strip(),
            n=1,
            size="1024x1024",
            quality="hd"
        )

        print(f"    DALL-E API response received: {type(image_response)}")
        print(f"    Response data: {image_response.data}")
        
        # Return the image URL
        image_url = image_response.data[0].url
        print(f"    Generated image URL: {image_url}")
        return image_url

    except openai.OpenAIError as api_error:
        print(f"    DALL-E API error: {str(api_error)}")
        return {"error": "OpenAI API error", "details": str(api_error)}

    except Exception as e:
        print(f"    Image generation error: {str(e)}")
        import traceback
        print(f"    Full traceback: {traceback.format_exc()}")
        return {"error": str(e)}
