// src/components/sales/InvoiceTable.jsx
import React from "react";
import { Eye, FileText, Copy } from "lucide-react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../common/ui/Table";
import { Button } from "../common/ui/Button";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const InvoiceTable = ({ invoices, onViewDetails }) => {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-50">
            <TableRow>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Invoice #
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Issue Date
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Customer
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Payment
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Items
              </TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase text-gray-500">
                Total
              </TableHead>
              <TableHead className="w-32 text-center text-xs tracking-wider uppercase text-gray-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.invoiceNumber}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Invoice # with copy-on-hover */}
                <TableCell className="font-mono">
                  <div className="group inline-flex items-center gap-2">
                    <span className="truncate max-w-[180px] md:max-w-none">
                      {invoice.invoiceNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(invoice.invoiceNumber)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                      title="Copy invoice number"
                      aria-label="Copy invoice number"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </TableCell>

                <TableCell>{formatDateTime(invoice.issueDate)}</TableCell>

                <TableCell className="max-w-[200px] truncate">
                  {invoice.customer?.fullName || "N/A"}
                </TableCell>

                <TableCell>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {invoice.paymentMethod}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  {invoice.items?.length || 0}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {formatCurrency(invoice.totalAmount)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(invoice)}
                      icon={Eye}
                      title="View details"
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceTable;
