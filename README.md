# CulinaMind - Culinary AI Agent

CulinaMind is an intelligent AI agent that helps you discover, create, and plan your culinary journey. Whether you need recipe inspiration, cooking guidance, or meal planning assistance, CulinaMind leverages advanced AI to provide personalized culinary solutions.

## 🍳 Core Features

### Recipe Generation & Discovery
- Generate personalized recipes from available ingredients
- Filter by cuisine, dietary restrictions, time constraints, and serving size
- AI-generated cooking instructions with nutritional information based on the filters
- High-quality food images using DALL·E 3

### AI Culinary Assistant
- Advanced RAG system with 18+ curated culinary knowledge items
- Semantic search powered by vector embeddings and FAISS
- Real-time cooking tips, technique explanations, and recipe modifications
- Integration with external recipe APIs (Spoonacular, Edamam)

### Meal Planning (Coming Soon)
- AI-powered weekly meal planning
- Smart ingredient optimization and shopping lists
- Dietary goal tracking and nutritional balance
- Seasonal and trending recipe suggestions

### Recipe Management
- Save and organize favorite recipes
- Secure authentication with email/password or Google OAuth

## 🛠️ Tech Stack

**Backend**: Flask, SQLAlchemy, PostgreSQL, OpenAI GPT-4/DALL·E 3, FAISS  
**Frontend**: React 19, TypeScript, Tailwind CSS, Vite  
**AI/ML**: Vector embeddings, RAG system, semantic search  
**APIs**: Spoonacular, Edamam, News API integration

## 🚀 Quick Start

### Prerequisites
- Python 3.8+, Node.js 18+, PostgreSQL
- OpenAI API key, Google OAuth credentials

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create `.env` file with:
```bash
FLASK_APP=app.py
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET_KEY=your_jwt_secret_key
DATABASE_URL=postgresql://username:password@localhost/culinamind
SPOONACULAR_API_KEY=your_spoonacular_key
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
```

```bash
flask db upgrade
flask run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Key API Endpoints

**Authentication**: `/auth/register`, `/auth/login`, `/auth/google`  
**Recipes**: `/recipes/generate`, `/recipes/favorites`  
**AI Assistant**: `/ai/chat`, `/ai/health`, `/ai/modify-recipe`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request