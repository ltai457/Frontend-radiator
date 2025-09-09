// src/api/stockService.js
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
      console.log('✅ Stock API Success:', response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Stock API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const stockService = {
  // Get stock levels for a specific radiator across all warehouses
  async getRadiatorStock(radiatorId) {
    try {
      console.log('📦 Fetching stock for radiator:', radiatorId);
      const response = await api.get(`/radiators/${radiatorId}/stock`);
      console.log('✅ Stock data loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get radiator stock error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch stock levels' 
      };
    }
  },

  // Update stock for a specific radiator at a specific warehouse
  async updateStock(radiatorId, warehouseCode, quantity) {
    try {
      console.log('📝 Updating stock:', { radiatorId, warehouseCode, quantity });
      
      const payload = {
        warehouseCode: warehouseCode.toUpperCase(),
        quantity: parseInt(quantity, 10)
      };
      
      console.log('📤 Sending stock update payload:', payload);
      
      const response = await api.post(`/radiators/${radiatorId}/stock`, payload);
      
      console.log('✅ Stock updated successfully:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update stock error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update stock' 
      };
    }
  },

  // Get all radiators with their stock levels (with fallback to existing endpoints)
  async getAllRadiatorsWithStock(search = null, lowStockOnly = false, warehouseCode = null) {
    try {
      console.log('📊 Fetching all radiators with stock...');
      
      // Try enhanced endpoint first
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (lowStockOnly) params.append('lowStockOnly', 'true');
        if (warehouseCode) params.append('warehouseCode', warehouseCode);
        
        const url = `/stock/all-radiators${params.toString() ? '?' + params.toString() : ''}`;
        const response = await api.get(url);
        
        console.log('✅ Radiators with stock loaded (enhanced):', response.data.length, 'items');
        return { success: true, data: response.data };
      } catch (enhancedError) {
        console.log('ℹ️ Enhanced endpoint not available, using fallback method...');
        
        // Fallback: Get radiators first, then stock for each
        const radiatorsResponse = await api.get('/radiators');
        
        if (!radiatorsResponse.data) {
          return { success: false, error: 'No radiators data received' };
        }

        const radiatorsWithStock = [];
        
        // For each radiator, fetch its stock levels
        for (const radiator of radiatorsResponse.data) {
          try {
            const stockResponse = await this.getRadiatorStock(radiator.id);
            const radiatorData = {
              ...radiator,
              stock: stockResponse.success ? stockResponse.data.stock : {}
            };
            
            // Apply client-side filtering if needed
            let shouldInclude = true;
            
            if (search) {
              const searchLower = search.toLowerCase();
              shouldInclude = radiator.name.toLowerCase().includes(searchLower) ||
                            radiator.code.toLowerCase().includes(searchLower) ||
                            radiator.brand.toLowerCase().includes(searchLower);
            }
            
            if (shouldInclude && lowStockOnly) {
              const hasLowStock = Object.values(radiatorData.stock || {}).some(qty => qty > 0 && qty <= 5);
              const hasOutOfStock = Object.values(radiatorData.stock || {}).some(qty => qty === 0);
              shouldInclude = hasLowStock || hasOutOfStock;
            }
            
            if (shouldInclude && warehouseCode) {
              shouldInclude = radiatorData.stock.hasOwnProperty(warehouseCode.toUpperCase());
            }
            
            if (shouldInclude) {
              radiatorsWithStock.push(radiatorData);
            }
          } catch (error) {
            console.warn(`Failed to fetch stock for radiator ${radiator.id}:`, error);
            radiatorsWithStock.push({
              ...radiator,
              stock: {}
            });
          }
        }

        console.log('✅ Radiators with stock loaded (fallback):', radiatorsWithStock.length, 'items');
        return { success: true, data: radiatorsWithStock };
      }
    } catch (error) {
      console.error('❌ Get radiators with stock error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch radiators with stock' 
      };
    }
  },

  // Get stock summary across all warehouses for dashboard
  async getStockSummary() {
    try {
      console.log('📊 Fetching stock summary...');
      const response = await api.get('/stock/summary');
      console.log('✅ Stock summary loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get stock summary error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch stock summary' 
      };
    }
  }
};

export default stockService;