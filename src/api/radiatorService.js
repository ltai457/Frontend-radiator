// src/api/radiatorService.js
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

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ Radiator API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Radiator API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const radiatorService = {
  // Create new radiator (with optional initial stock)
  async create(radiatorData) {
    try {
      console.log('🚀 Creating radiator with data:', radiatorData);
      
      // Ensure the data format matches your backend DTO
      const payload = {
        brand: radiatorData.brand,
        code: radiatorData.code,
        name: radiatorData.name,
        year: radiatorData.year,
        ...(radiatorData.initialStock && Object.keys(radiatorData.initialStock).length > 0 && {
          initialStock: radiatorData.initialStock
        })
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await api.post('/radiators', payload);
      
      console.log('✅ Create radiator response:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Create radiator error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to create radiator - check API connection' 
      };
    }
  },

  // Get all radiators
  async getAll() {
    try {
      console.log('📊 Fetching all radiators...');
      const response = await api.get('/radiators');
      console.log('✅ Radiators loaded:', response.data.length, 'items');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get radiators error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch radiators - check API connection' 
      };
    }
  },

  // Get single radiator by ID
  async getById(id) {
    try {
      console.log('📊 Fetching radiator by ID:', id);
      const response = await api.get(`/radiators/${id}`);
      console.log('✅ Radiator loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get radiator by ID error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch radiator - check API connection' 
      };
    }
  },

  // Update radiator
  async update(id, radiatorData) {
    try {
      console.log('📝 Updating radiator:', id, radiatorData);
      const response = await api.put(`/radiators/${id}`, radiatorData);
      console.log('✅ Radiator updated:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update radiator error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update radiator' 
      };
    }
  },

  // Delete radiator
  async delete(id) {
    try {
      console.log('🗑️ Deleting radiator:', id);
      await api.delete(`/radiators/${id}`);
      console.log('✅ Radiator deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete radiator error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete radiator' 
      };
    }
  },

  // Search radiators
  async search(searchTerm) {
    try {
      console.log('🔍 Searching radiators:', searchTerm);
      const response = await api.get(`/radiators/search?q=${encodeURIComponent(searchTerm)}`);
      console.log('✅ Search results:', response.data.length, 'items');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Search radiators error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to search radiators' 
      };
    }
  },

  // Get radiator stock levels across all warehouses
  async getStockLevels(radiatorId) {
    try {
      console.log('📦 Fetching stock levels for radiator:', radiatorId);
      const response = await api.get(`/radiators/${radiatorId}/stock`);
      console.log('✅ Stock levels loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get stock levels error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch stock levels' 
      };
    }
  }
};

export default radiatorService;