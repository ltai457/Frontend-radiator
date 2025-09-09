// src/components/warehouse/modals/EditWarehouseModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { AlertCircle } from 'lucide-react';

const EditWarehouseModal = ({ isOpen, onClose, onSuccess, warehouse }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    phone: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Populate form when warehouse changes or modal opens
  useEffect(() => {
    if (isOpen && warehouse) {
      setForm({
        name: warehouse.name || '',
        code: warehouse.code || '',
        location: warehouse.location || '',
        address: warehouse.address || '',
        phone: warehouse.phone || '',
        email: warehouse.email || ''
      });
      setErrors({});
    }
  }, [isOpen, warehouse]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    }
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (form.phone && !/^[\d\s+()-]+$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data - convert empty strings to null for optional fields
      const warehouseData = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(), // Ensure code is uppercase
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null
      };
      
      console.log('Submitting warehouse update:', warehouseData);
      
      await onSuccess(warehouseData);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      setErrors({ submit: error.message || 'Failed to update warehouse' });
      setLoading(false); // Reset loading on error
    }
  };
  
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  if (!warehouse) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Warehouse - ${warehouse.name}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Error Alert */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}
        
        {/* Warehouse Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Auckland Main Warehouse"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>
        
        {/* Warehouse Code (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse Code
          </label>
          <input
            type="text"
            value={form.code}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-gray-600 cursor-not-allowed"
            disabled
          />
          <p className="mt-1 text-xs text-gray-500">
            Warehouse code cannot be changed after creation
          </p>
        </div>
        
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Auckland, New Zealand"
            disabled={loading}
          />
        </div>
        
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Street address, city, postal code"
            rows={2}
            disabled={loading}
          />
        </div>
        
        {/* Phone and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+64 9 123 4567"
              disabled={loading}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="warehouse@company.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Warehouse'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditWarehouseModal;