#!/usr/bin/env python3
"""
Test script to verify PostgreSQL connection
Run this script to test if the database connection is working properly
"""

import os
import sys
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

def test_postgres_connection():
    """Test PostgreSQL database connection"""
    print("🔍 Testing PostgreSQL connection...")
    
    # Load environment variables
    load_dotenv()
    
    # Create Flask app instance
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize SQLAlchemy
    db = SQLAlchemy(app)
    
    try:
        # Test connection
        with app.app_context():
            # Try to execute a simple query
            result = db.session.execute(db.text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            
            if test_value == 1:
                print("✅ PostgreSQL connection successful!")
                print(f"📊 Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
                return True
            else:
                print("❌ Connection test failed - unexpected result")
                return False
                
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your .env file has correct database credentials")
        print("3. Verify the database 'culina_mind' exists")
        print("4. Ensure the user has proper permissions")
        return False

if __name__ == "__main__":
    success = test_postgres_connection()
    sys.exit(0 if success else 1)
