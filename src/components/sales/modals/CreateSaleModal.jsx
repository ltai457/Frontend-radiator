import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import { Plus, Trash2, Search, Package } from 'lucide-react';
import customerService from '../../../api/customerService';
import radiatorService from '../../../api/radiatorService';
import warehouseService from '../../../api/warehouseService';

const CreateSaleModal = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentMethod: 'Cash',
    notes: '',
    items: []
  });
  
  // Data for dropdowns
  const [customers, setCustomers] = useState([]);
  const [radiators, setRadiators] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFormData();
      // Reset form
      setFormData({
        customerId: '',
        paymentMethod: 'Cash',
        notes: '',
        items: []
      });
      setError('');
    }
  }, [isOpen]);

  const loadFormData = async () => {
    setLoadingData(true);
    try {
      const [customersResult, radiatorsResult, warehousesResult] = await Promise.all([
        customerService.getAll(),
        radiatorService.getAll(),
        warehouseService.getAll()
      ]);

      if (customersResult.success) setCustomers(customersResult.data);
      if (radiatorsResult.success) setRadiators(radiatorsResult.data);
      if (warehousesResult.success) setWarehouses(warehousesResult.data);
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        radiatorId: '',
        warehouseId: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRadiatorChange = (index, radiatorId) => {
    const radiator = radiators.find(r => r.id === radiatorId);
    if (radiator) {
      updateItem(index, 'radiatorId', radiatorId);
      updateItem(index, 'unitPrice', radiator.retailPrice || 0);
    }
  };

  // Helper functions - declare before using in JSX
  const calculateSubTotal = () => {
    return formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
  };

  const calculateTax = () => {
    return calculateSubTotal() * 0.15; // 15% GST
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateTax();
  };

  const getAvailableStock = (radiatorId, warehouseId) => {
    const radiator = radiators.find(r => r.id === radiatorId);
    const warehouse = warehouses.find(w => w.id === warehouseId);
    
    if (!radiator || !warehouse) return 0;
    
    return radiator.stock?.[warehouse.code] || 0;
  };

  const validateForm = () => {
    if (!formData.customerId) {
      setError('Please select a customer');
      return false;
    }
    
    if (formData.items.length === 0) {
      setError('Please add at least one item');
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.radiatorId) {
        setError(`Please select a radiator for item ${i + 1}`);
        return false;
      }
      if (!item.warehouseId) {
        setError(`Please select a warehouse for item ${i + 1}`);
        return false;
      }
      if (item.quantity <= 0) {
        setError(`Quantity must be greater than 0 for item ${i + 1}`);
        return false;
      }
      if (item.unitPrice <= 0) {
        setError(`Unit price must be greater than 0 for item ${i + 1}`);
        return false;
      }

      const availableStock = getAvailableStock(item.radiatorId, item.warehouseId);
      if (item.quantity > availableStock) {
        setError(`Not enough stock for item ${i + 1}. Available: ${availableStock}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Sale" size="xl">
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" text="Loading form data..." />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sale" size="xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} {customer.company && `- ${customer.company}`}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Account">Account</option>
          </select>
        </div>

        {/* Sale Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
            <Button
              type="button"
              onClick={addItem}
              icon={Plus}
              size="sm"
              disabled={loading}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    icon={Trash2}
                    variant="danger"
                    size="sm"
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Radiator Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Radiator *
                    </label>
                    <select
                      value={item.radiatorId}
                      onChange={(e) => handleRadiatorChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Select radiator</option>
                      {radiators.map(radiator => (
                        <option key={radiator.id} value={radiator.id}>
                          {radiator.brand} {radiator.code} - {radiator.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse *
                    </label>
                    <select
                      value={item.warehouseId}
                      onChange={(e) => updateItem(index, 'warehouseId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                    {item.radiatorId && item.warehouseId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {getAvailableStock(item.radiatorId, item.warehouseId)}
                      </p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-3 text-right">
                  <span className="text-sm font-medium text-gray-700">
                    Item Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No items added yet. Click "Add Item" to start.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional notes about this sale..."
            disabled={loading}
          />
        </div>

        {/* Sale Summary */}
        {formData.items.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Sale Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (15%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button"
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={loading}
            disabled={formData.items.length === 0 || !formData.customerId}
          >
            Create Sale
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSaleModal;