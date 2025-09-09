// src/hooks/useWarehouses.js
import { useState, useEffect, useCallback, useRef } from 'react';
import warehouseService from '../api/warehouseService';
import { getErrorMessage } from '../utils/helpers';

function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  // Ensure minimal shape and avoid undefined fields that can blow up render
  return list.map(w => ({
    id: w?.id ?? '',
    name: w?.name ?? '',
    code: w?.code ?? '',
    location: w?.location ?? '',
    address: w?.address ?? '',
    phone: w?.phone ?? '',
    email: w?.email ?? '',
    status: w?.status ?? 'active',
    createdAt: w?.createdAt ?? null,
    updatedAt: w?.updatedAt ?? null,
    // spread last so we don't accidentally drop other fields you may add later
    ...w,
  }));
}

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // track latest request to avoid race conditions
  const reqIdRef = useRef(0);
  const abortRef = useRef(null);

  const resetError = useCallback(() => setError(''), []);

  const fetchWarehouses = useCallback(async () => {
    // cancel any in-flight fetch
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setError('');

    try {
      const result = await warehouseService.getAll({ signal: controller.signal });
      if (reqIdRef.current !== myReqId) return; // stale

      if (result?.success) {
        const data = normalizeList(result.data);
        setWarehouses(data);
        setLastFetchedAt(new Date());
        setLoaded(true);
      } else {
        setError(result?.error || 'Failed to load warehouses');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return; // ignore aborted calls
      setError(getErrorMessage(err));
    } finally {
      if (reqIdRef.current === myReqId) setLoading(false);
    }
  }, []);

  const createWarehouse = useCallback(async (warehouseData) => {
    // optimistic prepend
    const tempId = `tmp_${Date.now()}`;
    const optimistic = { ...warehouseData, id: tempId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    setWarehouses(prev => [optimistic, ...prev]);

    try {
      const result = await warehouseService.create(warehouseData);
      if (result?.success) {
        const created = result.data;
        setWarehouses(prev =>
          prev.map(w => (w.id === tempId ? { ...w, ...created } : w))
        );
        return { success: true, data: created };
      } else {
        // rollback
        setWarehouses(prev => prev.filter(w => w.id !== tempId));
        return { success: false, error: result?.error || 'Create failed' };
      }
    } catch (err) {
      // rollback
      setWarehouses(prev => prev.filter(w => w.id !== tempId));
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const updateWarehouse = useCallback(async (id, warehouseData) => {
    // optimistic update with snapshot for rollback
    let snapshot;
    setWarehouses(prev => {
      snapshot = prev;
      return prev.map(w => (w.id === id ? { ...w, ...warehouseData, updatedAt: new Date().toISOString() } : w));
    });

    try {
      const result = await warehouseService.update(id, warehouseData);
      if (result?.success) {
        setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...result.data } : w)));
        return { success: true, data: result.data };
      } else {
        setWarehouses(snapshot); // rollback
        return { success: false, error: result?.error || 'Update failed' };
      }
    } catch (err) {
      setWarehouses(snapshot); // rollback
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const deleteWarehouse = useCallback(async (id) => {
    // optimistic remove with snapshot for rollback
    let snapshot;
    setWarehouses(prev => {
      snapshot = prev;
      return prev.filter(w => w.id !== id);
    });

    try {
      const result = await warehouseService.delete(id);
      if (result?.success) {
        return { success: true };
      } else {
        setWarehouses(snapshot); // rollback
        return { success: false, error: result?.error || 'Delete failed' };
      }
    } catch (err) {
      setWarehouses(snapshot); // rollback
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const getWarehouseById = useCallback(async (id) => {
    try {
      const result = await warehouseService.getById(id);
      if (result?.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result?.error || 'Not found' };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchWarehouses]);

  return {
    warehouses,
    loading,
    loaded,          // NEW: true after first successful load
    error,
    lastFetchedAt,   // NEW: timestamp for when data last fetched
    resetError,      // NEW: helper to clear errors in UI

    fetchWarehouses,
    refetch: fetchWarehouses,

    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,

    setWarehouses,   // still exposed for local tweaks
  };
};

export default useWarehouses;
