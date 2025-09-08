// src/components/warehouse/modals/StockUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import { Package, Warehouse } from 'lucide-react';
import radiatorService from '../../../api/radiatorService';

const StockUpdateModal = ({ isOpen, onClose, onSuccess, radiator, warehouse }) => {
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('set'); // 'set', 'add', 'subtract'

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && radiator) {
      const currentQty = radiator.qty || 0;
      setQuantity(currentQty.toString());
      setAdjustmentType('set');
    }
  }, [isOpen, radiator]);

  const handleSave = async () => {
    if (!radiator || !warehouse) return;

    const inputValue = parseInt(quantity, 10);
    if (isNaN(inputValue) || inputValue < 0) {
      alert('Please enter a valid quantity (0 or greater)');
      return;
    }

    let newQuantity;
    const currentQty = radiator.qty || 0;

    switch (adjustmentType) {
      case 'add':
        newQuantity = currentQty + inputValue;
        break;
      case 'subtract':
        newQuantity = Math.max(0, currentQty - inputValue);
        break;
      default: // 'set'
        newQuantity = inputValue;
    }

    try {
      setSaving(true);
      
      const result = await radiatorService.updateStock(
        radiator.id,
        warehouse.code,
        newQuantity
      );

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update stock');
      }

      if (typeof onSuccess === 'function') {
        await onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const getPreviewQuantity = () => {
    const inputValue = parseInt(quantity, 10);
    if (isNaN(inputValue)) return radiator?.qty || 0;

    const currentQty = radiator?.qty || 0;
    
    switch (adjustmentType) {
      case 'add':
        return currentQty + inputValue;
      case 'subtract':
        return Math.max(0, currentQty - inputValue);
      default: // 'set'
        return inputValue;
    }
  };

  if (!radiator || !warehouse) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Stock Level"
      size="md"
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{radiator.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>Code: {radiator.code}</span>
                <span>Brand: {radiator.brand}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <Warehouse className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Warehouse:</span>
              <span className="font-medium text-gray-900">{warehouse.name} ({warehouse.code})</span>
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="text-center py-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Current Stock</div>
          <div className="text-2xl font-bold text-blue-900">{radiator.qty || 0} units</div>
        </div>

        {/* Adjustment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjustment Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('set')}
              className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                adjustmentType === 'set'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={saving}
            >
              Set To
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('add')}
              className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                adjustmentType === 'add'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={saving}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('subtract')}
              className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                adjustmentType === 'subtract'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={saving}
            >
              Subtract
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {adjustmentType === 'set' ? 'New Quantity' : 
             adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Subtract'}
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter quantity"
            disabled={saving}
          />
        </div>

        {/* Preview */}
        {quantity && !isNaN(parseInt(quantity, 10)) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Preview</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New stock level will be:</span>
              <span className="font-semibold text-gray-900">{getPreviewQuantity()} units</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !quantity || isNaN(parseInt(quantity, 10))}
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Stock'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StockUpdateModal;