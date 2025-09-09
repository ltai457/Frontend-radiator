import React from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "../common/ui/Button";

// Money formatter
const fmtMoney = (n) =>
  (n ?? n === 0)
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "NZD" }).format(n)
    : "—";

const RadiatorCards = ({ radiators, onEdit, onDelete, onEditStock, isAdmin }) => {
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  const getStockColor = (totalStock) => {
    if (totalStock === 0) return "text-red-600";
    if (totalStock <= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const userIsAdmin = !!isAdmin;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {radiators.map((r) => {
        const totalStock = getTotalStock(r.stock);

        return (
          <div
            key={r.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            {/* Placeholder for image */}
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-sm">Image here</span>
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{r.name}</h3>
              <p className="text-sm text-gray-600">Brand: {r.brand}</p>
              <p className="text-sm text-gray-600">Code: {r.code}</p>
              <p className="text-sm text-gray-600">Year: {r.year}</p>

              {/* Prices */}
              <div className="mt-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Retail: </span>
                  {fmtMoney(r.retailPrice)}
                </p>
                

                <p className="text-sm text-gray-900">
                  <span className="font-medium">Trade: </span>
                  {fmtMoney(r.tradePrice)}
                </p>
                
              </div>

              {/* Stock */}
              <div className="mt-2 text-sm">
                <span className={`font-medium ${getStockColor(totalStock)}`}>
                  {totalStock} units
                </span>
                {r.stock && (
                  <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-2">
                    {Object.entries(r.stock).map(([wh, qty]) => (
                      <span key={wh}>
                        {wh}: {qty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStock(r)}
                icon={Package}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Edit Stock"
              />
              {userIsAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(r)}
                    icon={Edit}
                    className="p-1 text-yellow-600 hover:text-yellow-800"
                    title="Edit Radiator"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(r)}
                    icon={Trash2}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete Radiator"
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RadiatorCards;
