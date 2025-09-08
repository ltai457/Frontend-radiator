// src/api/warehouseService.js
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
      console.log('✅ Warehouse API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Warehouse API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const warehouseService = {
  // Get all warehouses
  async getAll() {
    try {
      console.log('📊 Fetching all warehouses...');
      const response = await api.get('/warehouses');
      console.log('✅ Warehouses loaded:', response.data.length, 'items');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get warehouses error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch warehouses - check API connection' 
      };
    }
  },

  // Get single warehouse by ID
  async getById(id) {
    try {
      console.log('📊 Fetching warehouse by ID:', id);
      const response = await api.get(`/warehouses/${id}`);
      console.log('✅ Warehouse loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get warehouse by ID error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch warehouse - check API connection' 
      };
    }
  },

  // Get warehouse by code
  async getByCode(code) {
    try {
      console.log('📊 Fetching warehouse by code:', code);
      const response = await api.get(`/warehouses/code/${code}`);
      console.log('✅ Warehouse loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get warehouse by code error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch warehouse by code' 
      };
    }
  },

  // Create new warehouse
  async create(warehouseData) {
    try {
      console.log('🚀 Creating warehouse with data:', warehouseData);
      
      // Ensure the data format matches your backend DTO
      const payload = {
        name: warehouseData.name.trim(),
        code: warehouseData.code.trim().toUpperCase(),
        location: warehouseData.location?.trim() || null,
        address: warehouseData.address?.trim() || null,
        phone: warehouseData.phone?.trim() || null,
        email: warehouseData.email?.trim() || null
      };
      
      console.log('📤 Sending warehouse payload:', payload);
      
      const response = await api.post('/warehouses', payload);
      
      console.log('✅ Create warehouse response:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Create warehouse error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to create warehouse - check API connection' 
      };
    }
  },

  // Update warehouse
  async update(id, warehouseData) {
    try {
      console.log('📝 Updating warehouse:', id, warehouseData);
      
      const payload = {
        name: warehouseData.name.trim(),
        code: warehouseData.code.trim().toUpperCase(),
        location: warehouseData.location?.trim() || null,
        address: warehouseData.address?.trim() || null,
        phone: warehouseData.phone?.trim() || null,
        email: warehouseData.email?.trim() || null
      };
      
      const response = await api.put(`/warehouses/${id}`, payload);
      console.log('✅ Warehouse updated:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update warehouse error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update warehouse' 
      };
    }
  },

  // Delete warehouse
  async delete(id) {
    try {
      console.log('🗑️ Deleting warehouse:', id);
      await api.delete(`/warehouses/${id}`);
      console.log('✅ Warehouse deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete warehouse error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to delete warehouse' 
      };
    }
  },

  // Validate warehouse code (check if code is available)
  async validateCode(code) {
    try {
      console.log('🔍 Validating warehouse code:', code);
      const response = await api.get(`/warehouses/validate-code/${code.toUpperCase()}`);
      console.log('✅ Code validation result:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Validate code error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to validate warehouse code' 
      };
    }
  }
};

export default warehouseService;