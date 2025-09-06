import { useState, useEffect, useCallback } from 'react';
import salesService from '../api/salesService';
import { getErrorMessage } from '../utils/helpers';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSales = useCallback(async () => {
    console.log('🔄 Fetching sales...');
    setLoading(true);
    setError('');
    
    try {
      const result = await salesService.getAll();
      console.log('📊 Sales fetch result:', result);
      
      if (result.success) {
        console.log('✅ Sales loaded successfully:', result.data.length, 'sales');
        setSales(result.data);
      } else {
        console.error('❌ Failed to load sales:', result.error);
        setError(result.error || 'Failed to load sales');
      }
    } catch (err) {
      console.error('❌ Sales fetch error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = async (saleData) => {
    console.log('🆕 Creating sale with data:', saleData);
    
    try {
      const result = await salesService.create(saleData);
      console.log('💰 Create sale result:', result);
      
      if (result.success) {
        console.log('✅ Sale created successfully, refreshing list...');
        // Refresh the entire list to get correct SaleListDto format
        await fetchSales();
        return { success: true, data: result.data };
      } else {
        console.error('❌ Failed to create sale:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Create sale error:', err);
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
    console.log('🚀 useSales mounting, fetching initial sales...');
    fetchSales();
  }, [fetchSales]);

  // Log sales state changes
  useEffect(() => {
    console.log('📈 Sales state updated:', sales.length, 'sales in array');
  }, [sales]);

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