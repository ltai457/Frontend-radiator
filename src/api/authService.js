// src/api/authService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5128/api/v1';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ Auth API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Auth API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const authService = {
  // Login function
  async login(username, password) {
    try {
      console.log('🔐 Attempting login to:', API_BASE_URL);
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens and login timestamp
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      console.log('✅ Login successful for user:', user.username);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed - please check if the API server is running' 
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
    console.log('🔓 User logged out');
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
    return !!this.getValidToken() && !!this.getCurrentUser();
  },

  // Check if session is still valid (within timeout period)
  isSessionValid() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) return false;
    
    const now = Date.now();
    const sessionAge = now - parseInt(loginTime);
    
    return sessionAge < SESSION_TIMEOUT;
  },

  // Get session remaining time in minutes
  getSessionRemainingTime() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) return 0;
    
    const now = Date.now();
    const sessionAge = now - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - sessionAge;
    
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  },

  // Alias for compatibility with AuthContext (same as above)
  getRemainingSessionTime() {
    return this.getSessionRemainingTime();
  },

  // Refresh session timestamp (extend session)
  refreshSession() {
    if (this.isAuthenticated()) {
      sessionStorage.setItem('loginTime', Date.now().toString());
      console.log('🔄 Session refreshed');
      return true;
    }
    return false;
  },

  // Check session status with detailed info
  getSessionInfo() {
    const loginTime = sessionStorage.getItem('loginTime');
    const user = this.getCurrentUser();
    const token = this.getValidToken();
    
    return {
      isAuthenticated: this.isAuthenticated(),
      isValid: this.isSessionValid(),
      user: user,
      hasToken: !!token,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null,
      remainingMinutes: this.getSessionRemainingTime(),
      expiresAt: loginTime ? new Date(parseInt(loginTime) + SESSION_TIMEOUT) : null
    };
  },

  // Test API connection
  async testConnection() {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'API server is not responding' 
      };
    }
  },

  // Refresh token (if your backend supports it)
  async refreshToken() {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens
      sessionStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      console.log('🔄 Token refreshed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      this.logout(); // Clear invalid session
      return { 
        success: false, 
        error: error.response?.data?.message || 'Token refresh failed' 
      };
    }
  }
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authService;