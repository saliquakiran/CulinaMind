from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models.user import db, bcrypt
from routes.auth import auth_bp
from routes.recipes import recipes_bp

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)  # Flask-Migrate for database migrations

# Register blueprints (auth & recipe routes)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(recipes_bp, url_prefix="/recipes")

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
