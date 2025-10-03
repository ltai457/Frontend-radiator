import React from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "../common/ui/Button";

// Money formatter
const fmtMoney = (n) =>
  (n ?? n === 0)
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "NZD" }).format(n)
    : "—";

const RadiatorCards = ({ radiators, onEdit, onDelete, onEditStock, isAdmin }) => {
  const userIsAdmin = !!isAdmin;

  // Calculate total stock from all warehouses
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  // Get color based on stock level
  const getStockColor = (totalStock) => {
    if (totalStock === 0) return "text-red-600 bg-red-50 border-red-200";
    if (totalStock <= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {radiators.map((r) => {
        const totalStock = getTotalStock(r.stock);
        const stockColorClass = getStockColor(totalStock);

        return (
          <div
            key={r.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            {/* Image Section */}
            <div 
              className="w-full bg-gray-100 rounded-lg mb-4 overflow-hidden relative flex items-center justify-center"
              style={{ 
                height: '160px', 
                minHeight: '160px', 
                maxHeight: '160px' 
              }}
            >
              {r.primaryImageUrl || r.imageUrl ? (
                <>
                  <img
                    src={r.primaryImageUrl || r.imageUrl}
                    alt={r.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '160px', 
                      objectFit: 'contain' 
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.fallback-placeholder').style.display = 'flex';
                    }}
                  />
                  <div 
                    className="fallback-placeholder absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center" 
                    style={{ display: 'none', height: '160px' }}
                  >
                    <div className="text-center">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500">Image failed to load</span>
                    </div>
                  </div>
                  
                  {r.imageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full z-10">
                      +{r.imageCount - 1}
                    </div>
                  )}
                </>
              ) : (
                <div 
                  className="w-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 rounded-lg"
                  style={{ height: '160px' }}
                >
                  <Package className="w-8 h-8 mb-2" />
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{r.name}</h3>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Brand: {r.brand}</p>
                <p className="text-sm text-gray-600">Code: {r.code}</p>
                <p className="text-sm text-gray-600">Year: {r.year}</p>

                {r.productType && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Type:</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {r.productType}
                    </span>
                  </div>
                )}

                {r.dimensions && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dimensions:</span> {r.dimensions}
                  </p>
                )}

                {r.notes && (
                  <p className="text-sm text-gray-500 italic line-clamp-2">
                    "{r.notes}"
                  </p>
                )}
              </div>

              {/* Stock Display - NEW */}
              <div className={`mt-3 p-2 rounded-lg border ${stockColorClass}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase">Stock</span>
                  <span className="text-sm font-bold">{totalStock} units</span>
                </div>
                
                {r.stock && Object.keys(r.stock).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(r.stock).map(([warehouse, qty]) => (
                      <span 
                        key={warehouse}
                        className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200"
                      >
                        {warehouse}: <span className="font-semibold">{qty}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Prices */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Retail: </span>
                  {fmtMoney(r.retailPrice)}
                </p>
                
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Trade: </span>
                  {fmtMoney(r.tradePrice)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-gray-100">
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