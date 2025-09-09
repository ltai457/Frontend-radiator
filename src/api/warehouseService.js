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
    
    // Log validation errors specifically
    if (error.response?.data?.errors) {
      console.error('Validation Errors:', error.response.data.errors);
    }
    
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
      
      // Build payload with required fields
      const payload = {
        name: warehouseData.name?.trim() || '',
        code: warehouseData.code?.trim()?.toUpperCase() || ''
      };
      
      // Add optional fields only if they have values
      if (warehouseData.location?.trim()) {
        payload.location = warehouseData.location.trim();
      }
      
      if (warehouseData.address?.trim()) {
        payload.address = warehouseData.address.trim();
      }
      
      if (warehouseData.phone?.trim()) {
        payload.phone = warehouseData.phone.trim();
      }
      
      if (warehouseData.email?.trim()) {
        payload.email = warehouseData.email.trim();
      }
      
      console.log('📤 Sending warehouse payload:', payload);
      
      const response = await api.post('/warehouses', payload);
      
      console.log('✅ Create warehouse response:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Create warehouse error:', error.response?.data || error.message);
      
      // Extract error message
      let errorMessage = 'Failed to create warehouse';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = [];
        for (const field in errors) {
          errorMessages.push(`${field}: ${errors[field].join(', ')}`);
        }
        errorMessage = errorMessages.join('; ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Update warehouse
  async update(id, warehouseData) {
    try {
      console.log('📝 Updating warehouse:', id, warehouseData);
      
      // Build payload with required fields - MUST include both name and code
      const payload = {
        name: warehouseData.name?.trim() || '',
        code: warehouseData.code?.trim()?.toUpperCase() || ''
      };
      
      // Add optional fields only if they have values
      if (warehouseData.location?.trim()) {
        payload.location = warehouseData.location.trim();
      }
      
      if (warehouseData.address?.trim()) {
        payload.address = warehouseData.address.trim();
      }
      
      if (warehouseData.phone?.trim()) {
        payload.phone = warehouseData.phone.trim();
      }
      
      if (warehouseData.email?.trim()) {
        payload.email = warehouseData.email.trim();
      }
      
      console.log('📤 Sending update payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.put(`/warehouses/${id}`, payload);
      console.log('✅ Warehouse updated:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update warehouse error:', error.response?.data || error.message);
      
      // Better error message extraction
      let errorMessage = 'Failed to update warehouse';
      
      if (error.response?.data?.errors) {
        // Handle validation errors from ASP.NET
        const errors = error.response.data.errors;
        const errorMessages = [];
        
        for (const field in errors) {
          if (Array.isArray(errors[field])) {
            // Join all error messages for this field
            errorMessages.push(`${field}: ${errors[field].join(', ')}`);
          } else if (typeof errors[field] === 'string') {
            errorMessages.push(`${field}: ${errors[field]}`);
          } else {
            errorMessages.push(`${field}: ${JSON.stringify(errors[field])}`);
          }
        }
        
        errorMessage = errorMessages.join('; ');
        console.error('Formatted validation errors:', errorMessage);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      return { 
        success: false, 
        error: errorMessage
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