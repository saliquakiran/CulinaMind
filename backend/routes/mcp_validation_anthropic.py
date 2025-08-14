"""
Anthropic MCP Validation Routes for CulinaMind
This replaces the old MCP validation routes with ones that use the official Anthropic MCP protocol.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.mcp_validator_anthropic import anthropic_mcp_validator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

anthropic_mcp_validation_bp = Blueprint('anthropic_mcp_validation', __name__)

@anthropic_mcp_validation_bp.route('/validate-entry', methods=['POST'])
@jwt_required()
def validate_entry():
    """Validate a user entry using Anthropic MCP web search"""
    try:
        data = request.get_json()
        input_text = data.get('input', '').strip()
        category = data.get('category', '').strip()
        
        if not input_text:
            return jsonify({
                'success': False,
                'error': 'Input text is required'
            }), 400
        
        if not category:
            return jsonify({
                'success': False,
                'error': 'Category is required'
            }), 400
        
        if category not in ['dietary', 'cuisine', 'equipment', 'health']:
            return jsonify({
                'success': False,
                'error': 'Invalid category. Must be one of: dietary, cuisine, equipment, health'
            }), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} validating entry: '{input_text}' in category: '{category}'")
        
        # Validate entry using Anthropic MCP
        validation_result = anthropic_mcp_validator.validate_entry_sync(input_text, category)
        
        # Add metadata
        validation_result['user_id'] = user_id
        validation_result['timestamp'] = anthropic_mcp_validator._get_timestamp() if hasattr(anthropic_mcp_validator, '_get_timestamp') else None
        
        logger.info(f"Validation result for '{input_text}': {validation_result.get('isValid', False)}")
        
        return jsonify({
            'success': True,
            'validation': validation_result
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating entry: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Validation failed: {str(e)}'
        }), 500

@anthropic_mcp_validation_bp.route('/validate-entries', methods=['POST'])
@jwt_required()
def validate_entries():
    """Validate multiple user entries using Anthropic MCP web search"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])
        
        if not entries:
            return jsonify({
                'success': False,
                'error': 'Entries array is required'
            }), 400
        
        if not isinstance(entries, list):
            return jsonify({
                'success': False,
                'error': 'Entries must be an array'
            }), 400
        
        if len(entries) > 10:
            return jsonify({
                'success': False,
                'error': 'Maximum 10 entries allowed per request'
            }), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} validating {len(entries)} entries")
        
        validation_results = []
        
        for entry in entries:
            input_text = entry.get('input', '').strip()
            category = entry.get('category', '').strip()
            
            if not input_text or not category:
                validation_results.append({
                    'input': input_text,
                    'category': category,
                    'validation': {
                        'isValid': False,
                        'confidence': 0.0,
                        'reason': 'Missing input or category',
                        'sources': [],
                        'suggestions': [],
                        'category_match': False
                    }
                })
                continue
            
            if category not in ['dietary', 'cuisine', 'equipment', 'health']:
                validation_results.append({
                    'input': input_text,
                    'category': category,
                    'validation': {
                        'isValid': False,
                        'confidence': 0.0,
                        'reason': 'Invalid category',
                        'sources': [],
                        'suggestions': [],
                        'category_match': False
                    }
                })
                continue
            
            # Validate entry using Anthropic MCP
            validation_result = anthropic_mcp_validator.validate_entry_sync(input_text, category)
            validation_result['user_id'] = user_id
            
            validation_results.append({
                'input': input_text,
                'category': category,
                'validation': validation_result
            })
        
        logger.info(f"Validated {len(validation_results)} entries for user {user_id}")
        
        return jsonify({
            'success': True,
            'results': validation_results
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating entries: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Validation failed: {str(e)}'
        }), 500

@anthropic_mcp_validation_bp.route('/web-search', methods=['POST'])
@jwt_required()
def web_search():
    """Perform web search using Anthropic MCP"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        max_results = data.get('max_results', 5)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        if not isinstance(max_results, int) or max_results < 1 or max_results > 20:
            return jsonify({
                'success': False,
                'error': 'max_results must be an integer between 1 and 20'
            }), 400
        
        # Get user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"User {user_id} searching for: '{query}'")
        
        # Perform web search using Anthropic MCP
        search_results = anthropic_mcp_validator.web_search_sync(query, max_results)
        
        logger.info(f"Found {len(search_results)} results for query: '{query}'")
        
        return jsonify({
            'success': True,
            'query': query,
            'results': search_results,
            'count': len(search_results)
        }), 200
        
    except Exception as e:
        logger.error(f"Error performing web search: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Web search failed: {str(e)}'
        }), 500

@anthropic_mcp_validation_bp.route('/validation-summary', methods=['POST'])
@jwt_required()
def validation_summary():
    """Get validation summary for multiple entries"""
    try:
        data = request.get_json()
        validation_result = data.get('validation_result')
        
        if not validation_result:
            return jsonify({
                'success': False,
                'error': 'validation_result is required'
            }), 400
        
        # Generate summary
        summary = {
            'total_entries': len(validation_result) if isinstance(validation_result, list) else 1,
            'valid_entries': 0,
            'invalid_entries': 0,
            'average_confidence': 0.0,
            'categories': {}
        }
        
        if isinstance(validation_result, list):
            for result in validation_result:
                validation = result.get('validation', {})
                if validation.get('isValid', False):
                    summary['valid_entries'] += 1
                else:
                    summary['invalid_entries'] += 1
                
                category = result.get('category', 'unknown')
                if category not in summary['categories']:
                    summary['categories'][category] = {'valid': 0, 'invalid': 0}
                
                if validation.get('isValid', False):
                    summary['categories'][category]['valid'] += 1
                else:
                    summary['categories'][category]['invalid'] += 1
                
                summary['average_confidence'] += validation.get('confidence', 0.0)
            
            if summary['total_entries'] > 0:
                summary['average_confidence'] /= summary['total_entries']
        else:
            # Single entry
            validation = validation_result.get('validation', {})
            if validation.get('isValid', False):
                summary['valid_entries'] = 1
            else:
                summary['invalid_entries'] = 1
            
            summary['average_confidence'] = validation.get('confidence', 0.0)
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating validation summary: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Summary generation failed: {str(e)}'
        }), 500

@anthropic_mcp_validation_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for Anthropic MCP validation service"""
    try:
        # Test MCP server
        test_result = anthropic_mcp_validator.validate_entry_sync("test", "dietary")
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'mcp_server': 'operational',
            'test_validation': test_result.get('isValid', False)
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500
