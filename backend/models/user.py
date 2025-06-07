from models import db, bcrypt
import json

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True) # Primary key
    first_name = db.Column(db.String(100), nullable=False) # User's first name
    last_name = db.Column(db.String(100), nullable=False) # User's last name
    email = db.Column(db.String(100), unique=True, nullable=False, index=True) # Unique email
    password = db.Column(db.String(255), nullable=True) # Hashed password
    google_id = db.Column(db.String(128), unique=True, nullable=True, index=True) # Google OAuth ID
    facebook_id = db.Column(db.String(128), unique=True, nullable=True, index=True) # Facebook OAuth ID

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8") # Hash and store password

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password) # Verify password

class FavoriteRecipe(db.Model):
    __tablename__ = "favorite_recipe"

    id = db.Column(db.Integer, primary_key=True) # Primary key
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False) # Foreign key to user
    title = db.Column(db.String(255), nullable=False) # Recipe title
    ingredients = db.Column(db.Text, nullable=False) # JSON-encoded ingredients list
    instructions = db.Column(db.Text, nullable=False) # JSON-encoded instructions list
    image_url = db.Column(db.String(500), nullable=True) # Optional image URL
    time = db.Column(db.String(100), nullable=True)  # Cooking time
    nutritional_value = db.Column(db.String(255), nullable=True) # Nutritional information
    time_breakdown = db.Column(db.Text, nullable=True) # JSON-encoded time details

    user = db.relationship("User", backref=db.backref("favorites", lazy=True)) # Relationship to User

    def __repr__(self):
        return f"<FavoriteRecipe(id={self.id}, title={self.title})>"

    def to_dict(self):
        try:
            ingredients = json.loads(self.ingredients) # Parse ingredients JSON
            instructions = json.loads(self.instructions) # Parse instructions JSON
            time_breakdown = json.loads(self.time_breakdown) if self.time_breakdown else {} # Optional field
        except json.JSONDecodeError:
            ingredients = []
            instructions = []
            time_breakdown = {}

        return {
            "id": self.id,
            "title": self.title,
            "ingredients": ingredients,
            "instructions": instructions,
            "image_url": self.image_url,
            "time": self.time,
            "nutritional_value": self.nutritional_value,
            "time_breakdown": time_breakdown,
        }
