import React from 'react';
import { Download, Printer } from 'lucide-react';
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
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print {
              @page { margin: 0.5in; size: A4; }
              .d-print-none { display: none !important; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fff !important;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            .company-header {
              border-bottom: 3px solid #e9ecef;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 28px;
              font-weight: 700;
              color: #495057;
              margin-bottom: 8px;
            }
            .company-details {
              color: #6c757d;
              font-size: 14px;
              line-height: 1.6;
            }
            .receipt-title {
              background: #f8f9fa;
              padding: 12px 20px;
              border-radius: 6px;
              margin-bottom: 30px;
              text-align: center;
            }
            .receipt-number {
              font-size: 18px;
              font-weight: 600;
              color: #495057;
            }
            .status-badge {
              background: #28a745;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              margin-left: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .info-section h5 {
              font-size: 16px;
              font-weight: 600;
              color: #495057;
              margin-bottom: 15px;
              border-bottom: 1px solid #e9ecef;
              padding-bottom: 8px;
            }
            .info-section p {
              margin-bottom: 6px;
              color: #6c757d;
              font-size: 14px;
            }
            .info-section .highlight {
              color: #495057;
              font-weight: 500;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th {
              background: #f8f9fa;
              padding: 15px 12px;
              font-size: 14px;
              font-weight: 600;
              color: #495057;
              border-bottom: 2px solid #dee2e6;
            }
            .items-table td {
              padding: 15px 12px;
              border-bottom: 1px solid #e9ecef;
              font-size: 14px;
              color: #495057;
            }
            .item-name {
              font-weight: 600;
              color: #495057;
              margin-bottom: 4px;
            }
            .item-details {
              font-size: 12px;
              color: #6c757d;
            }
            .totals-section {
              border-top: 2px solid #dee2e6;
              padding-top: 20px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.subtotal {
              color: #6c757d;
            }
            .totals-row.tax {
              color: #6c757d;
            }
            .totals-row.final {
              border-top: 1px solid #dee2e6;
              padding-top: 15px;
              margin-top: 10px;
              font-size: 18px;
              font-weight: 700;
              color: #495057;
            }
            .footer-message {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              color: #6c757d;
              font-size: 13px;
            }
            .text-end { text-align: right; }
            .text-center { text-align: center; }
            .fw-bold { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const saveToPDF = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.sale.saleNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print {
              @page { margin: 0.5in; size: A4; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fff !important;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            .company-header {
              border-bottom: 3px solid #e9ecef;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 28px;
              font-weight: 700;
              color: #495057;
              margin-bottom: 8px;
            }
            .company-details {
              color: #6c757d;
              font-size: 14px;
              line-height: 1.6;
            }
            .receipt-title {
              background: #f8f9fa;
              padding: 12px 20px;
              border-radius: 6px;
              margin-bottom: 30px;
              text-align: center;
            }
            .receipt-number {
              font-size: 18px;
              font-weight: 600;
              color: #495057;
            }
            .status-badge {
              background: #28a745;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              margin-left: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .info-section h5 {
              font-size: 16px;
              font-weight: 600;
              color: #495057;
              margin-bottom: 15px;
              border-bottom: 1px solid #e9ecef;
              padding-bottom: 8px;
            }
            .info-section p {
              margin-bottom: 6px;
              color: #6c757d;
              font-size: 14px;
            }
            .info-section .highlight {
              color: #495057;
              font-weight: 500;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th {
              background: #f8f9fa;
              padding: 15px 12px;
              font-size: 14px;
              font-weight: 600;
              color: #495057;
              border-bottom: 2px solid #dee2e6;
            }
            .items-table td {
              padding: 15px 12px;
              border-bottom: 1px solid #e9ecef;
              font-size: 14px;
              color: #495057;
            }
            .item-name {
              font-weight: 600;
              color: #495057;
              margin-bottom: 4px;
            }
            .item-details {
              font-size: 12px;
              color: #6c757d;
            }
            .totals-section {
              border-top: 2px solid #dee2e6;
              padding-top: 20px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.subtotal {
              color: #6c757d;
            }
            .totals-row.tax {
              color: #6c757d;
            }
            .totals-row.final {
              border-top: 1px solid #dee2e6;
              padding-top: 15px;
              margin-top: 10px;
              font-size: 18px;
              font-weight: 700;
              color: #495057;
            }
            .footer-message {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              color: #6c757d;
              font-size: 13px;
            }
            .text-end { text-align: right; }
            .text-center { text-align: center; }
            .fw-bold { font-weight: 600; }
          </style>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt"
      size="xl"
    >
      <div className="flex justify-end gap-2 mb-4 d-print-none">
        <Button 
          variant="outline"
          onClick={printReceipt}
          icon={Printer}
          size="sm"
        >
          Print
        </Button>
        <Button 
          variant="outline"
          onClick={saveToPDF}
          icon={Download}
          size="sm"
        >
          Save PDF
        </Button>
      </div>

      <div id="receipt-content" className="bg-white">
        {/* Company Header */}
        <div className="company-header">
          <div className="company-name">{receipt.companyName}</div>
          <div className="company-details">
            <div>{receipt.companyAddress}</div>
            <div>{receipt.companyPhone} | {receipt.companyEmail}</div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="receipt-title">
          <span className="receipt-number">Receipt #{receipt.sale.saleNumber}</span>
          <span className="status-badge">Paid</span>
        </div>

        {/* Receipt Info Grid */}
        <div className="info-grid">
          <div className="info-section">
            <h5>Billed To:</h5>
            <p className="highlight">
              {receipt.sale.customer.firstName} {receipt.sale.customer.lastName}
            </p>
            {receipt.sale.customer.email && (
              <p>{receipt.sale.customer.email}</p>
            )}
            {receipt.sale.customer.phone && (
              <p>{receipt.sale.customer.phone}</p>
            )}
          </div>
          <div className="info-section text-end">
            <div style={{marginBottom: '20px'}}>
              <h5 style={{textAlign: 'left'}}>Receipt No:</h5>
              <p>#{receipt.sale.saleNumber}</p>
            </div>
            <div style={{marginBottom: '20px'}}>
              <h5 style={{textAlign: 'left'}}>Receipt Date:</h5>
              <p>{formatDateTime(receipt.sale.saleDate)}</p>
            </div>
            <div>
              <h5 style={{textAlign: 'left'}}>Payment Method:</h5>
              <p>{receipt.sale.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h5 style={{fontSize: '16px', fontWeight: '600', color: '#495057', marginBottom: '20px'}}>
            Order Summary
          </h5>
          <table className="items-table">
            <thead>
              <tr>
                <th style={{width: '60px', textAlign: 'center'}}>No.</th>
                <th style={{textAlign: 'left'}}>Item</th>
                <th style={{textAlign: 'right'}}>Price</th>
                <th style={{textAlign: 'center', width: '80px'}}>Quantity</th>
                <th style={{textAlign: 'right', width: '120px'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.sale.items?.map((item, index) => (
                <tr key={index}>
                  <td className="text-center fw-bold">{String(index + 1).padStart(2, '0')}</td>
                  <td>
                    <div className="item-name">
                      {item.radiator?.name || item.radiatorName || 'Unknown Product'}
                    </div>
                    <div className="item-details">
                      {item.radiator?.brand || item.brand} - {item.radiator?.code || item.radiatorCode}
                      {item.warehouse && (
                        <span> | Warehouse: {item.warehouse.name || item.warehouse.code}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end fw-bold">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
              
              {/* Totals in table */}
              <tr>
                <td colSpan="4" className="text-end" style={{borderBottom: 'none', paddingBottom: '8px'}}>
                  <strong>Sub Total</strong>
                </td>
                <td className="text-end fw-bold" style={{borderBottom: 'none', paddingBottom: '8px'}}>
                  {formatCurrency(receipt.sale.subTotal)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end" style={{borderBottom: 'none', paddingBottom: '8px'}}>
                  GST (15%):
                </td>
                <td className="text-end" style={{borderBottom: 'none', paddingBottom: '8px'}}>
                  {formatCurrency(receipt.sale.taxAmount)}
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end" style={{borderTop: '2px solid #dee2e6', paddingTop: '15px', borderBottom: 'none'}}>
                  <strong style={{fontSize: '18px'}}>Total</strong>
                </td>
                <td className="text-end" style={{borderTop: '2px solid #dee2e6', paddingTop: '15px', borderBottom: 'none'}}>
                  <strong style={{fontSize: '18px', color: '#495057'}}>
                    {formatCurrency(receipt.sale.totalAmount)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="footer-message">
          <div style={{fontWeight: '600', marginBottom: '8px'}}>Thank you for your business!</div>
          <div>For warranty claims or inquiries, please contact us with your receipt number.</div>
          <div style={{marginTop: '16px', fontSize: '12px'}}>
            Generated on {formatDateTime(new Date())}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal