
// src/hooks/useCustomers.js
import { useState, useEffect, useCallback } from 'react';
import customerService from '../api/customerService';
import { getErrorMessage } from '../utils/helpers';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await customerService.getAll();
      if (result.success) {
        setCustomers(result.data);
      } else {
        setError(result.error || 'Failed to load customers');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = async (customerData) => {
    try {
      const result = await customerService.create(customerData);
      if (result.success) {
        setCustomers(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const result = await customerService.update(id, customerData);
      if (result.success) {
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id ? { ...customer, ...result.data } : customer
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

  const deleteCustomer = async (id) => {
    try {
      const result = await customerService.delete(id);
      if (result.success) {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const getCustomerById = useCallback(async (id) => {
    try {
      const result = await customerService.getById(id);
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
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
  };
};
