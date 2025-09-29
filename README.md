# CulinaMind - Culinary AI Agent

CulinaMind is an AI-powered culinary assistant that helps you discover recipes and get cooking guidance. It provides recipe recommendations, ingredient-based recipe generation, and personalized cooking assistance based on your preferences.

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
- **Database**: PostgreSQL
- **AI/ML**: OpenAI GPT-4, DALL·E 3, FAISS vector search
- **Authentication**: Flask-JWT-Extended, bcrypt
- **APIs**: Spoonacular, Edamam integration

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and building
- **State Management**: React hooks and context
- **Routing**: React Router v6

### AI & Context Engineering
- **RAG System**: Retrieval-Augmented Generation
- **Vector Embeddings**: Culinary knowledge vectorization
- **Context Management**: Context engineering for AI responses
- **MCP Integration**: Anthropic Model Context Protocol
- **Semantic Search**: FAISS-powered knowledge retrieval

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL
- OpenAI API key
- Google OAuth credentials (optional)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

Create `.env` file:
```bash
FLASK_APP=app.py
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET_KEY=your_jwt_secret_key
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=culina_mind
DB_USER=postgres
DB_PASSWORD=your_postgres_password
SPOONACULAR_API_KEY=your_spoonacular_key
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
```

Initialize database and start server:
```bash
flask db upgrade
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

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
│   ├── config.py              # Configuration settings
│   ├── models/                # Database models
│   ├── routes/                # API endpoints
│   ├── utils/                 # Utility services
│   └── data/                  # Database and context storage
├── frontend/                  # React TypeScript app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based pages
│   │   ├── services/         # API services
│   │   └── types/            # TypeScript definitions
│   └── public/               # Static assets
└── backup/                   # Backup and archive files
```

## 🎨 Key Features in Detail

### Context Engineering
- **Context Layers**: User profiles, conversation history, session context
- **Knowledge Updates**: Knowledge base updates
- **Personalization**: AI responses based on user preferences
- **Context Management**: Context management and retrieval

### Recipe Generation
- **Ingredient-Based**: Generate recipes from available ingredients
- **Preference-Aware**: Recipes match user dietary and taste preferences
- **Time Estimates**: Cooking time estimates based on user skill level
- **Nutritional Focus**: Health-conscious recipe recommendations

### User Experience
- **User Onboarding**: Guided preference collection for new users
- **Responsive Design**: Mobile-first interface
- **Input Validation**: Feedback on user inputs
- **Navigation**: Clean user interface

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
