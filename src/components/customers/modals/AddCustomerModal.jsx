import React, { useState } from 'react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import CustomerForm from '../forms/CustomerForm';

const AddCustomerModal = ({ isOpen, onClose, onSubmit }) => {
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
      title="Add New Customer"
      size="md"
    >
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        submitLabel="Create Customer"
      />
    </Modal>
  );
};

export default AddCustomerModal;