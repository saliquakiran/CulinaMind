from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.enhanced_rag_service import EnhancedRAGService
from utils.context_manager import ContextManager, UserProfile, SessionContext, ConversationContext
import logging
import uuid
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ai_chatbot_bp = Blueprint('ai_chatbot', __name__)

# Initialize enhanced RAG service with context management
context_manager = ContextManager()
rag_service = EnhancedRAGService(context_manager)

@ai_chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Handle chat messages with enhanced context engineering"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        context = data.get('context', {})
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} sent message: {user_message}")
        
        # Generate AI response using enhanced context-aware RAG
        ai_response = rag_service.generate_contextual_response(
            user_id=user_id,
            session_id=session_id,
            user_query=user_message,
            context=context
        )
        
        # Log the interaction
        logger.info(f"AI response generated for user {user_id}")
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'user_message': user_message,
            'session_id': session_id,
            'model': 'gpt-3.5-turbo',
            'context_enhanced': True,
            'search_method': 'semantic_vector_search_with_context'
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process message',
            'response': 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
        }), 500

@ai_chatbot_bp.route('/start-conversation', methods=['POST'])
@jwt_required()
def start_conversation():
    """Start a new conversation with personalized greeting"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', str(uuid.uuid4()))
        user_id = get_jwt_identity()
        
        # Get personalized conversation starter
        greeting = rag_service.get_conversation_starter(user_id, session_id)
        
        # Initialize session context
        session_context = SessionContext(
            session_id=session_id,
            user_id=user_id,
            session_start_time=datetime.now()
        )
        context_manager.save_session_context(session_context)
        
        return jsonify({
            'success': True,
            'greeting': greeting,
            'session_id': session_id,
            'context_initialized': True
        })
        
    except Exception as e:
        logger.error(f"Error starting conversation: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to start conversation'
        }), 500

@ai_chatbot_bp.route('/update-preferences', methods=['POST'])
@jwt_required()
def update_preferences():
    """Update user preferences and context"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        preferences = data.get('preferences', {})
        
        if not preferences:
            return jsonify({'error': 'Preferences are required'}), 400
        
        # Update user preferences
        success = rag_service.update_user_preferences(user_id, preferences)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Preferences updated successfully',
                'preferences': preferences
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update preferences'
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating preferences: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update preferences'
        }), 500

@ai_chatbot_bp.route('/get-profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get current user profile and preferences"""
    try:
        user_id = get_jwt_identity()
        profile = context_manager.load_user_profile(user_id)
        
        if profile:
            return jsonify({
                'success': True,
                'profile': {
                    'skill_level': profile.skill_level,
                    'dietary_restrictions': profile.dietary_restrictions,
                    'cuisine_preferences': profile.cuisine_preferences,
                    'cooking_equipment': profile.cooking_equipment,
                    'ingredient_preferences': profile.ingredient_preferences,
                    'ingredient_dislikes': profile.ingredient_dislikes,
                    'health_goals': profile.health_goals,
                    'last_updated': profile.last_updated.isoformat() if profile.last_updated else None
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Profile not found'
            }), 404
        
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get user profile'
        }), 500

@ai_chatbot_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized recommendations"""
    try:
        user_id = get_jwt_identity()
        query = request.args.get('query', None)
        
        recommendations = rag_service.get_personalized_recommendations(user_id, query)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'count': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get recommendations'
        }), 500

@ai_chatbot_bp.route('/update-session', methods=['POST'])
@jwt_required()
def update_session():
    """Update current session context"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_id = get_jwt_identity()
        session_data = data.get('session_data', {})
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        # Load existing session or create new one
        session_context = context_manager.load_session_context(session_id)
        if not session_context:
            session_context = SessionContext(session_id=session_id, user_id=user_id)
        
        # Update session with new data
        for key, value in session_data.items():
            if hasattr(session_context, key):
                setattr(session_context, key, value)
        
        # Save updated session
        success = context_manager.save_session_context(session_context)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Session updated successfully',
                'session_id': session_id
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update session'
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating session: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update session'
        }), 500

@ai_chatbot_bp.route('/tips', methods=['GET'])
@jwt_required()
def get_cooking_tips():
    """Get personalized cooking tips"""
    try:
        user_id = get_jwt_identity()
        category = request.args.get('category', None)
        difficulty = request.args.get('difficulty', None)
        
        # Get user profile for personalization
        user_profile = context_manager.load_user_profile(user_id)
        
        if category and difficulty:
            tips = rag_service._semantic_search(f"{category} {difficulty}", top_k=3, user_profile=user_profile)
        elif category:
            tips = rag_service._semantic_search(category, top_k=3, user_profile=user_profile)
        else:
            tips = rag_service._semantic_search("cooking tips", top_k=3, user_profile=user_profile)
        
        # Extract just the content
        tip_content = [item['content'] for score, item in tips]
        
        return jsonify({
            'success': True,
            'tips': tip_content,
            'filters': {'category': category, 'difficulty': difficulty},
            'personalized': True
        })
        
    except Exception as e:
        logger.error(f"Error getting cooking tips: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get cooking tips'
        }), 500

@ai_chatbot_bp.route('/modify-recipe', methods=['POST'])
@jwt_required()
def modify_recipe():
    """Suggest recipe modifications with context awareness"""
    try:
        data = request.get_json()
        original_recipe = data.get('recipe', '').strip()
        modification_request = data.get('request', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not original_recipe or not modification_request:
            return jsonify({'error': 'Recipe and modification request are required'}), 400
        
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} requested recipe modification")
        
        # Use enhanced RAG for recipe modification
        context = {
            'original_recipe': original_recipe,
            'modification_request': modification_request,
            'current_recipe': original_recipe
        }
        
        suggestions = rag_service.generate_contextual_response(
            user_id=user_id,
            session_id=session_id,
            user_query=f"Modify this recipe: {modification_request}",
            context=context
        )
        
        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'original_recipe': original_recipe,
            'modification_request': modification_request,
            'method': 'enhanced_context_aware_modification'
        })
        
    except Exception as e:
        logger.error(f"Error in recipe modification: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate modification suggestions'
        }), 500

@ai_chatbot_bp.route('/search', methods=['GET'])
@jwt_required()
def search_knowledge():
    """Search knowledge base with context-aware semantic search"""
    try:
        query = request.args.get('query', '').strip()
        category = request.args.get('category', None)
        difficulty = request.args.get('difficulty', None)
        limit = min(int(request.args.get('limit', 10)), 20)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        user_id = get_jwt_identity()
        user_profile = context_manager.load_user_profile(user_id)
        
        # Perform context-aware semantic search
        results = rag_service._semantic_search(query, top_k=limit, user_profile=user_profile)
        
        # Apply additional filters if specified
        if category or difficulty:
            filtered_results = []
            for score, item in results:
                if category and item.get('category') != category:
                    continue
                if difficulty and item.get('difficulty') != difficulty:
                    continue
                filtered_results.append((score, item))
            results = filtered_results
        
        # Extract items from results
        search_results = [item for score, item in results]
        
        return jsonify({
            'success': True,
            'results': search_results,
            'query': query,
            'total_results': len(search_results),
            'filters': {'category': category, 'difficulty': difficulty},
            'search_method': 'context_aware_semantic_search',
            'personalized': True
        })
        
    except Exception as e:
        logger.error(f"Error in knowledge search: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to search knowledge base'
        }), 500

