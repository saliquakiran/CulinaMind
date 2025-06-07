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

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5001)
