# CulinaMind - Culinary AI Agent

CulinaMind is an AI-powered culinary assistant that helps you discover recipes and get cooking guidance. It provides recipe recommendations, ingredient-based recipe generation, and personalized cooking assistance based on your preferences.

## 🌐 Live Deployment

- **Frontend**: [https://culina-mind.vercel.app](https://culina-mind.vercel.app)
- **Backend API**: [https://culinamindbackend-production.up.railway.app](https://culinamindbackend-production.up.railway.app)

**Deployment Stack:**
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

## 🍳 Core Features

### Recipe Generation & Discovery
- **Recipe Creation**: Generate recipes from available ingredients
- **Filtering**: Filter by cuisine, dietary restrictions, time constraints, and serving size
- **Ingredient Options**: Choose between strict ingredient usage or flexible additions
- **Nutritional Information**: AI-generated nutritional data for each recipe
- **Food Images**: DALL·E 3 generated food images
- **Time Estimates**: Cooking time estimates for each step

### AI Culinary Assistant
- **Chat Interface**: RAG system with culinary knowledge items
- **Semantic Search**: Vector embeddings and FAISS-powered knowledge retrieval
- **Personalized Responses**: User profile integration for cooking guidance
- **Cooking Assistance**: Cooking tips, technique explanations, and recipe modifications
- **Session Support**: Conversation history and context preservation

### User Profile & Preferences Management
- **User Preferences**: Skill level, dietary restrictions, cuisine preferences
- **Equipment Tracking**: Available kitchen tools and appliances
- **Ingredient Management**: Favorite ingredients and dislikes
- **Health Goals**: Dietary goals and wellness objectives
- **Time Preferences**: Weekday vs weekend cooking time preferences
- **Serving Size Preferences**: Portion recommendations
- **MCP Validation**: AI-validated custom preference entries

### Recipe Management
- **Favorites System**: Save and organize favorite recipes
- **Recipe Viewing**: Detailed recipe display with ingredients and instructions
- **Search Functionality**: Find recipes by various criteria
- **Personal Recipe Collection**: User-specific recipe storage

### Authentication & Security
- **Auth Methods**: Email/password and Google OAuth integration
- **Sessions**: JWT-based authentication
- **Password Reset**: Email-based password recovery
- **OTP Verification**: Two-factor authentication support
- **Profile Management**: User profile updates

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (Railway)
- **Server**: Gunicorn WSGI server
- **AI/ML**: OpenAI GPT-4, DALL·E 3, FAISS vector search, Anthropic Claude
- **Authentication**: Flask-JWT-Extended, bcrypt
- **APIs**: Spoonacular, Edamam

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React hooks and context
- **Routing**: React Router v6

### AI & RAG System
- **Vector Search**: FAISS-powered semantic search
- **Embeddings**: OpenAI text-embedding-ada-002
- **MCP**: Anthropic Model Context Protocol for validation
- **Context Engineering**: Multi-layer context management (user profiles, conversation history, sessions)

## 🚀 Local Development

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key
- Anthropic API key
- Google OAuth credentials (optional)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

Create `.env` file in `backend/`:
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@localhost:5432/culina_mind
# OR for Railway
DATABASE_PUBLIC_URL=postgresql://...
```

Run migrations and start server:
```bash
flask db upgrade
python app.py  # Development
# OR for production
gunicorn --bind 0.0.0.0:8080 app:app
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5001  # Local backend
# OR
VITE_API_BASE_URL=https://culinamindbackend-production.up.railway.app  # Production
```

Start development server:
```bash
npm run dev  # Visit http://localhost:5173
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation
- `POST /auth/verify-otp` - OTP verification
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Recipe Management
- `POST /recipes/generate` - Generate AI recipes
- `GET /recipes/favorites` - Get user's favorite recipes
- `POST /recipes/favorites` - Add recipe to favorites
- `DELETE /recipes/favorites/<id>` - Remove from favorites
- `GET /recipes/preferences` - Get user preferences
- `POST /recipes/update-preferences` - Update user preferences

### AI Assistant
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/update-preferences` - Update user preferences
- `GET /ai/get-profile` - Get user profile
- `GET /ai/health` - AI service health check
- `POST /ai/tips` - Get cooking tips
- `POST /ai/search` - Semantic knowledge search

### MCP Validation
- `POST /anthropic-mcp/validate-entry` - Validate custom preferences
- `POST /anthropic-mcp/validate-entries` - Batch validation
- `POST /anthropic-mcp/web-search` - Web search integration
- `GET /anthropic-mcp/health` - MCP service health

## 🏗️ Project Structure

```
CulinaMind/
├── backend/                    # Flask API server
│   ├── app.py                 # Application entry point
│   ├── config.py              # Configuration (supports Railway & local)
│   ├── Procfile               # Railway deployment config
│   ├── railway.json           # Railway service config
│   ├── models/                # SQLAlchemy database models
│   ├── routes/                # API blueprints (auth, recipes, ai, mcp)
│   ├── utils/                 # RAG service, context manager, APIs
│   ├── migrations/            # Alembic database migrations
│   └── data/                  # Context storage & embeddings
├── frontend/                  # React TypeScript app
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client (axios)
│   │   └── types/            # TypeScript definitions
│   ├── vercel.json           # Vercel deployment config
│   └── public/               # Static assets
```

## 🎨 Key Features

### Context-Aware AI
- **Multi-Layer Context**: User profiles, conversation history, session state
- **RAG System**: FAISS vector search with 100+ culinary knowledge items
- **Personalization**: Responses adapted to skill level, preferences, and dietary restrictions

### Smart Recipe Generation
- **Ingredient-Based**: Create recipes from what you have
- **Preference-Aware**: Matches dietary restrictions, cuisine preferences, time constraints
- **Nutritional Analysis**: AI-generated nutritional information
- **DALL·E Images**: Generated food images for visual appeal

### Production-Ready
- **Deployment**: Railway (backend) + Vercel (frontend)
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: JWT-based auth with Google OAuth
- **Error Handling**: Comprehensive error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚧 Roadmap

- [ ] Meal planning and weekly menu generation
- [ ] Shopping list optimization
- [ ] Recipe scaling and conversion
- [ ] Social features and recipe sharing
- [ ] Advanced nutrition tracking
- [ ] Voice assistant integration
- [ ] Mobile app development
