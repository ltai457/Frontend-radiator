// src/components/inventory/SalesTable.jsx
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

const SalesTable = ({ sales, onViewDetails, onViewReceipt }) => {
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
                Sale #
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Date
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Customer
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Payment
              </TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase text-gray-500">
                Total
              </TableHead>
              {/* Action header stays centered to align with buttons */}
              <TableHead className="w-48 text-center text-xs tracking-wider uppercase text-gray-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sales.map((sale) => (
              <TableRow
                key={sale.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Sale # with copy-on-hover */}
                <TableCell className="font-mono">
                  <div className="group inline-flex items-center gap-2">
                    <span className="truncate max-w-[180px] md:max-w-none">
                      {sale.saleNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(sale.saleNumber)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                      title="Copy sale number"
                      aria-label="Copy sale number"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </TableCell>

                <TableCell>{formatDateTime(sale.saleDate)}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {sale.customer
                    ? `${sale.customer.firstName} ${sale.customer.lastName}`
                    : sale.customerName}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {sale.paymentMethod}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {formatCurrency(sale.totalAmount)}
                </TableCell>

                {/* Centered action group; fixed width to match header */}
                <TableCell className="w-48">
                  <div className="flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-none px-2 md:px-3"
                        icon={Eye}
                        onClick={() => onViewDetails(sale)}
                        title="View details"
                      >
                        <span className="hidden md:inline">View</span>
                      </Button>
                      <div className="w-px bg-gray-200" aria-hidden />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-none px-2 md:px-3"
                        icon={FileText}
                        onClick={() => onViewReceipt(sale)}
                        title="Open receipt"
                      >
                        <span className="hidden md:inline">Receipt</span>
                      </Button>
                    </div>
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

export default SalesTable;
