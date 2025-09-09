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

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ Auth API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Auth API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    
    // Handle 401 errors by clearing the session
    if (error.response?.status === 401) {
      console.log('🔓 Received 401, clearing session');
      authService.logout();
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // Login function
  async login(username, password) {
    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await api.post('/auth/login', { 
        username: username.trim(), 
        password 
      });
      
      const { accessToken, refreshToken, user, expiresAt } = response.data;
      
      // Validate response structure
      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid response structure from server');
      }
      
      // Store tokens and login timestamp
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      if (expiresAt) {
        sessionStorage.setItem('tokenExpiresAt', new Date(expiresAt).getTime().toString());
      }
      
      console.log('✅ Login successful for user:', user.username);
      console.log('🔐 Token expires at:', new Date(expiresAt));
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      
      // Clean up any partial session data
      this.logout();
      
      let errorMessage = 'Login failed - please check your credentials';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to server. Please check if the API server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // Enhanced logout function with server-side token revocation
  async logout(refreshToken = null) {
    try {
      // Attempt server-side logout if we have a refresh token
      const token = refreshToken || sessionStorage.getItem('refreshToken');
      if (token) {
        console.log('🔓 Attempting server-side logout');
        await api.post('/auth/logout', { refreshToken: token });
        console.log('✅ Server-side logout successful');
      }
    } catch (error) {
      console.warn('⚠️ Server-side logout failed:', error.response?.data || error.message);
      // Continue with client-side cleanup even if server logout fails
    }

    // Always clear client-side session
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
    sessionStorage.removeItem('tokenExpiresAt');
    
    // Clean up any legacy localStorage tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    
    console.log('🔓 Client-side logout completed');
  },

  // Get current user from storage (only if session is valid)
  getCurrentUser() {
    if (!this.isSessionValid()) {
      this.logout(); // Clear expired session
      return null;
    }
    
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      this.logout(); // Clear corrupted session
      return null;
    }
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
    const token = this.getValidToken();
    const user = sessionStorage.getItem('user');
    return !!(token && user);
  },

  // Check if session is still valid
  isSessionValid() {
    const loginTime = sessionStorage.getItem('loginTime');
    const tokenExpiresAt = sessionStorage.getItem('tokenExpiresAt');
    
    if (!loginTime) return false;
    
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    
    // Check against token expiration if available
    if (tokenExpiresAt) {
      const expirationTime = parseInt(tokenExpiresAt);
      return now < expirationTime;
    }
    
    // Fallback to session timeout
    const sessionAge = now - loginTimestamp;
    return sessionAge < SESSION_TIMEOUT;
  },

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const tokenExpiresAt = sessionStorage.getItem('tokenExpiresAt');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (!loginTime) return 0;
    
    const now = Date.now();
    let expirationTime;
    
    if (tokenExpiresAt) {
      expirationTime = parseInt(tokenExpiresAt);
    } else {
      expirationTime = parseInt(loginTime) + SESSION_TIMEOUT;
    }
    
    const remainingTime = expirationTime - now;
    return Math.max(0, Math.floor(remainingTime / (1000 * 60)));
  },

  // Extend session by updating login time
  extendSession() {
    if (this.isAuthenticated()) {
      sessionStorage.setItem('loginTime', Date.now().toString());
      console.log('🕐 Session extended');
    }
  },

  // Get session information
  getSessionInfo() {
    const loginTime = sessionStorage.getItem('loginTime');
    const tokenExpiresAt = sessionStorage.getItem('tokenExpiresAt');
    const token = sessionStorage.getItem('accessToken');
    
    return {
      isValid: this.isSessionValid(),
      hasToken: !!token,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null,
      expiresAt: tokenExpiresAt ? new Date(parseInt(tokenExpiresAt)) : null,
      remainingMinutes: this.getRemainingSessionTime()
    };
  },

  // Test API connection
  async testConnection() {
    try {
      console.log('🔌 Testing API connection...');
      const healthUrl = API_BASE_URL.replace('/api/v1', '/health');
      const response = await axios.get(healthUrl, { timeout: 5000 });
      console.log('✅ API connection successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return { 
        success: false, 
        error: error.code === 'NETWORK_ERROR' 
          ? 'Unable to connect to API server' 
          : error.message || 'API server is not responding' 
      };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing authentication token...');
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, expiresAt } = response.data;
      
      // Update tokens and session
      sessionStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        sessionStorage.setItem('refreshToken', newRefreshToken);
      }
      sessionStorage.setItem('loginTime', Date.now().toString());
      
      if (expiresAt) {
        sessionStorage.setItem('tokenExpiresAt', new Date(expiresAt).getTime().toString());
      }
      
      console.log('✅ Token refreshed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      
      // Clear invalid session
      this.logout();
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Session refresh failed. Please login again.' 
      };
    }
  },

  // Register new user
  async register(userData) {
    try {
      console.log('👤 Attempting user registration...');
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Username or email already exists';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔐 Attempting password change...');
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      console.log('✅ Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Password change failed:', error.response?.data || error.message);
      
      let errorMessage = 'Password change failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect';
      }
      
      return { 
        success: false, 
        error: errorMessage 
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