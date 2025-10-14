import { useState, useEffect, useCallback } from 'react';
import salesService from '../api/salesService';
import { getErrorMessage } from '../utils/helpers';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoices = useCallback(async () => {
    console.log('🔄 Fetching invoices...');
    setLoading(true);
    setError('');

    try {
      const result = await salesService.getAllInvoices();
      console.log('📊 Invoices fetch result:', result);

      if (result.success) {
        console.log('✅ Invoices loaded successfully:', result.data.length, 'invoices');
        setInvoices(result.data);
      } else {
        console.error('❌ Failed to load invoices:', result.error);
        setError(result.error || 'Failed to load invoices');
      }
    } catch (err) {
      console.error('❌ Invoices fetch error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = async (invoiceData) => {
    console.log('🆕 Creating invoice with data:', invoiceData);

    try {
      const result = await salesService.createInvoice(invoiceData);
      console.log('📄 Create invoice result:', result);

      if (result.success) {
        console.log('✅ Invoice created successfully, refreshing list...');
        await fetchInvoices();
        return { success: true, data: result.data };
      } else {
        console.error('❌ Failed to create invoice:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Create invoice error:', err);
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const getInvoiceById = useCallback(async (id) => {
    try {
      const result = await salesService.getInvoiceById(id);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  const getInvoiceByNumber = useCallback(async (invoiceNumber) => {
    try {
      const result = await salesService.getInvoiceByNumber(invoiceNumber);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }, []);

  useEffect(() => {
    console.log('🚀 useInvoices mounting, fetching initial invoices...');
    fetchInvoices();
  }, [fetchInvoices]);

  // Log invoices state changes
  useEffect(() => {
    console.log('📈 Invoices state updated:', invoices.length, 'invoices in array');
  }, [invoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    getInvoiceById,
    getInvoiceByNumber
  };
};
