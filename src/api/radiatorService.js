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

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
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
        error: error.response?.data?.message || error.message || 'Failed to create radiator' 
      };
    }
  },

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

  // Update stock for a single warehouse
  async updateStock(id, warehouseCodeOrPayload, quantity = null) {
    try {
      let payload;
      
      // Handle both calling patterns:
      // 1. updateStock(id, warehouseCode, quantity) - from StockUpdateModal
      // 2. updateStock(id, payload) - from WarehouseStock bulk operations
      if (typeof warehouseCodeOrPayload === 'string' && quantity !== null) {
        // Single warehouse update
        payload = {
          warehouseCode: warehouseCodeOrPayload,
          quantity: quantity
        };
      } else if (typeof warehouseCodeOrPayload === 'object') {
        // Bulk update - for each warehouse in the object
        // We'll handle the first warehouse code for now
        const firstWarehouse = Object.keys(warehouseCodeOrPayload)[0];
        payload = {
          warehouseCode: firstWarehouse,
          quantity: warehouseCodeOrPayload[firstWarehouse]
        };
      } else {
        throw new Error('Invalid parameters for updateStock');
      }

      console.log('📤 Updating stock:', payload);
      const response = await api.post(`/radiators/${id}/stock`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update stock error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update stock' 
      };
    }
  }
};

export default radiatorService;