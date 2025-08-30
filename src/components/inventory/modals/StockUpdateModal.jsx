// src/components/inventory/modals/StockUpdateModal.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import radiatorService from "../../../api/radiatorService";

const StockUpdateModal = ({ isOpen, onClose, onSuccess, radiator, selectedWarehouse }) => {
  const [qty, setQty] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (radiator) {
      setQty(radiator.qty ?? 0);
    }
  }, [radiator]);

  if (!radiator) return null;

  const handleSave = async () => {
    if (!selectedWarehouse) return;
    setSaving(true);
    try {
      const res = await radiatorService.updateStock(
        radiator.id,
        selectedWarehouse.code,
        Number(qty)
      );
      if (!res?.success) throw new Error(res?.error || "Update failed");

      await onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Stock update failed:", err);
      alert(err.message || "Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Stock — ${radiator.name}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse: <span className="font-semibold">{selectedWarehouse?.name}</span>
          </label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StockUpdateModal;
