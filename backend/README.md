# CulinaMind Backend

This is the backend API server for the CulinaMind AI Recipe Assistant application.

## 🏗️ Project Structure

```
backend/
├── app.py                    # Main Flask application entry point
├── config.py                 # Configuration settings and environment variables
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (not in git)
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── data/                    # Database files and data storage
│   ├── .gitkeep
│   ├── culina_mind.db      # Main application database
│   └── dynamic_knowledge.db # Dynamic knowledge base database
├── models/                  # Database models and AI models
│   ├── __init__.py
│   ├── user.py             # User data model
│   └── ai/                 # AI model files
│       ├── .gitkeep
│       ├── culinary_embeddings.pkl    # Vector embeddings
│       └── culinary_faiss_index.bin   # FAISS search index
├── routes/                  # API route handlers
│   ├── __init__.py
│   ├── auth.py             # Authentication endpoints
│   ├── recipes.py          # Recipe management endpoints
│   └── ai_chatbot.py       # AI chatbot endpoints
├── utils/                   # Utility functions and services
│   ├── culinary_apis.py    # External API integrations
│   ├── dynamic_knowledge_manager.py # Dynamic content management
│   ├── openai_service.py   # OpenAI API service
│   └── rag_service.py      # RAG (Retrieval-Augmented Generation) service
├── scripts/                 # Utility scripts and tools
│   ├── .gitkeep
│   ├── clear_favorites.py  # Clear user favorites
│   ├── demo_external_apis.py # Demo external API integrations
│   └── test_rag.py         # Test RAG service functionality
├── migrations/              # Database schema migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/           # Migration version files
└── venv/                    # Python virtual environment (not in git)
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
FLASK_APP=app.py
FLASK_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# Database
DATABASE_PATH=data/culina_mind.db
```

### 3. Run Database Migrations
```bash
flask db upgrade
```

### 4. Start the Server
```bash
flask run
```

## 🔧 Development

### Database Migrations
```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

### Running Scripts
```bash
# Test RAG service
python scripts/test_rag.py

# Demo external APIs
python scripts/demo_external_apis.py

# Clear user favorites
python scripts/clear_favorites.py
```

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh JWT token

### Recipes
- `GET /recipes/search` - Search recipes
- `POST /recipes/generate` - Generate AI recipes
- `GET /recipes/favorites` - Get user favorites
- `POST /recipes/favorites` - Add to favorites

### AI Chatbot
- `POST /ai/chat` - Chat with AI assistant
- `GET /ai/health` - Service health check
- `GET /ai/stats` - Service statistics

## 🗄️ Database Schema

### Main Tables
- `user` - User accounts and profiles
- `favorite_recipe` - User's favorite recipes
- `meal_plan` - User meal planning
- `shopping_list` - Shopping lists

### Dynamic Knowledge Tables
- `external_recipes` - Recipes from external APIs
- `culinary_news` - Food and cooking news
- `trending_topics` - Popular culinary topics
- `seasonal_ingredients` - Seasonal produce information

## 🤖 AI Features

### RAG System
- **Vector Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Semantic Search**: FAISS index for sub-millisecond search
- **Knowledge Base**: 18+ curated culinary knowledge items
- **Fallback Search**: Keyword search when vector search fails

### External API Integration
- **Spoonacular**: 5,000+ recipes and nutrition data
- **Edamam**: Recipe search and dietary restrictions
- **News API**: Culinary trends and news
- **Real-time Updates**: 6-hour refresh intervals

## 🧪 Testing

### Run Tests
```bash
# Test RAG service
python scripts/test_rag.py

# Test external APIs
python scripts/demo_external_apis.py
```

### Test Coverage
- Vector embedding generation and caching
- FAISS index building and search
- Semantic search accuracy
- API endpoint functionality
- Error handling and fallbacks

## 📈 Performance

### Search Performance
- **Vector Search**: ~1-5ms response time
- **Keyword Fallback**: ~1-5ms response time
- **AI Response**: ~2-5 seconds (OpenAI API dependent)

### Scalability
- **Knowledge Items**: Designed for 100K+ items
- **Concurrent Users**: Supports multiple simultaneous requests
- **Database**: SQLite with migration support

## 🔒 Security

### Authentication
- JWT-based authentication
- Google OAuth integration
- Password hashing with bcrypt
- Token refresh mechanism

### Data Protection
- Environment variable configuration
- Database connection security
- API rate limiting (configurable)
- Input validation and sanitization

## 🚀 Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite for production
- Implement Redis for caching
- Add monitoring and logging
- Set up CI/CD pipeline
- Use environment-specific configurations

### Docker Support
```bash
# Build image
docker build -t culinamind-backend .

# Run container
docker run -p 5000:5000 culinamind-backend
```

## 📝 Contributing

### Code Style
- Follow PEP 8 Python style guide
- Use type hints for function parameters
- Add docstrings for all functions
- Include error handling and logging

### Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- Update documentation for new features
- Test changes before submitting PR

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure database files exist in `data/` directory
2. **AI Models**: Check that embedding files exist in `models/ai/` directory
3. **Environment Variables**: Verify `.env` file is properly configured
4. **Dependencies**: Ensure virtual environment is activated and dependencies installed

### Logs
- Check Flask application logs for errors
- Monitor OpenAI API response times
- Verify database migration status
- Check external API connectivity

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [FAISS Documentation](https://github.com/facebookresearch/faiss) 