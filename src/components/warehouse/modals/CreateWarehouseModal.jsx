// src/components/warehouse/modals/CreateWarehouseModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import warehouseService from '../../../api/warehouseService';

const CreateWarehouseModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    phone: '',
    email: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [codeValidation, setCodeValidation] = useState({ isValid: null, message: '' });
  const [validatingCode, setValidatingCode] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: '',
        code: '',
        location: '',
        address: '',
        phone: '',
        email: ''
      });
      setCodeValidation({ isValid: null, message: '' });
    }
  }, [isOpen]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Validate code field as user types
    if (field === 'code' && value.trim()) {
      validateCode(value.trim());
    } else if (field === 'code') {
      setCodeValidation({ isValid: null, message: '' });
    }
  };

  const validateCode = async (code) => {
    if (!code || code.length < 2) {
      setCodeValidation({ isValid: false, message: 'Code must be at least 2 characters' });
      return;
    }

    try {
      setValidatingCode(true);
      const result = await warehouseService.validateCode(code.toUpperCase());
      
      if (result.success) {
        setCodeValidation({ 
          isValid: result.data.available, 
          message: result.data.available ? 'Code is available' : 'Code is already in use' 
        });
      }
    } catch (error) {
      setCodeValidation({ isValid: false, message: 'Unable to validate code' });
    } finally {
      setValidatingCode(false);
    }
  };

  const isFormValid = () => {
    return (
      form.name.trim() &&
      form.code.trim() &&
      codeValidation.isValid &&
      !validatingCode
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      setSaving(true);
      await onSuccess(form);
    } catch (error) {
      alert(`Error creating warehouse: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Warehouse"
      size="md"
    >
      <div className="space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Auckland Distribution Center"
              disabled={saving}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AKL, NYC, SYD"
                maxLength={10}
                disabled={saving}
                required
              />
              {validatingCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            {codeValidation.message && (
              <p className={`text-xs mt-1 ${codeValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {codeValidation.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Used to identify stock levels (e.g., AKL: 15, NYC: 8)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Auckland, New York, Sydney"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full warehouse address"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +64 9 123 4567"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="warehouse@company.com"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid() || saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Warehouse'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateWarehouseModal;