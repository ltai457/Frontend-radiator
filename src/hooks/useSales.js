import { useState, useEffect, useCallback } from 'react';
import salesService from '../api/salesService';
import { getErrorMessage } from '../utils/helpers';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await salesService.getAll();
      if (result.success) {
        setSales(result.data);
      } else {
        setError(result.error || 'Failed to load sales');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = async (saleData) => {
    try {
      const result = await salesService.create(saleData);
      if (result.success) {
        setSales(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const getSaleById = useCallback(async (id) => {
    try {
      const result = await salesService.getById(id);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const getReceipt = useCallback(async (id) => {
    try {
      const result = await salesService.getReceipt(id);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const cancelSale = async (id) => {
    try {
      const result = await salesService.cancel(id);
      if (result.success) {
        setSales(prev => 
          prev.map(sale => 
            sale.id === id ? { ...sale, status: 'Cancelled' } : sale
          )
        );
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const refundSale = async (id) => {
    try {
      const result = await salesService.refund(id);
      if (result.success) {
        setSales(prev => 
          prev.map(sale => 
            sale.id === id ? { ...sale, status: 'Refunded' } : sale
          )
        );
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    getSaleById,
    getReceipt,
    cancelSale,
    refundSale
  };
};