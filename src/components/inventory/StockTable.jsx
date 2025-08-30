import React from 'react';
import { Edit } from 'lucide-react';
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
} from '../common/ui/Table';
import { Button } from '../common/ui/Button';
import radiatorService from '../../api/radiatorService';

const StockTable = ({ items, warehouse, onEditStock, onQuickUpdate, userRole }) => {
  const [busyId, setBusyId] = React.useState(null);

  const getStockBadge = (qty) => {
    if (qty === 0) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (qty <= 5) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }
  };

  const handleQuickAdd = async (radiator, amount) => {
    if (!warehouse) return;
    const targetQty = Math.max(0, (radiator.qty || 0) + amount);

    try {
      setBusyId(radiator.id);
      // Persist to API
      await radiatorService.updateStockForWarehouse(
        radiator.id,
        warehouse.code,
        targetQty
      );

      // Let parent refresh data (use refetch if available)
      if (typeof onQuickUpdate === 'function') {
        await onQuickUpdate();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('Failed to update stock. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const canEdit = userRole?.includes?.('Admin') || userRole === 'Admin';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Code</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="w-24 text-right">Qty</TableHead>
            <TableHead className="w-36">Status</TableHead>
            <TableHead className="w-[320px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono">{r.code}</TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <span className="text-xs text-gray-500">
                    Brand: {r.brand} · Year: {r.year}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-right font-semibold tabular-nums">
                {r.qty}
              </TableCell>

              <TableCell>{getStockBadge(r.qty)}</TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {/* Quick add buttons */}
                  {canEdit && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => handleQuickAdd(r, +1)}
                        title="+1"
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => handleQuickAdd(r, +5)}
                        title="+5"
                      >
                        +5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => handleQuickAdd(r, +10)}
                        title="+10"
                      >
                        +10
                      </Button>
                      {/* Optional quick decrease (guarded to >= 0) */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id || r.qty <= 0}
                        onClick={() => handleQuickAdd(r, -1)}
                        title="-1"
                      >
                        -1
                      </Button>
                    </>
                  )}

                  {/* Open full edit modal */}
                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => onEditStock(r)}
                      disabled={busyId === r.id}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
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

export default StockTable;