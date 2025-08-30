import React, { useState } from 'react';
import { Modal } from '../../common/ui/Modal';
import CustomerForm from '../forms/CustomerForm';

const EditCustomerModal = ({ isOpen, onClose, onSubmit, customer }) => {
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
      title={`Edit Customer - ${customer?.firstName} ${customer?.lastName}`}
      size="md"
    >
      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        submitLabel="Update Customer"
        showActiveToggle={true}
      />
    </Modal>
  );
};

export default EditCustomerModal;