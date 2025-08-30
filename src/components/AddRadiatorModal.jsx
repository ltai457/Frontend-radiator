// src/components/AddRadiatorModal.jsx
// Simplified version for debugging
import React, { useState, useEffect } from 'react';
import radiatorService from '../api/radiatorService';
import warehouseService from '../api/warehouseService';

const AddRadiatorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand: '',
    code: '',
    name: '',
    year: new Date().getFullYear()
  });
  const [initialStock, setInitialStock] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showStockInput, setShowStockInput] = useState(false);

  // Load warehouses when modal opens
  useEffect(() => {
    const loadWarehouses = async () => {
      if (isOpen) {
        console.log('🏗️ Loading warehouses...');
        const result = await warehouseService.getAll();
        console.log('📦 Warehouses result:', result);
        
        if (result.success) {
          setWarehouses(result.data);
          // Initialize stock levels to 0 for each warehouse
          const stockInit = {};
          result.data.forEach(warehouse => {
            stockInit[warehouse.code] = 0;
          });
          setInitialStock(stockInit);
          console.log('✅ Warehouses loaded:', result.data);
          console.log('📊 Initial stock setup:', stockInit);
        } else {
          console.error('❌ Failed to load warehouses:', result.error);
          setErrors({ general: 'Failed to load warehouses: ' + result.error });
        }
      }
    };
    
    loadWarehouses();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 0 : value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStockChange = (warehouseCode, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      setInitialStock(prev => ({
        ...prev,
        [warehouseCode]: quantity
      }));
      console.log('📊 Stock updated for', warehouseCode, ':', quantity);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.year < 1900 || formData.year > 2030) {
      newErrors.year = 'Year must be between 1900 and 2030';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple create without stock
  const handleCreateBasic = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    console.log('🚀 Creating basic radiator (no stock):', formData);
    
    const result = await radiatorService.create(formData);
    
    if (result.success) {
      console.log('✅ Basic radiator created successfully:', result.data);
      handleSuccess(result.data);
    } else {
      console.error('❌ Failed to create basic radiator:', result.error);
      handleError(result);
    }
    setLoading(false);
  };

  // Create with initial stock
  const handleCreateWithStock = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    const dataWithStock = {
      ...formData,
      initialStock: initialStock
    };
    
    console.log('🚀 Creating radiator WITH stock:', dataWithStock);
    
    const result = await radiatorService.create(dataWithStock);
    
    if (result.success) {
      console.log('✅ Radiator with stock created successfully:', result.data);
      handleSuccess(result.data);
    } else {
      console.error('❌ Failed to create radiator with stock:', result.error);
      
      // Fallback: Try to create basic radiator then update stock
      console.log('🔄 Attempting fallback: create basic + update stock...');
      
      try {
        const basicResult = await radiatorService.create(formData);
        
        if (basicResult.success) {
          console.log('✅ Basic radiator created, now updating stock...');
          
          // Update stock for warehouses with non-zero quantities
          const stockPromises = [];
          Object.entries(initialStock).forEach(([warehouseCode, quantity]) => {
            if (quantity > 0) {
              console.log(`📊 Updating stock for ${warehouseCode}: ${quantity}`);
              stockPromises.push(
                radiatorService.updateStock(basicResult.data.id, warehouseCode, quantity)
              );
            }
          });
          
          if (stockPromises.length > 0) {
            const stockResults = await Promise.all(stockPromises);
            console.log('📊 Stock update results:', stockResults);
            
            // Get updated radiator data
            const updatedResult = await radiatorService.getById(basicResult.data.id);
            const finalData = updatedResult.success ? updatedResult.data : basicResult.data;
            
            handleSuccess(finalData);
          } else {
            handleSuccess(basicResult.data);
          }
        } else {
          handleError(basicResult);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setErrors({ general: 'Failed to create radiator: ' + fallbackError.message });
      }
    }
    setLoading(false);
  };

  const handleSuccess = (data) => {
    console.log('🎉 Success! Radiator created:', data);
    // Reset form
    setFormData({
      brand: '',
      code: '',
      name: '',
      year: new Date().getFullYear()
    });
    setInitialStock({});
    setErrors({});
    setShowStockInput(false);
    onSuccess(data);
    onClose();
  };

  const handleError = (result) => {
    if (result.error.includes('already exists')) {
      setErrors({ code: 'This code already exists' });
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        brand: '',
        code: '',
        name: '',
        year: new Date().getFullYear()
      });
      setInitialStock({});
      setErrors({});
      setShowStockInput(false);
      onClose();
    }
  };

  const getTotalStock = () => {
    return Object.values(initialStock).reduce((sum, qty) => sum + qty, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Add New Radiator</h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Basic Information Form */}
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.brand ? 'border-red-500' : ''}`}
                  placeholder="e.g. Denso, Koyo"
                  disabled={loading}
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.code ? 'border-red-500' : ''}`}
                  placeholder="e.g. RAD001"
                  disabled={loading}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Toyota Camry Radiator"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max="2030"
                className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.year ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>

            {/* Stock Input Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Initial Stock (Optional)</h4>
                <button
                  type="button"
                  onClick={() => setShowStockInput(!showStockInput)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showStockInput ? 'Hide Stock Input' : 'Set Initial Stock'}
                </button>
              </div>

              {showStockInput && warehouses.length > 0 && (
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">Set starting inventory for each warehouse:</p>
                  
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium text-sm">{warehouse.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({warehouse.code})</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={initialStock[warehouse.code] || 0}
                        onChange={(e) => handleStockChange(warehouse.code, e.target.value)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  ))}
                  
                  {getTotalStock() > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Total stock: {getTotalStock()} units
                    </div>
                  )}
                </div>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {errors.general}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleCreateBasic}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                {loading ? 'Creating...' : 'Create (No Stock)'}
              </button>
              
              {showStockInput && getTotalStock() > 0 && (
                <button
                  type="button"
                  onClick={handleCreateWithStock}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {loading ? 'Creating...' : 'Create with Stock'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRadiatorModal;