import React from "react";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";

export default function StockTable({
  warehouses,
  items,
  selectedWarehouse,
  editMode,
  getTotalStock,
  getStockStatus,
  getDisplayStock,
  onChangeStock,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              {selectedWarehouse === "all" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock
                  </th>
                  {(warehouses || []).map((w) => (
                    <th
                      key={w.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {w.code}
                    </th>
                  ))}
                </>
              ) : (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {editMode ? "Edit Quantity" : "Current Stock"}
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {safeItems.map((r) => {
              const total = getTotalStock(r.stock);
              const out = total === 0;
              const low = total > 0 && total <= 5;

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  {/* Product Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {r.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {r.brand} - {r.code}
                      </div>
                    </div>
                  </td>

                  {/* Stock Columns */}
                  {selectedWarehouse === "all" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {total}
                        </div>
                      </td>
                      {(warehouses || []).map((w) => {
                        const current = r.stock?.[w.code] || 0;
                        const status = getStockStatus(current);
                        return (
                          <td
                            key={w.id}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                            >
                              {current}
                            </span>
                          </td>
                        );
                      })}
                    </>
                  ) : (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode ? (
                        <QuantityEditor
                          value={getDisplayStock(r.id, total)}
                          onDecrement={() =>
                            onChangeStock(
                              r.id,
                              Math.max(0, getDisplayStock(r.id, total) - 1)
                            )
                          }
                          onIncrement={() =>
                            onChangeStock(r.id, getDisplayStock(r.id, total) + 1)
                          }
                          onChange={(v) => onChangeStock(r.id, v)}
                        />
                      ) : (
                        <Badge
                          quantity={total}
                          getStockStatus={getStockStatus}
                        />
                      )}
                    </td>
                  )}

                  {/* Status Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {out ? (
                      <Status
                        text="Out of Stock"
                        className="text-red-600"
                        icon={AlertTriangle}
                      />
                    ) : low ? (
                      <Status
                        text="Low Stock"
                        className="text-yellow-600"
                        icon={AlertTriangle}
                      />
                    ) : (
                      <Status
                        text="Good"
                        className="text-green-600"
                        icon={CheckCircle}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {safeItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No radiators found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

/* --- Helper components --- */
function Badge({ quantity, getStockStatus }) {
  const s = getStockStatus(quantity);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}
    >
      {quantity}
    </span>
  );
}

function Status({ text, className, icon: Icon }) {
  return (
    <span className={`inline-flex items-center space-x-1 ${className}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{text}</span>
    </span>
  );
}

function QuantityEditor({ value, onDecrement, onIncrement, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrement}
        className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-20 px-3 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={onIncrement}
        className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
