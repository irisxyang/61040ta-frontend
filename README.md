# Likert Survey Frontend

A modern Vue 3 frontend for the Likert Survey application.

## Features

- 🔐 **Authentication** - Register and login with secure session management
- 📊 **Survey Management** - Create, view, and edit surveys
- ❓ **Question Management** - Add and remove questions from surveys
- 🎨 **Modern UI** - Beautiful gradient design with smooth interactions
- ✅ **API Integration** - Fully integrated with the backend API

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend API is running on `http://localhost:8000`

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Testing API Integration

Run the comprehensive API test suite:

```bash
npm run test-api
```

This will:
- Test all authentication endpoints (register, login, logout)
- Test survey creation and retrieval
- Test question management
- Test response submission and retrieval
- Verify data integrity

## Project Structure

```
src/
├── views/              # Page components
│   ├── LoginView.vue   # Login/Register page
│   ├── DashboardView.vue # Survey list dashboard
│   └── SurveyEditorView.vue # Survey editor
├── stores/             # Pinia stores
│   └── auth.js         # Authentication state
├── services/           # API services
│   └── api.js          # API client and methods
├── router/             # Vue Router
│   └── index.js        # Route definitions
├── App.vue             # Root component
├── main.js             # App entry point
└── style.css           # Global styles
```

## API Endpoints Used

### Authentication
- `POST /api/UserAuth/register` - Create new user
- `POST /api/UserAuth/login` - Login user
- `POST /api/UserAuth/logout` - Logout user
- `POST /api/UserAuth/_getUserFromToken` - Get user ID from token
- `POST /api/UserAuth/_getUsernameFromToken` - Get username from token

### Surveys
- `POST /api/LikertSurvey/createSurvey` - Create new survey
- `POST /api/LikertSurvey/_getUserSurveys` - Get user's surveys
- `POST /api/LikertSurvey/_getSurveyTitle` - Get survey title
- `POST /api/LikertSurvey/_getSurveyOwner` - Get survey owner
- `POST /api/LikertSurvey/_getSurveyQuestions` - Get survey questions

### Questions
- `POST /api/LikertSurvey/addQuestion` - Add question to survey
- `POST /api/LikertSurvey/removeQuestion` - Remove question
- `POST /api/LikertSurvey/_getQuestionStem` - Get question text

## Usage

### Register/Login
1. Navigate to the app
2. Create a new account or login with existing credentials
3. You'll be redirected to the dashboard

### Create a Survey
1. Click "Create Survey" on the dashboard
2. Enter a title for your survey
3. Click "Create"

### Manage Questions
1. Click on a survey from the dashboard
2. Click "Add Question" to add new questions
3. Enter the question text
4. Click "Remove" to delete questions

## Development

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Notes

- Authentication tokens are stored in localStorage
- All API calls are proxied through Vite dev server
- The app uses Vue 3 Composition API with `<script setup>`
- State management is handled by Pinia
- Routes are protected with navigation guards

