// src/components/warehouse/components/StockTable.jsx
import React, { useState } from 'react';
import { Edit, Plus, Minus } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../common/ui/Table';
import { Button } from '../../common/ui/Button';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import radiatorService from '../../../api/radiatorService';

const StockTable = ({
  items = [],
  warehouse,
  onEditStock,
  onQuickUpdate,
  userRole,
}) => {
  const [busyId, setBusyId] = useState(null);

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

  const handleQuickUpdate = async (radiator, amount) => {
    if (!warehouse) {
      alert('No warehouse selected');
      return;
    }

    const currentQty = radiator.qty || 0;
    const newQty = Math.max(0, currentQty + amount);

    try {
      setBusyId(radiator.id);

      const result = await radiatorService.updateStock(
        radiator.id,
        warehouse.code,
        newQty
      );

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update stock');
      }

      if (typeof onQuickUpdate === 'function') {
        await onQuickUpdate();
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock: ' + (error.message || 'Unknown error'));
    } finally {
      setBusyId(null);
    }
  };

  const canEdit = userRole?.includes?.('Admin') || userRole === 'Admin';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              Quantity
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </TableHead>
            {canEdit && (
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell 
                className="px-4 py-8 text-center text-sm text-gray-500" 
                colSpan={canEdit ? 5 : 4}
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {item.code}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.brand}</div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => handleQuickUpdate(item, -1)}
                        disabled={busyId === item.id || (item.qty || 0) === 0}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                    
                    <span className="font-semibold text-gray-900 min-w-8 text-center">
                      {busyId === item.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        item.qty || 0
                      )}
                    </span>
                    
                    {canEdit && (
                      <button
                        onClick={() => handleQuickUpdate(item, 1)}
                        disabled={busyId === item.id}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-center">
                  {getStockBadge(item.qty || 0)}
                </TableCell>

                {canEdit && (
                  <TableCell className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditStock(item)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockTable;