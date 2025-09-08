import React from "react";
import { Edit } from "lucide-react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../common/ui/Table";
import { Button } from "../common/ui/Button";
import radiatorService from "../../api/radiatorService";

const StockTable = ({
  items = [],
  warehouse,
  onEditStock,
  onQuickUpdate,
  userRole,
}) => {
  const [busyId, setBusyId] = React.useState(null);

  const getStockBadge = (qty) => {
    if (qty === 0) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (qty <= 5) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
        In Stock
      </span>
    );
  };

  const handleQuickAdd = async (radiator, amount) => {
    if (!warehouse) {
      alert("No warehouse selected");
      return;
    }

    const targetQty = Math.max(0, (radiator.qty || 0) + amount);

    try {
      setBusyId(radiator.id);

      const res = await radiatorService.updateStock(
        radiator.id,
        warehouse.code,
        targetQty
      );

      if (!res?.success) throw new Error(res?.error || "Failed to update stock");

      if (typeof onQuickUpdate === "function") {
        await onQuickUpdate();
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
      alert("Failed to update stock: " + (err.message || "Unknown error"));
    } finally {
      setBusyId(null);
    }
  };

  const canEdit = userRole?.includes?.("Admin") || userRole === "Admin";

  return (
    <div className="bg-white rounded-lg shadow">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Product
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Qty
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </TableHead>
            {canEdit && (
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell className="px-4 py-8 text-center text-sm text-gray-500" colSpan={canEdit ? 5 : 4}>
                No items to display
              </TableCell>
            </TableRow>
          ) : (
            items.map((r) => (
              <TableRow key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <TableCell className="px-4 py-3">
                  <span className="text-sm font-mono text-gray-900">{r.code}</span>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">
                      {r.brand} • {r.year}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {r.qty || 0}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3 text-center">
                  {getStockBadge(r.qty || 0)}
                </TableCell>

                {canEdit && (
                  <TableCell className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditStock(r)}
                      disabled={busyId === r.id}
                      aria-busy={busyId === r.id}
                      className="p-1.5 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {busyId && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="text-sm text-blue-800 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating stock...
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;