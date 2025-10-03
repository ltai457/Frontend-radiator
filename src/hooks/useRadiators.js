// src/hooks/useRadiators.js
import { useState, useEffect, useCallback } from 'react';
import radiatorService from '../api/radiatorService';
import { getErrorMessage } from '../utils/helpers';

export const useRadiators = () => {
  const [radiators, setRadiators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRadiators = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch radiators sorted by createdAt ascending (earliest first)
      const result = await radiatorService.getAll('createdAt', 'asc');
      if (result.success) {
        setRadiators(result.data);
      } else {
        setError(result.error || 'Failed to load radiators');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Simplified: Create radiator (with optional image)
  const createRadiator = async (radiatorData, imageFile = null) => {
    try {
      console.log('🖼️ Creating radiator, image:', imageFile ? 'yes' : 'no');
      
      // Always use the same method - image is optional
      const result = await radiatorService.create(radiatorData, imageFile);
      
      if (result.success) {
        setRadiators(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const updateRadiator = async (id, radiatorData) => {
    try {
      const result = await radiatorService.update(id, radiatorData);
      if (result.success) {
        setRadiators(prev => 
          prev.map(radiator => 
            radiator.id === id ? { ...radiator, ...result.data } : radiator
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

  const deleteRadiator = async (id) => {
    try {
      const result = await radiatorService.delete(id);
      if (result.success) {
        setRadiators(prev => prev.filter(radiator => radiator.id !== id));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const updateStock = async (id, stockData) => {
    try {
      const result = await radiatorService.updateStock(id, stockData);
      if (result.success) {
        // Refresh the radiator to get updated stock
        await fetchRadiators();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  // Image-related functions
  const getRadiatorImages = async (radiatorId) => {
    try {
      const result = await radiatorService.getRadiatorImages(radiatorId);
      return result;
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const uploadRadiatorImage = async (radiatorId, imageFile, isPrimary = false) => {
    try {
      const result = await radiatorService.uploadImage(radiatorId, imageFile, isPrimary);
      if (result.success) {
        // Refresh the radiators to get updated image info
        await fetchRadiators();
      }
      return result;
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  useEffect(() => {
    fetchRadiators();
  }, [fetchRadiators]);

  return {
    radiators,
    loading,
    error,
    fetchRadiators,
    refetch: fetchRadiators,
    createRadiator,
    updateRadiator,
    deleteRadiator,
    updateStock,
    getRadiatorImages,
    uploadRadiatorImage
  };
};