# Quick Start Guide

## ✅ What's Been Built

A complete Vue 3 frontend for the Likert Survey application with:

### Features Implemented:
- ✅ User Registration & Login
- ✅ Session Management (tokens stored in localStorage)
- ✅ Create New Surveys
- ✅ View All Your Surveys
- ✅ Add Questions to Surveys
- ✅ Remove Questions from Surveys
- ✅ Protected Routes (requires authentication)
- ✅ Beautiful, Modern UI

## 🚀 Running the App

### Prerequisites
- Backend API running at `http://localhost:8000`
- Node.js installed

### Start the Frontend
```bash
npm run dev
```

The app will run at **http://localhost:3000**

## 🧪 API Integration Tests

All API integration tests are **PASSING** ✅

Run tests anytime with:
```bash
npm run test-api
```

### Test Results:
- ✅ Register new user
- ✅ Login with credentials
- ✅ Get user from token
- ✅ Get username from token
- ✅ Create a survey
- ✅ Get survey title
- ✅ Get survey owner
- ✅ Get user surveys
- ✅ Add question to survey
- ✅ Get question stem
- ✅ Get survey questions
- ✅ Verify multiple questions
- ✅ Submit response to question
- ✅ Get question response counts
- ✅ Analyze sentiment
- ✅ Update response
- ✅ Verify response was updated
- ✅ Remove question
- ✅ Verify question was removed
- ✅ Logout

## 📱 How to Use the App

### 1. Register / Login
- Navigate to `http://localhost:3000`
- Create a new account or login
- Click "Register" to create an account
- Toggle to "Login" if you already have an account

### 2. Dashboard
After logging in, you'll see your dashboard with:
- List of all your surveys
- "Create Survey" button
- Welcome message with your username
- Logout button

### 3. Create a Survey
1. Click "Create Survey" button
2. Enter a survey title
3. Click "Create"
4. You'll be redirected to the survey editor

### 4. Manage Questions
In the Survey Editor:
- Click "Add Question" to add a new question
- Enter the question text
- Click "Create" to add it
- Click "Remove" on any question to delete it (with confirmation)
- All responses to deleted questions are also removed

### 5. Navigation
- Click "Back to Dashboard" to return to your survey list
- Click on any survey card to edit it
- Click "Logout" to end your session

## 🔧 API Service Layer

The app uses a comprehensive API service layer (`src/services/api.js`) that handles:

### Auth API:
- `authAPI.register(username, password)`
- `authAPI.login(username, password)`
- `authAPI.logout(token)`
- `authAPI.getUserFromToken(token)`
- `authAPI.getUsernameFromToken(token)`

### Survey API:
- `surveyAPI.createSurvey(title, owner)`
- `surveyAPI.addQuestion(stem, survey)`
- `surveyAPI.removeQuestion(question)`
- `surveyAPI.getSurveyQuestions(survey)`
- `surveyAPI.getSurveyTitle(survey)`
- `surveyAPI.getSurveyOwner(survey)`
- `surveyAPI.getQuestionStem(question)`
- `surveyAPI.getUserSurveys(user)`
- `surveyAPI.respondToQuestion(question, responder, choice)`
- `surveyAPI.getQuestionResponseCounts(question)`
- `surveyAPI.analyzeSentiment(question)`

## 🎨 UI Components

### Views:
1. **LoginView** (`/login`) - Registration and login form
2. **DashboardView** (`/dashboard`) - Survey list and creation
3. **SurveyEditorView** (`/survey/:id`) - Question management

### State Management:
- **Pinia Store** (`src/stores/auth.js`) - Handles authentication state
  - `isAuthenticated` - Check if user is logged in
  - `userId` - Current user's ID
  - `username` - Current user's username
  - `token` - Session token
  - `register()` - Register new user
  - `login()` - Login user
  - `logout()` - Logout user
  - `checkAuth()` - Verify token validity

## 🛣️ Routes

All routes are defined in `src/router/index.js`:

- `/` - Redirects to `/login`
- `/login` - Login/Register page (public)
- `/dashboard` - Survey list (protected)
- `/survey/:id` - Survey editor (protected)

Protected routes automatically redirect to `/login` if not authenticated.

## 🔐 Security

- Tokens are validated on protected route access
- Invalid tokens automatically redirect to login
- Logout clears all stored credentials
- All API calls include proper error handling

## 🎯 Key Features

### Real-time Updates
- Survey list updates after creating new survey
- Question list updates after adding/removing questions
- Automatic redirect after successful login

### Error Handling
- User-friendly error messages
- API error responses displayed in UI
- Confirmation dialogs for destructive actions

### Modern UX
- Gradient backgrounds
- Smooth transitions and hover effects
- Modal overlays for forms
- Responsive design
- Loading states

## 📊 API Communication Flow

### Creating a Survey:
1. User clicks "Create Survey"
2. Frontend calls `surveyAPI.createSurvey(title, userId)`
3. Backend returns survey ID
4. Frontend redirects to `/survey/{id}`

### Loading Surveys:
1. Frontend calls `surveyAPI.getUserSurveys(userId)`
2. Backend returns array of survey IDs
3. Frontend calls `surveyAPI.getSurveyTitle(id)` for each
4. Frontend calls `surveyAPI.getSurveyQuestions(id)` for counts
5. Display formatted list

### Managing Questions:
1. User adds question via modal
2. Frontend calls `surveyAPI.addQuestion(stem, surveyId)`
3. Backend returns question ID
4. Frontend reloads question list
5. Questions display with remove buttons

## 🎉 Summary

You now have a fully functional Vue 3 frontend that:
- ✅ Successfully communicates with the API at localhost:8000
- ✅ Handles authentication with register/login/logout
- ✅ Creates and manages surveys
- ✅ Adds and removes questions
- ✅ Has comprehensive API integration tests
- ✅ Features a beautiful, modern UI
- ✅ Uses Vue 3 best practices (Composition API, Pinia, Vue Router)

**The frontend is ready to use!** 🚀

