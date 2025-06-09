import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('focusflow-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('focusflow-token');
      localStorage.removeItem('focusflow-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/auth/preferences', preferences);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks?${params}`);
    return response.data;
  },

  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  addPomodoroSession: async (taskId, sessionData) => {
    const response = await api.post(`/tasks/${taskId}/pomodoro`, sessionData);
    return response.data;
  },
};

// Statistics API
export const statsAPI = {
  getOverview: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  getDailyStats: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/stats/daily?${params}`);
    return response.data;
  },

  recordSession: async (sessionData) => {
    const response = await api.post('/stats/session', sessionData);
    return response.data;
  },

  getProductivityStats: async (period = '7d') => {
    const response = await api.get(`/stats/productivity?period=${period}`);
    return response.data;
  },
};

// Gamification API
export const gamificationAPI = {
  getGamificationData: async () => {
    const response = await api.get('/gamification');
    return response.data;
  },

  checkProgress: async (data) => {
    const response = await api.post('/gamification/check-progress', data);
    return response.data;
  },

  getLeaderboard: async (period = 'all-time', limit = 10) => {
    const response = await api.get(`/gamification/leaderboard?period=${period}&limit=${limit}`);
    return response.data;
  },

  getBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;
