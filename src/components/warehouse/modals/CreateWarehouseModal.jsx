// src/components/warehouse/modals/CreateWarehouseModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

const emptyForm = {
  name: '',
  code: '',
  location: '',
  address: '',
  phone: '',
  email: ''
};

const CreateWarehouseModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [codeValidation, setCodeValidation] = useState({ isValid: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setSaving(false);
      setError('');
      setCodeValidation({ isValid: null, message: '' });
    }
  }, [isOpen]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
    // Clear code validation when code changes
    if (key === 'code') {
      setCodeValidation({ isValid: null, message: '' });
    }
  };

  const validateCode = (code) => {
    if (!code.trim()) {
      setCodeValidation({ isValid: false, message: 'Code is required' });
      return;
    }
    
    if (code.length < 2 || code.length > 10) {
      setCodeValidation({ isValid: false, message: 'Code must be 2-10 characters' });
      return;
    }
    
    if (!/^[A-Z0-9]+$/.test(code.toUpperCase())) {
      setCodeValidation({ isValid: false, message: 'Code can only contain letters and numbers' });
      return;
    }
    
    setCodeValidation({ isValid: true, message: 'Code format is valid' });
  };

  const handleCodeBlur = () => {
    if (form.code.trim()) {
      validateCode(form.code.trim().toUpperCase());
    }
  };

  const validate = () => {
    if (!form.name?.trim()) return 'Warehouse name is required';
    if (!form.code?.trim()) return 'Warehouse code is required';
    if (form.code.length < 2 || form.code.length > 10) return 'Code must be 2-10 characters';
    if (!/^[A-Z0-9]+$/i.test(form.code)) return 'Code can only contain letters and numbers';
    
    // Email validation if provided
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null
      };

      // Call the onSuccess function which should handle the API call
      const success = await onSuccess(payload);
      if (!success) {
        throw new Error('Failed to create warehouse');
      }

      // Close modal on success
      onClose();
    } catch (e) {
      console.error('Error creating warehouse:', e);
      setError(e.message || 'Failed to create warehouse');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Warehouse">
      <div className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Main Distribution Center"
                disabled={saving}
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
                  onBlur={handleCodeBlur}
                  className={`w-full border rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:border-blue-500 ${
                    codeValidation.isValid === true 
                      ? 'border-green-300 focus:ring-green-500' 
                      : codeValidation.isValid === false 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., WH01, NYC, MAIN"
                  maxLength={10}
                  disabled={saving}
                />
                {codeValidation.isValid === true && (
                  <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {codeValidation.isValid === false && (
                  <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Creating...' : 'Create Warehouse'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateWarehouseModal;