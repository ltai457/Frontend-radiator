// src/api/salesService.js
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

const salesService = {
  // Create a new sale
  async create(saleData) {
    try {
      const response = await api.post('/sales', saleData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create sale' 
      };
    }
  },

  // Get all sales
  async getAll() {
    try {
      const response = await api.get('/sales');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sales' 
      };
    }
  },

  // Get single sale by ID
  async getById(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sale' 
      };
    }
  },

  // Get sales by date range
  async getByDateRange(fromDate, toDate) {
    try {
      const params = new URLSearchParams({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
      });
      const response = await api.get(`/sales/by-date?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sales by date range' 
      };
    }
  },

  // Get receipt for a sale
  async getReceipt(saleId) {
    try {
      const response = await api.get(`/sales/${saleId}/receipt`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch receipt' 
      };
    }
  },

  // Cancel a sale (Admin only)
  async cancel(saleId) {
    try {
      const response = await api.post(`/sales/${saleId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel sale' 
      };
    }
  },

  // Refund a sale (Admin only)
  async refund(saleId) {
    try {
      const response = await api.post(`/sales/${saleId}/refund`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to refund sale' 
      };
    }
  }
};

export default salesService;