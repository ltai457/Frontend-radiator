// src/components/inventory/modals/StockUpdateModal.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import { useWarehouses } from "../../../hooks/useWarehouses";
import radiatorService from "../../../api/radiatorService";

const StockUpdateModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const { warehouses } = useWarehouses();
  const [stockLevels, setStockLevels] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && radiator) {
      // Initialize stock levels from radiator's current stock
      const currentStock = {};
      warehouses.forEach(warehouse => {
        currentStock[warehouse.code] = radiator.stock?.[warehouse.code] ?? 0;
      });
      setStockLevels(currentStock);
      setError("");
      setSaving(false);
    }
  }, [isOpen, radiator, warehouses]);

  if (!radiator) return null;

  const updateStockLevel = (warehouseCode, value) => {
    const qty = Math.max(0, Number(value || 0));
    setStockLevels(prev => ({
      ...prev,
      [warehouseCode]: qty
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // Update stock for each warehouse
      const updatePromises = Object.entries(stockLevels).map(([warehouseCode, qty]) =>
        radiatorService.updateStock(radiator.id, warehouseCode, qty)
      );

      const results = await Promise.all(updatePromises);
      
      // Check if any updates failed
      const failedUpdates = results.filter(res => !res?.success);
      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update stock for some warehouses: ${failedUpdates.map(r => r.error).join(', ')}`);
      }

      await onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Stock update failed:", err);
      setError(err.message || "Failed to update stock levels");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError("");
      onClose();
    }
  };

  const getTotalStock = () => {
    return Object.values(stockLevels).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Update Stock — ${radiator.name}`}>
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* Product info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-900">{radiator.name}</div>
          <div className="text-xs text-gray-500">
            Brand: {radiator.brand} • Code: {radiator.code} • Year: {radiator.year}
          </div>
        </div>

        {/* Stock levels by warehouse */}
        {warehouses.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-900">Stock Levels by Warehouse</div>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{getTotalStock()}</span> units
              </div>
            </div>
            
            <div className="space-y-3">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{warehouse.name}</div>
                    <div className="text-xs text-gray-500">Code: {warehouse.code}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Qty:</span>
                    <input
                      type="number"
                      min={0}
                      value={stockLevels[warehouse.code] ?? 0}
                      onChange={(e) => updateStockLevel(warehouse.code, e.target.value)}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No warehouses available
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || warehouses.length === 0}>
            {saving ? "Updating..." : "Update Stock"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StockUpdateModal;