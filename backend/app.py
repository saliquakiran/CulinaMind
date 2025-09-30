from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models import db, bcrypt

# Import blueprints directly from their modules
from routes.auth import auth_bp
from routes.recipes import recipes_bp
from routes.ai_chatbot import ai_chatbot_bp
from routes.mcp_validation_anthropic import anthropic_mcp_validation_bp

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Set JWT secret key
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY

# Initialize extensions
CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)  # Flask-Migrate for database migrations

# Register blueprints (auth & recipe routes)
print("🔥 Registering auth blueprint...")  # Debug log
app.register_blueprint(auth_bp, url_prefix="/auth")
print("🔥 Registering recipes blueprint...")  # Debug log
app.register_blueprint(recipes_bp, url_prefix="/recipes")
print("🔥 Registering AI chatbot blueprint...")  # Debug log
app.register_blueprint(ai_chatbot_bp, url_prefix="/ai")
print("🔥 Registering Anthropic MCP validation blueprint...")  # Debug log
app.register_blueprint(anthropic_mcp_validation_bp, url_prefix="/anthropic-mcp")
print("🔥 All blueprints registered!")  # Debug log

# Debug: List all registered routes
@app.route("/debug/routes")
def debug_routes():
    """Debug endpoint to see all registered routes"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            "endpoint": rule.endpoint,
            "methods": list(rule.methods),
            "rule": str(rule)
        })
    return {"routes": routes}

# Health check endpoint for Railway
@app.route("/")
def health_check():
    """Health check endpoint for Railway deployment"""
    return {"status": "healthy", "message": "CulinaMind API is running"}, 200

# Run the app
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_ENV") == "development"
    
    print("🚀 Starting CulinaMind Flask app...")
    print("🔥 Using Anthropic MCP for web search validation!")
    print(f"🌐 Running on port {port}, debug={debug}")
    
    app.run(debug=debug, host="0.0.0.0", port=port)
