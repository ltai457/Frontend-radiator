// src/components/SaleDetailsModal.jsx
import React from 'react';

const SaleDetailsModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>
              <p className="text-sm text-gray-600">Transaction #{sale.saleNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sale Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                <p className="mt-1 text-sm text-gray-900">{sale.customerName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Sale Date</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(sale.saleDate).toLocaleDateString()} at {new Date(sale.saleDate).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Processed By</h4>
                <p className="mt-1 text-sm text-gray-900">{sale.processedByName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                <p className="mt-1 text-sm text-gray-900">{sale.paymentMethod}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  sale.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sale.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">${sale.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Items Placeholder */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Items Sold</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{sale.itemCount} item{sale.itemCount !== 1 ? 's' : ''} sold</p>
                <p className="text-xs text-gray-500 mt-1">Item details would be loaded from the API</p>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${(sale.totalAmount / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (15% GST):</span>
                  <span className="text-gray-900">${(sale.totalAmount - sale.totalAmount / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${sale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="flex space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                Print Receipt
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Email Receipt
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;