@ai_chatbot_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get available categories and their counts"""
    try:
        stats = rag_service.knowledge_base
        categories = {}
        difficulties = {}
        cuisines = {}
        
        for item in stats:
            # Count by category
            cat = item["category"]
            categories[cat] = categories.get(cat, 0) + 1
            
            # Count by difficulty
            diff = item["difficulty"]
            difficulties[diff] = difficulties.get(diff, 0) + 1
            
            # Count by cuisine
            cui = item["cuisine"]
            cuisines[cui] = cuisines.get(cui, 0) + 1
        
        return jsonify({
            'success': True,
            'categories': categories,
            'difficulties': difficulties,
            'cuisines': cuisines,
            'total_items': len(stats)
        })
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get category information'
        }), 500

@ai_chatbot_bp.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint for the AI chatbot service"""
    try:
        # Test if RAG service is working
        test_response = rag_service.generate_contextual_response("test", "test", "Hello")
        
        # Get service statistics
        stats = {
            'total_items': len(rag_service.knowledge_base),
            'vector_search_available': rag_service.faiss_index is not None
        }
        
        # Check vector search availability
        vector_search_status = "operational" if stats.get('vector_search_available') else "unavailable"
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'rag_service': 'operational',
            'vector_search': vector_search_status,
            'context_management': 'operational',
            'openai': 'connected' if test_response else 'error',
            'knowledge_base': {
                'total_items': stats['total_items'],
                'context_enhanced': True
            },
            'embedding_model': 'text-embedding-3-small',
            'llm_model': 'gpt-3.5-turbo',
            'context_engineering': 'enabled'
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@ai_chatbot_bp.route('/cleanup', methods=['POST'])
@jwt_required()
def cleanup_context():
    """Clean up old context data"""
    try:
        cleaned_count = rag_service.cleanup_old_context()
        
        return jsonify({
            'success': True,
            'message': f'Cleaned up {cleaned_count} old context files',
            'cleaned_count': cleaned_count
        })
        
    except Exception as e:
        logger.error(f"Error cleaning up context: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to clean up context'
        }), 500

@ai_chatbot_bp.route('/generate-recipes', methods=['POST'])
@jwt_required()
def generate_recipes_via_chat():
    """Generate recipes through the AI chatbot with full context integration"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        # Extract recipe parameters
        ingredients = data.get('ingredients', [])
        cuisine = data.get('cuisine', '')
        dietary_restrictions = data.get('dietary_restrictions', [])
        time_limit = data.get('time_limit', '')
        serving_size = data.get('serving_size', '')
        strict_ingredients = data.get('strict_ingredients', False)
        exemption = data.get('exemption', '')
        
        # Validate inputs
        if not ingredients and not any([cuisine, dietary_restrictions, time_limit, serving_size]):
            return jsonify({'error': 'Please provide ingredients or at least 2 filter options'}), 400
        
        if ingredients and len(ingredients) < 4:
            return jsonify({'error': 'Please provide at least 4 ingredients'}), 400
        
        # Generate context-aware recipes
        recipes = rag_service.generate_contextual_recipes(
            user_id=user_id,
            session_id=session_id,
            ingredients=ingredients,
            cuisine=cuisine,
            dietary_restrictions=dietary_restrictions,
            time_limit=time_limit,
            serving_size=serving_size,
            strict_ingredients=strict_ingredients,
            exemption=exemption
        )
        
        # Generate a conversational response about the recipes
        recipe_summary = f"I've generated {len(recipes)} personalized recipes for you"
        if ingredients:
            recipe_summary += f" using your ingredients: {', '.join(ingredients[:3])}"
            if len(ingredients) > 3:
                recipe_summary += f" and {len(ingredients) - 3} more"
        if cuisine:
            recipe_summary += f" in the {cuisine} style"
        
        return jsonify({
            'success': True,
            'response': recipe_summary,
            'recipes': recipes,
            'session_id': session_id,
            'context_enhanced': True,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Error generating recipes via chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate recipes',
            'response': 'I apologize, but I\'m having trouble generating recipes right now. Please try again in a moment.'
        }), 500

@ai_chatbot_bp.route('/recipe-suggestions', methods=['POST'])
@jwt_required()
def get_recipe_suggestions():
    """Get personalized recipe suggestions based on conversation context"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        session_id = data.get('session_id', str(uuid.uuid4()))
        query = data.get('query', 'What should I cook today?')
        
        # Get personalized recommendations
        recommendations = rag_service.get_personalized_recommendations(user_id, query)
        
        # Generate contextual response
        ai_response = rag_service.generate_contextual_response(
            user_id=user_id,
            session_id=session_id,
            user_query=query,
            context={'recommendation_type': 'recipes'}
        )
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'recommendations': recommendations,
            'session_id': session_id,
            'context_enhanced': True
        })
        
    except Exception as e:
        logger.error(f"Error getting recipe suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get recipe suggestions',
            'response': 'I apologize, but I\'m having trouble suggesting recipes right now. Please try again in a moment.'
        }), 500

