// src/api/radiatorService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5128/api/v1';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const radiatorService = {
  // Get all radiators
  async getAll() {
    try {
      const response = await api.get('/radiators');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch radiators' 
      };
    }
  },

  // Get single radiator by ID
  async getById(id) {
    try {
      const response = await api.get(`/radiators/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch radiator' 
      };
    }
  },

  // Create new radiator (Admin only)
  async create(radiatorData) {
    try {
      const response = await api.post('/radiators', radiatorData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create radiator' 
      };
    }
  },

  // Update radiator
  async update(id, radiatorData) {
    try {
      const response = await api.put(`/radiators/${id}`, radiatorData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update radiator' 
      };
    }
  },

  // Delete radiator (Admin only)
  async delete(id) {
    try {
      await api.delete(`/radiators/${id}`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete radiator' 
      };
    }
  },

  // Get radiator stock
  async getStock(id) {
    try {
      const response = await api.get(`/radiators/${id}/stock`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch stock' 
      };
    }
  },

  // Update stock
  async updateStock(id, warehouseCode, quantity) {
    try {
      const response = await api.post(`/radiators/${id}/stock`, {
        warehouseCode,
        quantity
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update stock' 
      };
    }
  }
};

export default radiatorService;