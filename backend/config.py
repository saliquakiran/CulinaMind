import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    # PostgreSQL database configuration
    # Railway provides DATABASE_URL, fallback to individual variables for local development
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if DATABASE_URL:
        # Use Railway's DATABASE_URL format
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Local development with individual variables
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "5432")
        DB_NAME = os.getenv("DB_NAME", "culina_mind")
        DB_USER = os.getenv("DB_USER", "postgres")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        
        # Construct PostgreSQL connection string for local development
        SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # OAuth Settings
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
    FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")

    # Anthropic API Settings
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")