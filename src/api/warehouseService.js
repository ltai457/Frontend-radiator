// src/api/warehouseService.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5128/api/v1';

const authHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const warehouseService = {
  async getAll() {
    try {
      const res = await fetch(`${API_BASE}/warehouses`, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to load warehouses' };
    }
  },

  async getByCode(code) {
    try {
      const res = await fetch(`${API_BASE}/warehouses/${code}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to load warehouse' };
    }
  }
};

export default warehouseService;