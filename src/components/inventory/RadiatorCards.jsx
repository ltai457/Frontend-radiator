import React from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "../common/ui/Button";
import RadiatorImage from "./RadiatorImage"; // Import our image component

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
            {/* UPDATED: Real image instead of placeholder */}
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {r.primaryImageUrl || r.imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={r.primaryImageUrl || r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder (hidden by default) */}
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  {/* Image count badge if multiple images */}
                  {r.imageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      +{r.imageCount - 1}
                    </div>
                  )}
                </div>
              ) : (
                // No image placeholder
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-8 h-8 mb-2" />
                  <span className="text-xs">No image</span>
                </div>
              )}
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