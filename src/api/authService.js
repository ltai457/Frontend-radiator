// src/api/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5128/api/v1';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  // Login function
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens and login timestamp
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  // Logout function
  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
    localStorage.removeItem('accessToken'); // Clean old localStorage tokens
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user from storage (only if session is valid)
  getCurrentUser() {
    if (!this.isSessionValid()) {
      this.logout(); // Clear expired session
      return null;
    }
    
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get valid token (only if session hasn't expired)
  getValidToken() {
    if (!this.isSessionValid()) {
      this.logout(); // Clear expired session
      return null;
    }
    
    return sessionStorage.getItem('accessToken');
  },

  // Check if user is authenticated and session is valid
  isAuthenticated() {
    return !!this.getValidToken();
  },

  // Check if current session is still valid
  isSessionValid() {
    const loginTime = sessionStorage.getItem('loginTime');
    const accessToken = sessionStorage.getItem('accessToken');
    
    if (!loginTime || !accessToken) {
      return false;
    }
    
    const currentTime = Date.now();
    const sessionAge = currentTime - parseInt(loginTime);
    
    // Session expired
    if (sessionAge > SESSION_TIMEOUT) {
      return false;
    }
    
    return true;
  },

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) return 0;
    
    const sessionAge = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - sessionAge;
    
    return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
  },

  // Extend session (call this on user activity)
  extendSession() {
    if (this.isAuthenticated()) {
      sessionStorage.setItem('loginTime', Date.now().toString());
    }
  }
};

export default authService;