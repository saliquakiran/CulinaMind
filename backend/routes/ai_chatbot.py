from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.rag_service import CulinaryRAGService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ai_chatbot_bp = Blueprint('ai_chatbot', __name__)
rag_service = CulinaryRAGService()

@ai_chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Handle chat messages and return AI responses using enhanced RAG"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_context = data.get('context', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} sent message: {user_message}")
        
        # Generate AI response using enhanced RAG
        ai_response = rag_service.generate_response(user_message, user_context)
        
        # Log the interaction
        logger.info(f"AI response generated for user {user_id}")
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'user_message': user_message,
            'model': 'gpt-3.5-turbo',
            'search_method': 'semantic_vector_search'
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process message',
            'response': 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
        }), 500

@ai_chatbot_bp.route('/tips', methods=['GET'])
@jwt_required()
def get_cooking_tips():
    """Get random cooking tips with optional category filtering"""
    try:
        category = request.args.get('category', None)
        difficulty = request.args.get('difficulty', None)
        
        if category and difficulty:
            tips = rag_service.search_by_category(category, difficulty)
        elif category:
            tips = rag_service.search_by_category(category)
        else:
            tips = rag_service.get_cooking_tips()
        
        return jsonify({
            'success': True,
            'tips': tips,
            'filters': {'category': category, 'difficulty': difficulty}
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
    """Suggest recipe modifications using enhanced knowledge retrieval"""
    try:
        data = request.get_json()
        original_recipe = data.get('recipe', '').strip()
        modification_request = data.get('request', '').strip()
        
        if not original_recipe or not modification_request:
            return jsonify({'error': 'Recipe and modification request are required'}), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} requested recipe modification")
        
        # Generate modification suggestions using enhanced RAG
        suggestions = rag_service.suggest_recipe_modifications(original_recipe, modification_request)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'original_recipe': original_recipe,
            'modification_request': modification_request,
            'method': 'enhanced_rag_modification'
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
    """Search knowledge base with semantic search"""
    try:
        query = request.args.get('query', '').strip()
        category = request.args.get('category', None)
        difficulty = request.args.get('difficulty', None)
        limit = min(int(request.args.get('limit', 10)), 20)  # Max 20 results
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Perform semantic search
        results = rag_service.retrieve_relevant_knowledge(query, top_k=limit)
        
        # Apply additional filters if specified
        if category or difficulty:
            filtered_results = []
            for item in results:
                if category and item.get('category') != category:
                    continue
                if difficulty and item.get('difficulty') != difficulty:
                    continue
                filtered_results.append(item)
            results = filtered_results
        
        return jsonify({
            'success': True,
            'results': results,
            'query': query,
            'total_results': len(results),
            'filters': {'category': category, 'difficulty': difficulty},
            'search_method': 'semantic_vector_search'
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
        stats = rag_service.get_knowledge_stats()
        
        return jsonify({
            'success': True,
            'categories': stats['categories'],
            'difficulties': stats['difficulties'],
            'cuisines': stats['cuisines'],
            'total_items': stats['total_items']
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
        test_response = rag_service.generate_response("Hello")
        
        # Get service statistics
        stats = rag_service.get_knowledge_stats()
        
        # Check vector search availability
        vector_search_status = "operational" if stats.get('vector_search_available') else "unavailable"
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'rag_service': 'operational',
            'vector_search': vector_search_status,
            'openai': 'connected' if test_response else 'error',
            'knowledge_base': {
                'total_items': stats['total_items'],
                'categories': len(stats['categories']),
                'difficulties': len(stats['difficulties']),
                'cuisines': len(stats['cuisines'])
            },
            'embedding_model': 'text-embedding-3-small',
            'llm_model': 'gpt-3.5-turbo'
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@ai_chatbot_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_service_stats():
    """Get detailed service statistics and performance metrics"""
    try:
        stats = rag_service.get_knowledge_stats()
        
        return jsonify({
            'success': True,
            'service_stats': {
                'knowledge_base_size': stats['total_items'],
                'vector_search_enabled': stats['vector_search_available'],
                'embedding_model': 'text-embedding-3-small',
                'llm_model': 'gpt-3.5-turbo',
                'search_methods': ['semantic_vector_search', 'keyword_fallback']
            },
            'knowledge_distribution': {
                'by_category': stats['categories'],
                'by_difficulty': stats['difficulties'],
                'by_cuisine': stats['cuisines']
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting service stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get service statistics'
        }), 500 