// src/components/StockUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import radiatorService from '../api/radiatorService';

const StockUpdateModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const [stockLevels, setStockLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load current stock when modal opens
  useEffect(() => {
    if (isOpen && radiator) {
      setStockLevels(radiator.stock || {});
    }
  }, [isOpen, radiator]);

  const handleStockChange = (warehouseCode, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      setStockLevels(prev => ({
        ...prev,
        [warehouseCode]: quantity
      }));
    }
  };

  const handleUpdateStock = async (warehouseCode) => {
    setLoading(true);
    setError('');

    const quantity = stockLevels[warehouseCode];
    const result = await radiatorService.updateStock(radiator.id, warehouseCode, quantity);
    
    if (result.success) {
      onSuccess(radiator.id); // Refresh parent data
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen || !radiator) return null;

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
            {Object.entries(stockLevels).map(([warehouseCode, quantity]) => (
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {loading ? '...' : 'Update'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get warehouse display names
const getWarehouseName = (code) => {
  const warehouseNames = {
    'WH_AKL': 'Auckland Main Warehouse',
    'WH_CHC': 'Christchurch Warehouse', 
    'WH_WLG': 'Wellington Warehouse',
    // Handle any other codes that might exist
  };
  return warehouseNames[code] || code;
};

export default StockUpdateModal;