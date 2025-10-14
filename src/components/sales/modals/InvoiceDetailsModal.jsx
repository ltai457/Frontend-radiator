// src/components/sales/modals/InvoiceDetailsModal.jsx
import React from 'react';
import { Download, Printer, X } from 'lucide-react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const INVOICE_CSS = `
  /* Page setup for print */
  @page { size: A4; margin: 18mm; }
  html, body { background:#fff; margin:0; padding:0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1f2937; }

  /* Container */
  .inv-page { max-width: 820px; margin: 0 auto; }
  .inv-card { background:#fff; }

  /* Header */
  .inv-header { display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:3px solid #e5e7eb; margin-bottom:20px; }
  .inv-title { font-size:32px; font-weight:800; color:#2563eb; letter-spacing:.5px; }
  .inv-logo { width:64px; height:64px; border-radius:9999px; background:#d1d5db; display:flex; align-items:center; justify-content:center; color:#4b5563; font-weight:600; }

  /* Meta grid */
  .inv-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:16px; }
  .inv-block h4 { margin:0 0 6px 0; font-size:.85rem; font-weight:700; color:#374151; }
  .inv-block p  { margin:0 0 4px 0; color:#4b5563; font-size:.9rem; }

  /* Table */
  .inv-table { width:100%; border-collapse:collapse; margin-top:8px; }
  .inv-table thead th { background:#f3f4f6; color:#374151; font-weight:700; font-size:.8rem; padding:10px 8px; text-align:left; }
  .inv-table thead th.inv-col-qty { width:64px; text-align:center; }
  .inv-table thead th.inv-col-unit, .inv-table thead th.inv-col-amt { text-align:right; width:120px; }
  .inv-table tbody td { padding:10px 8px; border-top:1px solid #f1f5f9; color:#374151; }
  .inv-center { text-align:center; }
  .inv-right  { text-align:right; }

  /* Totals */
  .inv-totals { width:300px; margin-left:auto; margin-top:12px; }
  .inv-totals .row { display:flex; justify-content:space-between; padding:6px 0; }
  .inv-totals .grand { border-top:1px solid #e5e7eb; margin-top:8px; padding-top:10px; font-weight:800; font-size:1.125rem; }

  /* Signature */
  .inv-sig { display:flex; justify-content:flex-end; margin-top:42px; }
  .inv-sig-line { width:280px; height:40px; border-bottom:1px solid #9ca3af; }
  .inv-sig-label { text-align:right; margin-top:6px; font-size:.85rem; color:#6b7280; }

  /* Terms */
  .inv-terms h5 { color:#ef4444; margin:0 0 6px 0; }
  .inv-terms p  { margin:0 0 6px 0; color:#4b5563; }

  /* On-screen spacing */
  .inv-p-8 { padding: 2rem; }
`;

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const customer = invoice.customer || {};
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subTotal = invoice.subTotal || 0;
  const taxAmount = invoice.taxAmount || 0;
  const totalAmount = invoice.totalAmount || 0;
  const taxRate = invoice.taxRate || 0.15;

  // Print window with clean A4 layout
  const openPrintWindow = (autoPrint = false) => {
    const content = document.getElementById('invoice-content')?.innerHTML || '';
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber || ''}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${INVOICE_CSS}</style>
        </head>
        <body>
          <div class="inv-page inv-p-8">
            ${content}
          </div>
          ${autoPrint ? '<script>window.onload=()=>{window.print();}</script>' : ''}
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Inject the CSS for on-screen view */}
      <style dangerouslySetInnerHTML={{ __html: INVOICE_CSS }} />

      {/* On-screen actions */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button variant="outline" size="sm" icon={Printer} onClick={() => openPrintWindow(true)}>
          Print
        </Button>
        <Button variant="outline" size="sm" icon={Download} onClick={() => openPrintWindow(true)}>
          Save PDF
        </Button>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose}>
          Close
        </Button>
      </div>

      {/* INVOICE CONTENT */}
      <div id="invoice-content" className="inv-page inv-card inv-p-8">
        {/* Header */}
        <div className="inv-header">
          <div className="inv-title">INVOICE</div>
          <div className="inv-logo">LOGO</div>
        </div>

        {/* Meta row */}
        <div className="inv-grid">
          <div className="inv-block">
            <h4>BILL TO</h4>
            <p>{customer.fullName || 'N/A'}</p>
            {customer.company && <p>{customer.company}</p>}
            {customer.email && <p>{customer.email}</p>}
            {customer.phone && <p>{customer.phone}</p>}
            {customer.address && <p>{customer.address}</p>}
          </div>

          <div className="inv-block">
            <h4>ISSUED BY</h4>
            <p>{invoice.processedBy?.username || 'N/A'}</p>
            {invoice.processedBy?.email && <p>{invoice.processedBy.email}</p>}
          </div>

          <div className="inv-block">
            <p><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber || '—'}</p>
            <p><span className="font-semibold">Issue Date:</span> {formatDateTime(invoice.issueDate)}</p>
            <p><span className="font-semibold">Payment:</span> {invoice.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Notes if present */}
        {invoice.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-700"><strong>Notes:</strong> {invoice.notes}</p>
          </div>
        )}

        {/* Items table */}
        <table className="inv-table">
          <thead>
            <tr>
              <th className="inv-col-qty">QTY</th>
              <th>Description</th>
              <th>Details</th>
              <th className="inv-col-unit">UNIT PRICE</th>
              <th className="inv-col-amt">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="inv-center">{item.quantity}</td>
                <td>
                  {item.isCustomItem ? (
                    <span>{item.description}</span>
                  ) : (
                    <span>{item.radiatorName || item.description}</span>
                  )}
                </td>
                <td>
                  {!item.isCustomItem && (
                    <span className="text-xs text-gray-500">
                      {item.brand && `${item.brand} • `}
                      {item.radiatorCode && `Code: ${item.radiatorCode}`}
                      {item.warehouseName && ` • ${item.warehouseName}`}
                    </span>
                  )}
                </td>
                <td className="inv-right">{formatCurrency(item.unitPrice)}</td>
                <td className="inv-right">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="inv-totals">
          <div className="row"><span>Subtotal</span><span>{formatCurrency(subTotal)}</span></div>
          <div className="row"><span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span>{formatCurrency(taxAmount)}</span></div>
          <div className="row grand"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
        </div>

        {/* Signature */}
        <div className="inv-sig">
          <div>
            <div className="inv-sig-line"></div>
            <div className="inv-sig-label">Authorized Signature</div>
          </div>
        </div>

        {/* Terms */}
        <div className="inv-terms" style={{ marginTop: '2rem' }}>
          <h5>TERMS & CONDITIONS</h5>
          <p>Payment is due within 30 days. Thank you for your business!</p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem', fontStyle: 'italic', textAlign: 'center' }}>
          Thank you for your business
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetailsModal;
