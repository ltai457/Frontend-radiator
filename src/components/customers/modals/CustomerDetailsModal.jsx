import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { StatusBadge } from '../../common/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const CustomerDetailsModal = ({ isOpen, onClose, customer, onViewSales }) => {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <div className="font-medium">{customer.firstName} {customer.lastName}</div>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <div className="font-medium">{customer.email || 'Not provided'}</div>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <div className="font-medium">{customer.phone || 'Not provided'}</div>
            </div>
            <div>
              <span className="text-gray-600">Company:</span>
              <div className="font-medium">{customer.company || 'Individual customer'}</div>
            </div>
          </div>
          {customer.address && (
            <div className="mt-3">
              <span className="text-gray-600">Address:</span>
              <div className="font-medium">{customer.address}</div>
            </div>
          )}
        </div>

        {/* Purchase Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Purchase Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{customer.totalPurchases || 0}</div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</div>
              <div className="text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{formatDate(customer.lastPurchaseDate)}</div>
              <div className="text-gray-600">Last Purchase</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <StatusBadge status={customer.isActive ? 'Active' : 'Inactive'} />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button 
          variant="outline"
          onClick={() => onViewSales(customer)}
          icon={ShoppingCart}
        >
          View Orders
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CustomerDetailsModal;