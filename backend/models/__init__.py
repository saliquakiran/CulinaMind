from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Create instances here to avoid circular imports
db = SQLAlchemy()
bcrypt = Bcrypt()

# Import models after creating instances
from .user import User, FavoriteRecipe

__all__ = ['db', 'bcrypt', 'User', 'FavoriteRecipe']
