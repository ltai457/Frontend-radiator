// src/components/sales/modals/SaleDetailsModal.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { StatusBadge } from '../../common/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const SaleDetailsModal = ({ isOpen, onClose, sale, onViewReceipt }) => {
  if (!sale) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';  
      case 'Cancelled': return 'error';
      case 'Refunded': return 'info';
      default: return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sale Details - ${sale.saleNumber}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Sale Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Sale Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Number:</span>
                <span className="font-medium">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDateTime(sale.saleDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processed By:</span>
                <span className="font-medium">{sale.processedBy?.username || sale.processedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">{sale.paymentMethod}</span>
              </div>
              
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-medium">
                  {sale.customer ? 
                    `${sale.customer.firstName} ${sale.customer.lastName}` : 
                    sale.customerName}
                </div>
              </div>
              {sale.customer?.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium">{sale.customer.email}</div>
                </div>
              )}
              {sale.customer?.phone && (
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium">{sale.customer.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table - FIXED */}
        {sale.items && sale.items.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Items Purchased</h4>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      {/* Product Information */}
                      <td className="px-4 py-2 text-sm">
                        <div className="font-medium text-gray-900">
                          {item.radiator?.name || item.radiatorName || 'Unknown Product'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.radiator?.brand || item.brand} - {item.radiator?.code || item.radiatorCode}
                        </div>
                      </td>
                      
                      {/* Warehouse Information */}
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {item.warehouse?.name || item.warehouseName || item.warehouse?.code || item.warehouseCode || 'N/A'}
                      </td>
                      
                      {/* Quantity */}
                      <td className="px-4 py-2 text-sm text-right">
                        {item.quantity}
                      </td>
                      
                      {/* Unit Price */}
                      <td className="px-4 py-2 text-sm text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      
                      {/* Total Price */}
                      <td className="px-4 py-2 text-sm text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(sale.subTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (15%):</span>
              <span className="font-medium">{formatCurrency(sale.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total Amount:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{sale.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button 
          variant="outline"
          onClick={() => onViewReceipt(sale)}
          icon={FileText}
        >
          View Receipt
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;