// src/api/userService.js
import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5128/api/v1';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests using the secure auth service
api.interceptors.request.use((config) => {
  const token = authService.getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch users' 
      };
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user' 
      };
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      console.log('📤 Creating user with data:', userData);
      const response = await api.post('/users', userData);
      console.log('✅ User created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Create user error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.errors || 'Failed to create user' 
      };
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user' 
      };
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  },

  // Check if username exists
  async checkUsernameExists(username) {
    try {
      const response = await api.get(`/users/check-username/${username}`);
      return { success: true, exists: response.data.exists };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check username' 
      };
    }
  },

  // Check if email exists
  async checkEmailExists(email) {
    try {
      const response = await api.get(`/users/check-email/${email}`);
      return { success: true, exists: response.data.exists };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check email' 
      };
    }
  }
};

export default userService;