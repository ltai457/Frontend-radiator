// src/components/inventory/SalesTable.jsx
import React from "react";
import { Eye, FileText, Ban, RotateCcw } from "lucide-react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../common/ui/Table";
import { Button } from "../common/ui/Button";
import { StatusBadge } from "../common/ui/StatusBadge";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const SalesTable = ({
  sales,
  onViewDetails,
  onViewReceipt,
  onCancel,
  onRefund,
  userRole,
}) => {
  const canManage = userRole?.includes?.("Admin") || userRole === "Admin";

  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "error";
      case "Refunded":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono">{sale.saleNumber}</TableCell>
              <TableCell>{formatDateTime(sale.saleDate)}</TableCell>
              <TableCell>
                {sale.customer
                  ? `${sale.customer.firstName} ${sale.customer.lastName}`
                  : sale.customerName}
              </TableCell>
              <TableCell>{sale.paymentMethod}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(sale.totalAmount)}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={sale.status}
                  variant={getStatusVariant(sale.status)}
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => onViewDetails(sale)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FileText}
                    onClick={() => onViewReceipt(sale)}
                  >
                    Receipt
                  </Button>
                  {canManage && sale.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Ban}
                      onClick={() => onCancel(sale)}
                    >
                      Cancel
                    </Button>
                  )}
                  {canManage && sale.status === "Completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={RotateCcw}
                      onClick={() => onRefund(sale)}
                    >
                      Refund
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
