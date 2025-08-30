import React, { useState } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';

const CreateSaleModal = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Sale"
      size="xl"
    >
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          This is a placeholder for the comprehensive sale creation form.
          <br />
          <strong>Features to implement:</strong>
        </p>
        
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
          <li>Customer selection dropdown with search</li>
          <li>Product selection with real-time stock validation</li>
          <li>Warehouse selection per item</li>
          <li>Quantity inputs with stock level checks</li>
          <li>Real-time price calculation with GST</li>
          <li>Payment method selection</li>
          <li>Notes and special instructions</li>
          <li>Stock deduction preview</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Implementation Requirements:</h4>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Use customerService.getAll() for customer dropdown</li>
            <li>Use radiatorService.getAll() for product selection</li>
            <li>Use warehouseService.getAll() for warehouse options</li>
            <li>Validate stock levels before allowing item addition</li>
            <li>Calculate totals including 15% GST</li>
            <li>Call salesService.create() on form submission</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit({ /* mock data */ })} 
            loading={loading}
          >
            Create Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateSaleModal;
