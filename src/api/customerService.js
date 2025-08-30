// src/api/customerService.js
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

const customerService = {
  // Get all customers
  async getAll() {
    try {
      const response = await api.get('/customers');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customers' 
      };
    }
  },

  // Get single customer by ID
  async getById(id) {
    try {
      const response = await api.get(`/customers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch customer' 
      };
    }
  },

  // Create new customer (Admin only)
  async create(customerData) {
    try {
      const response = await api.post('/customers', customerData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create customer' 
      };
    }
  },

  // Update customer (Admin only)
  async update(id, customerData) {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update customer' 
      };
    }
  },

  // Delete/deactivate customer (Admin only)
  async delete(id) {
    try {
      await api.delete(`/customers/${id}`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete customer' 
      };
    }
  },

  // Get customer's purchase history
  async getSalesHistory(id) {
    try {
      const response = await api.get(`/customers/${id}/sales`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sales history' 
      };
    }
  }
};

export default customerService;