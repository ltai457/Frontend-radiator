import React from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.sale.saleNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-details { margin-bottom: 20px; }
            .receipt-items table { width: 100%; border-collapse: collapse; }
            .receipt-items th, .receipt-items td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
            .receipt-items th { background-color: #f5f5f5; }
            .receipt-totals { margin-top: 20px; text-align: right; }
            .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt"
      size="lg"
    >
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant="outline"
          onClick={printReceipt}
          icon={Download}
          size="sm"
        >
          Print
        </Button>
      </div>

      <div id="receipt-content" className="bg-white p-8 border rounded-lg">
        {/* Company Header */}
        <div className="receipt-header text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{receipt.companyName}</h1>
          <p className="text-sm text-gray-600 mt-2">{receipt.companyAddress}</p>
          <p className="text-sm text-gray-600">{receipt.companyPhone} | {receipt.companyEmail}</p>
        </div>

        <div className="border-t border-b py-4 mb-6">
          <h2 className="text-lg font-semibold text-center">RECEIPT</h2>
        </div>

        {/* Receipt Details */}
        <div className="receipt-details grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Sale Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Receipt #:</span> {receipt.sale.saleNumber}</p>
              <p><span className="font-medium">Date:</span> {formatDateTime(receipt.sale.saleDate)}</p>
              <p><span className="font-medium">Served By:</span> {receipt.sale.processedBy?.username || receipt.sale.processedByName}</p>
              <p><span className="font-medium">Payment:</span> {receipt.sale.paymentMethod}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {receipt.sale.customer.firstName} {receipt.sale.customer.lastName}</p>
              {receipt.sale.customer.email && <p><span className="font-medium">Email:</span> {receipt.sale.customer.email}</p>}
              {receipt.sale.customer.phone && <p><span className="font-medium">Phone:</span> {receipt.sale.customer.phone}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="receipt-items mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.sale.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    <div className="font-medium">{item.radiator.name}</div>
                    <div className="text-xs text-gray-600">{item.radiator.brand} - {item.radiator.code}</div>
                  </td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right py-2">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="receipt-totals text-right space-y-2 mb-8">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(receipt.sale.subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (15%):</span>
            <span>{formatCurrency(receipt.sale.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(receipt.sale.totalAmount)}</span>
          </div>
        </div>

        <div className="receipt-footer text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-2">For warranty claims or inquiries, please contact us with your receipt number.</p>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal