// src/components/sales/ReceiptModal.jsx
import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const RECEIPT_CSS = `
  /* Page setup for print */
  @page { size: A4; margin: 18mm; }
  html, body { background:#fff; margin:0; padding:0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1f2937; }

  /* Container */
  .rcpt-page { max-width: 820px; margin: 0 auto; }
  .rcpt-card { background:#fff; }

  /* Header */
  .rcpt-header { display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:3px solid #e5e7eb; margin-bottom:20px; }
  .rcpt-title { font-size:32px; font-weight:800; color:#2563eb; letter-spacing:.5px; }
  .rcpt-logo { width:64px; height:64px; border-radius:9999px; background:#d1d5db; display:flex; align-items:center; justify-content:center; color:#4b5563; font-weight:600; }

  /* Meta grid */
  .rcpt-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-bottom:16px; }
  .rcpt-block h4 { margin:0 0 6px 0; font-size:.85rem; font-weight:700; color:#374151; }
  .rcpt-block p  { margin:0 0 4px 0; color:#4b5563; font-size:.9rem; }

  /* Table */
  .rcpt-table { width:100%; border-collapse:collapse; margin-top:8px; }
  .rcpt-table thead th { background:#f3f4f6; color:#374151; font-weight:700; font-size:.8rem; padding:10px 8px; text-align:left; }
  .rcpt-table thead th.rcpt-col-qty { width:64px; text-align:center; }
  .rcpt-table thead th.rcpt-col-unit, .rcpt-table thead th.rcpt-col-amt { text-align:right; width:120px; }
  .rcpt-table tbody td { padding:10px 8px; border-top:1px solid #f1f5f9; color:#374151; }
  .rcpt-center { text-align:center; }
  .rcpt-right  { text-align:right; }

  /* Totals */
  .rcpt-totals { width:300px; margin-left:auto; margin-top:12px; }
  .rcpt-totals .row { display:flex; justify-content:space-between; padding:6px 0; }
  .rcpt-totals .grand { border-top:1px solid #e5e7eb; margin-top:8px; padding-top:10px; font-weight:800; font-size:1.125rem; }

  /* Signature */
  .rcpt-sig { display:flex; justify-content:flex-end; margin-top:42px; }
  .rcpt-sig-line { width:280px; height:40px; border-bottom:1px solid #9ca3af; }
  .rcpt-sig-label { text-align:right; margin-top:6px; font-size:.85rem; color:#6b7280; }

  /* Terms */
  .rcpt-terms h5 { color:#ef4444; margin:0 0 6px 0; }
  .rcpt-terms p  { margin:0 0 6px 0; color:#4b5563; }

  /* On-screen spacing */
  .rcpt-p-8 { padding: 2rem; }
`;

// === COMPONENT ===
const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const sale = receipt.sale || {};
  const customer = sale.customer || {};
  const items = Array.isArray(sale.items) ? sale.items : [];

  const subTotal =
    sale.subTotal ??
    items.reduce(
      (sum, it) =>
        sum +
        (Number(it.totalPrice ?? (Number(it.unitPrice || 0) * Number(it.quantity || 0))) || 0),
      0
    );
  const taxAmount = sale.taxAmount ?? subTotal * 0.15;
  const totalAmount = sale.totalAmount ?? subTotal + taxAmount;

  // Clean A4 print window using the SAME CSS as the modal
  const openPrintWindow = (autoPrint = false) => {
    const content = document.getElementById('receipt-content')?.innerHTML || '';
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale.saleNumber || ''}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${RECEIPT_CSS}</style>
        </head>
        <body>
          <div class="rcpt-page rcpt-p-8">
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
      {/* Inject the SAME CSS for on-screen view */}
      <style dangerouslySetInnerHTML={{ __html: RECEIPT_CSS }} />

      {/* On-screen actions (do not appear in PDF because we print from a clean window) */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button variant="outline" size="sm" icon={Printer} onClick={() => openPrintWindow(true)}>
          Print
        </Button>
        <Button variant="outline" size="sm" icon={Download} onClick={() => openPrintWindow(true)}>
          Save PDF
        </Button>
      </div>

      {/* RECEIPT CONTENT (same markup used for modal + print window) */}
      <div id="receipt-content" className="rcpt-page rcpt-card rcpt-p-8">
        {/* Header */}
        <div className="rcpt-header">
          <div className="rcpt-title">RECEIPT</div>
          <div className="rcpt-logo">LOGO</div>
        </div>

        {/* Meta row */}
        <div className="rcpt-grid">
          <div className="rcpt-block">
            <h4>BILL TO</h4>
            <p>{customer.firstName} {customer.lastName}</p>
            {customer.email && <p>{customer.email}</p>}
            {customer.phone && <p>{customer.phone}</p>}
          </div>

          <div className="rcpt-block">
            <h4>SHIP TO</h4>
            <p>{sale.shippingName || `${customer.firstName || ''} ${customer.lastName || ''}`}</p>
            {sale.shippingAddress && <p>{sale.shippingAddress}</p>}
          </div>

          <div className="rcpt-block">
            <p><span className="font-semibold">Receipt #:</span> {sale.saleNumber || '—'}</p>
            <p><span className="font-semibold">Receipt Date:</span> {sale.saleDate ? formatDateTime(sale.saleDate) : formatDateTime(new Date())}</p>
            {sale.poNumber && <p><span className="font-semibold">P.O #:</span> {sale.poNumber}</p>}
            {sale.dueDate && <p><span className="font-semibold">Due Date:</span> {formatDateTime(sale.dueDate)}</p>}
          </div>
        </div>

        {/* Items table */}
        <table className="rcpt-table">
          <thead>
            <tr>
              <th className="rcpt-col-qty">QTY</th>
              <th>Product</th>
              
              <th className="rcpt-col-unit">UNIT PRICE</th>
              <th className="rcpt-col-amt">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td className="rcpt-center">{it.quantity}</td>
                <td>{it.radiator?.name || it.radiatorName || it.name || 'Item'}</td>
                <td className="rcpt-right">{formatCurrency(it.unitPrice)}</td>
                <td className="rcpt-right">
                  {formatCurrency(it.totalPrice ?? (Number(it.unitPrice || 0) * Number(it.quantity || 0)))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="rcpt-totals">
          <div className="row"><span>Subtotal</span><span>{formatCurrency(subTotal)}</span></div>
          <div className="row"><span>GST (15%)</span><span>{formatCurrency(taxAmount)}</span></div>
          <div className="row grand"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
        </div>

        {/* Signature */}
        <div className="rcpt-sig">
          <div>
            <div className="rcpt-sig-line"></div>
            <div className="rcpt-sig-label">Authorized Signature</div>
          </div>
        </div>

        {/* Terms */}
        <div className="rcpt-terms" style={{ marginTop: '2rem' }}>
          <h5>TERMS & CONDITIONS</h5>
          <p>{receipt.terms || 'Payment is due within 15 days.'}</p>
          {receipt.bankLine && <p style={{ marginTop: '.5rem' }}>{receipt.bankLine}</p>}
        </div>

        {/* Optional footer */}
        <div style={{ marginTop: '2rem', fontStyle: 'italic' }}>Thank you</div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
