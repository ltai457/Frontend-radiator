// src/components/warehouse/modals/EditWarehouseModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';

const EditWarehouseModal = ({ isOpen, onClose, onSuccess, warehouse }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    phone: '',
    email: ''
  });
  
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes or warehouse changes
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
    }
  }, [isOpen, warehouse]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return form.name.trim() && form.code.trim();
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      setSaving(true);
      await onSuccess(form);
    } catch (error) {
      alert(`Error updating warehouse: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!warehouse) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Warehouse - ${warehouse.name}`}
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
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              placeholder="e.g., AKL, NYC, SYD"
              maxLength={10}
              disabled={true} // Code shouldn't be editable after creation
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Warehouse code cannot be changed after creation
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
              placeholder="e.g., Auckland, New Zealand"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Street address, city, postal code"
              rows={3}
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+64 9 123 4567"
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
                Updating...
              </>
            ) : (
              'Update Warehouse'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditWarehouseModal;