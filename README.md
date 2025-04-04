# CulinaMind - AI Recipe Assistant

CulinaMind is an AI-powered recipe assistant web application designed to generate personalized, detailed, and nutritious cooking recipes based on your available ingredients, dietary preferences, cuisine choice, time limit, and more.

## Features

- Generate 4 Personalized Recipes based on:
  - Ingredients
  - Preferred cuisine or 'Surprise Me' mode
  - Dietary restrictions (e.g., vegan, gluten-free)
  - Time constraints
  - Serving size

- Each Recipe conatins:
  - Ingredient Quantities
  - Cooking Instructions
  - Time Breakdown
  - Nutritional Information
  - High-Quality Food Images using DALL·E 3

- Save your favorite recipes to your profile

- Authenticate via email/password or Google OAuth

## Tech Stack

- Flask (Python web framework)

SQLAlchemy (ORM for database)

Flask-JWT-Extended (Auth with JWT)

OpenAI GPT-4 + DALL·E 3 (AI-generated recipes & images)

PostgreSQL (Database)

SMTP (Gmail support for login)

## How to Run the App?

### 1. Clone the Rep in your VS code:

```bash
git clone https://github.com/your-username/culinamind.git
```
### 2- Run the backend:

Open a terminal in the backend directory or:

```bash
cd backend
```

Create a virtual environment:

```bash
# For macOS/Linux
python3 -m venv venv

# For Windows
python -m venv venv
```

Activate the virtial environment:

```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install Python Dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Configure environemnt variables in .env:

```bash
FLASK_APP=run.py
FLASK_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
```
Run database migration:

```bash
flask db upgrade
```

Run the Flask App:

```bash
flask run
```

### 3- Run the fackend:

Open a terminal in the frontend directory or:

```bash
cd frontend
```

Make sure both both the ```node_modules``` directory and the ```package-lock.json``` file aren't already present in the frontend. If they're, remove them:

```
rm -rf node_modules package-lock.json
```

Install frontend dependencies:

```bash
npm install
```

Start the server:

```bash
npm install
```