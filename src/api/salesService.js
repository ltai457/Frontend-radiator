// src/api/salesService.js
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

const salesService = {
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

  // Create new sale
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

  // Get sales by date range
  async getByDateRange(fromDate, toDate) {
    try {
      const response = await api.get('/sales/by-date', {
        params: { fromDate, toDate }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sales by date' 
      };
    }
  },

  // Get receipt for a sale
  async getReceipt(id) {
    try {
      const response = await api.get(`/sales/${id}/receipt`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch receipt' 
      };
    }
  },

  // Cancel sale (Admin only)
  async cancel(id) {
    try {
      const response = await api.post(`/sales/${id}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel sale' 
      };
    }
  },

  // Refund sale (Admin only) - Restores stock levels
  async refund(id) {
    try {
      const response = await api.post(`/sales/${id}/refund`);
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