import axios from "axios";

// Use relative path to leverage Vite's proxy configuration
// In development, /api requests are proxied to http://localhost:8000
const API_BASE = "https://61040ta-backend.vercel.app/";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  async register(username, password) {
    const response = await api.post("/api/UserAuth/register", {
      username,
      password,
    });
    return response.data;
  },

  async login(username, password) {
    const response = await api.post("/api/UserAuth/login", {
      username,
      password,
    });
    return response.data;
  },

  async logout(token) {
    const response = await api.post("/api/UserAuth/logout", {
      token,
    });
    return response.data;
  },

  async getUserFromToken(token) {
    const response = await api.post("/api/UserAuth/_getUserFromToken", {
      token,
    });
    return response.data;
  },

  async getUsernameFromToken(token) {
    const response = await api.post("/api/UserAuth/_getUsernameFromToken", {
      token,
    });
    return response.data;
  },
};

// Survey API
export const surveyAPI = {
  async createSurvey(title, owner) {
    const response = await api.post("/api/LikertSurvey/createSurvey", {
      title,
      owner,
    });
    return response.data;
  },

  async addQuestion(stem, survey) {
    const response = await api.post("/api/LikertSurvey/addQuestion", {
      stem,
      survey,
    });
    return response.data;
  },

  async removeQuestion(question) {
    const response = await api.post("/api/LikertSurvey/removeQuestion", {
      question,
    });
    return response.data;
  },

  async respondToQuestion(question, responder, choice) {
    const response = await api.post("/api/LikertSurvey/respondToQuestion", {
      question,
      responder,
      choice,
    });
    return response.data;
  },

  async getSurveyQuestions(survey) {
    const response = await api.post("/api/LikertSurvey/_getSurveyQuestions", {
      survey,
    });
    return response.data;
  },

  async getSurveyTitle(survey) {
    const response = await api.post("/api/LikertSurvey/_getSurveyTitle", {
      survey,
    });
    return response.data;
  },

  async getSurveyOwner(survey) {
    const response = await api.post("/api/LikertSurvey/_getSurveyOwner", {
      survey,
    });
    return response.data;
  },

  async getQuestionStem(question) {
    const response = await api.post("/api/LikertSurvey/_getQuestionStem", {
      question,
    });
    return response.data;
  },

  async getQuestionResponseCounts(question) {
    const response = await api.post(
      "/api/LikertSurvey/_getQuestionResponseCounts",
      {
        question,
      }
    );
    return response.data;
  },

  async analyzeSentiment(question) {
    const response = await api.post("/api/LikertSurvey/_analyzeSentiment", {
      question,
    });
    return response.data;
  },

  async getUserSurveys(user) {
    const response = await api.post("/api/LikertSurvey/_getUserSurveys", {
      user,
    });
    return response.data;
  },
};

export default api;
