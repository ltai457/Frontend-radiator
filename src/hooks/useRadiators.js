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
      const result = await radiatorService.getAll();
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

  // UPDATED: Create radiator (with optional image support)
  const createRadiator = async (radiatorData, imageFile = null) => {
    try {
      let result;
      
      // Use createWithImage if image is provided, otherwise use regular create
      if (imageFile) {
        console.log('🖼️ Creating radiator with image...');
        result = await radiatorService.createWithImage(radiatorData, imageFile);
      } else {
        console.log('📝 Creating radiator without image...');
        result = await radiatorService.create(radiatorData);
      }
      
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

  // NEW: Image-related functions
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
    refetch: fetchRadiators, // alias for consistency
    createRadiator,
    updateRadiator,
    deleteRadiator,
    updateStock,
    // NEW: Image functions
    getRadiatorImages,
    uploadRadiatorImage
  };
}