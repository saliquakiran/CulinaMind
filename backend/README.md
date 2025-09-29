# CulinaMind Backend

Backend API server for the CulinaMind AI Recipe Assistant application.

## 🏗️ Project Structure

```
backend/
├── app.py                              # Flask application entry point
├── config.py                           # Configuration settings
├── requirements.txt                    # Python dependencies
├── mcp_config.json                     # MCP configuration
├── data/                               # Database and context storage
│   ├── culina_mind (PostgreSQL)        # Main PostgreSQL database
│   ├── dynamic_knowledge.db            # Knowledge base database
│   └── context/                        # Context engineering data
│       ├── conversations/              # Chat history
│       ├── profiles/                   # User profiles
│       └── sessions/                   # Session context
├── models/                             # Database models
│   ├── __init__.py                     # Database initialization
│   ├── user.py                         # User and FavoriteRecipe models
│   └── ai/                             # AI model files
│       ├── culinary_embeddings.pkl     # Vector embeddings
│       └── culinary_faiss_index.bin    # FAISS search index
├── routes/                             # API endpoints
│   ├── auth.py                         # Authentication
│   ├── recipes.py                      # Recipe management
│   ├── ai_chatbot.py                   # AI chat
│   └── mcp_validation_anthropic.py     # MCP validation
├── utils/                              # Utility services
│   ├── mcp_validator_anthropic.py      # Anthropic MCP integration
│   ├── context_manager.py              # Context management
│   ├── context_optimizer.py            # Context optimization
│   ├── culinary_apis.py                # External APIs
│   ├── enhanced_rag_service.py         # Enhanced RAG service
│   ├── openai_service.py               # OpenAI integration
│   └── prompt_engineer.py              # Prompt engineering
├── scripts/                            # Utility scripts
│   ├── clear_favorites.py              # Clear favorites
│   └── demo_external_apis.py           # API demos
├── migrations/                         # Database migrations
└── test/                               # Test suite
```

## 🚀 Quick Start

### 1. Setup
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Database Setup (PostgreSQL)
**Install PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create Database:**
```bash
psql postgres
CREATE DATABASE culina_mind;
\q
```

**Environment Variables:**
Create `.env` file in backend directory:
```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=culina_mind
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# API Keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Run Migrations:**
```bash
flask db upgrade
python test/test_postgres_connection.py  # Test connection
```

### 3. Run Server
```bash
flask run
```
Server runs on `http://localhost:5001`

## 📊 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/login/google` - Google OAuth
- `GET /auth/profile` - Get profile (JWT required)
- `PUT /auth/profile` - Update profile (JWT required)
- `POST /auth/reset-password` - Password reset request
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/reset-password/confirm` - Confirm password reset

### Recipes (`/recipes`)
- `POST /recipes/generate_recipes` - Generate AI recipes (JWT required)
- `POST /recipes/favorite` - Add to favorites (JWT required)
- `GET /recipes/favorites` - Get favorites (JWT required)
- `DELETE /recipes/favorite/<id>` - Remove from favorites (JWT required)
- `GET /recipes/recommendations` - Get recommendations (JWT required)
- `GET /recipes/preferences` - Get user preferences (JWT required)
- `POST /recipes/update-preferences` - Update preferences (JWT required)

### AI Chatbot (`/ai`)
- `POST /ai/chat` - Chat with AI (JWT required)
- `POST /ai/start-conversation` - Start conversation (JWT required)
- `GET /ai/get-profile` - Get user profile (JWT required)
- `POST /ai/update-preferences` - Update preferences (JWT required)
- `GET /ai/recommendations` - Get recommendations (JWT required)
- `GET /ai/tips` - Get cooking tips (JWT required)
- `GET /ai/search` - Search knowledge base (JWT required)
- `GET /ai/health` - Health check

### MCP Validation (`/anthropic-mcp`)
- `POST /anthropic-mcp/validate-entry` - Validate single entry (JWT required)
- `POST /anthropic-mcp/validate-entries` - Validate multiple entries (JWT required)
- `POST /anthropic-mcp/web-search` - Web search (JWT required)
- `GET /anthropic-mcp/health` - Health check

### Debug
- `GET /debug/routes` - List all routes (development only)

## 🗄️ Database Schema

### Tables
- `user` - User accounts (id, first_name, last_name, email, password, google_id, facebook_id)
- `favorite_recipe` - User favorites (id, user_id, title, ingredients, instructions, image_url, time, nutritional_value, time_breakdown)

### Context Storage
- User profiles in `data/context/profiles/`
- Session data in `data/context/sessions/`
- Conversation history in `data/context/conversations/`

## 🤖 AI Features

### RAG System
- OpenAI text-embedding-3-small for vector embeddings
- FAISS index for semantic search
- Curated culinary knowledge base
- Context-aware user profiling

### Context Engineering
- User profiles with preferences and skill levels
- Session management for conversations
- Prompt optimization for better AI responses

### External APIs
- Spoonacular API for recipes
- Edamam API for nutrition data
- Anthropic MCP for web search validation

### OpenAI Integration
- GPT-3.5-turbo for chat and recipe generation
- DALL-E for recipe images
- Text embeddings for semantic search

## 🔧 Development

### Database Migrations
```bash
flask db migrate -m "Description"
flask db upgrade
flask db downgrade
```

### Running Scripts
```bash
python scripts/clear_favorites.py
python scripts/demo_external_apis.py
python examples/context_engineering_demo.py
```

### Testing
```bash
python -m pytest test/
python test/test_rag.py
python test/test_context_engineering.py
python test/test_anthropic_mcp.py
```

## 🔒 Security

- JWT-based authentication
- Google OAuth integration
- bcrypt password hashing
- SQLAlchemy ORM for SQL injection protection
- CORS configuration

## 🚀 Deployment

### Production Setup
- Uses PostgreSQL as the primary database
- Set `FLASK_ENV=production`
- Configure production environment variables
- Implement proper logging and monitoring

### Docker
```bash
docker build -t culinamind-backend .
docker run -p 5001:5001 culinamind-backend
```

## 🆘 Troubleshooting

### Common Issues
1. **Database**: Ensure PostgreSQL is running and database exists
2. **API Keys**: Verify all required environment variables are set in `.env`
3. **Dependencies**: Activate virtual environment and install requirements
4. **Context**: Check `data/context/` directory structure

### Debug Mode
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
flask run
```

### Testing Components
```bash
python test/test_postgres_connection.py
python test/test_anthropic_mcp.py
python test/test_rag.py
python examples/context_engineering_demo.py
```

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)