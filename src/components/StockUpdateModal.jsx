// src/components/StockUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import radiatorService from '../api/radiatorService';
import warehouseService from '../api/warehouseService';

const StockUpdateModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const [stockLevels, setStockLevels] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateResults, setUpdateResults] = useState({});

  // Load warehouses and current stock when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (isOpen && radiator) {
        // Load warehouses
        const whResult = await warehouseService.getAll();
        if (whResult.success) {
          setWarehouses(whResult.data);
        }
        
        // Set initial stock levels from radiator prop, or load from API
        if (radiator.stock && Object.keys(radiator.stock).length > 0) {
          setStockLevels(radiator.stock);
        } else {
          // Fallback: load from API
          const stockResult = await radiatorService.getStock(radiator.id);
          if (stockResult.success) {
            setStockLevels(stockResult.data.stock || {});
          }
        }
      }
    };
    
    loadData();
  }, [isOpen, radiator]);

  const handleStockChange = (warehouseCode, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      setStockLevels(prev => ({
        ...prev,
        [warehouseCode]: quantity
      }));
      
      // Clear any previous update result for this warehouse
      if (updateResults[warehouseCode]) {
        setUpdateResults(prev => {
          const newResults = { ...prev };
          delete newResults[warehouseCode];
          return newResults;
        });
      }
    }
  };

  const handleUpdateStock = async (warehouseCode) => {
    setLoading(true);
    setError('');

    const quantity = stockLevels[warehouseCode];
    const result = await radiatorService.updateStock(radiator.id, warehouseCode, quantity);
    
    // Store the result for this warehouse
    setUpdateResults(prev => ({
      ...prev,
      [warehouseCode]: result
    }));
    
    if (result.success) {
      // Call success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleUpdateAllStock = async () => {
    setLoading(true);
    setError('');
    setUpdateResults({});

    const result = await radiatorService.updateStockBulk(radiator.id, stockLevels);
    
    if (result.success) {
      // Mark all as successful
      const allResults = {};
      Object.keys(stockLevels).forEach(code => {
        allResults[code] = { success: true };
      });
      setUpdateResults(allResults);
      
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error);
      // If we have detailed results, use them
      if (result.data) {
        const detailedResults = {};
        result.data.forEach(({ warehouseCode, result: itemResult }) => {
          detailedResults[warehouseCode] = itemResult;
        });
        setUpdateResults(detailedResults);
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setUpdateResults({});
      onClose();
    }
  };

  const getWarehouseName = (code) => {
    const warehouse = warehouses.find(w => w.code === code);
    return warehouse ? warehouse.name : code;
  };

  const getUpdateStatus = (warehouseCode) => {
    const result = updateResults[warehouseCode];
    if (!result) return null;
    return result.success ? 'success' : 'error';
  };

  if (!isOpen || !radiator) return null;

  // Get warehouse codes from either the current stock or warehouses list
  const warehouseCodes = warehouses.length > 0 
    ? warehouses.map(w => w.code)
    : Object.keys(stockLevels);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Update Stock</h3>
              <p className="text-sm text-gray-600">{radiator.brand} - {radiator.name}</p>
              <p className="text-xs text-gray-500">Code: {radiator.code}</p>
            </div>
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {/* Stock levels for each warehouse */}
          <div className="space-y-4">
            {warehouseCodes.map((warehouseCode) => {
              const quantity = stockLevels[warehouseCode] || 0;
              const status = getUpdateStatus(warehouseCode);
              
              return (
                <div key={warehouseCode} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <h4 className="font-medium text-gray-900">{getWarehouseName(warehouseCode)}</h4>
                    <p className="text-sm text-gray-500">{warehouseCode}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => handleStockChange(warehouseCode, e.target.value)}
                      className="input-field w-20 text-center"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleUpdateStock(warehouseCode)}
                      disabled={loading}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        status === 'success' 
                          ? 'bg-green-100 text-green-800'
                          : status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loading ? '...' : status === 'success' ? '✓' : status === 'error' ? '✗' : 'Update'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={handleUpdateAllStock}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {loading ? 'Updating All...' : 'Update All'}
            </button>
            
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              {Object.keys(updateResults).length > 0 ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;