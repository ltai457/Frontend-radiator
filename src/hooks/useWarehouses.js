// src/hooks/useWarehouses.js
import { useState, useEffect, useCallback } from 'react';
import warehouseService from '../api/warehouseService';
import { getErrorMessage } from '../utils/helpers';

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await warehouseService.getAll();
      if (result.success) {
        setWarehouses(result.data);
      } else {
        setError(result.error || 'Failed to load warehouses');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createWarehouse = async (warehouseData) => {
    try {
      const result = await warehouseService.create(warehouseData);
      if (result.success) {
        setWarehouses((prev) => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const updateWarehouse = async (id, warehouseData) => {
    try {
      const result = await warehouseService.update(id, warehouseData);
      if (result.success) {
        setWarehouses((prev) =>
          prev.map((w) => (w.id === id ? { ...w, ...result.data } : w))
        );
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      const result = await warehouseService.delete(id);
      if (result.success) {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  // Optional: get single warehouse fresh from server
  const getWarehouseById = async (id) => {
    try {
      const result = await warehouseService.getById(id);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    refetch: fetchWarehouses,   // keep parity with useRadiators()
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    setWarehouses,              // expose setter if you need local tweaks
  };
};

export default useWarehouses;
