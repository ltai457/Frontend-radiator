// src/components/inventory/modals/AddRadiatorModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";

const emptyForm = {
  brand: "",
  code: "",
  name: "",
  year: "",
  retailPrice: "",
  tradePrice: "",
  isPriceOverridable: false,
  maxDiscountPercent: "",
};

const AddRadiatorModal = ({ isOpen, onClose, onSuccess, warehouses = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [initialStock, setInitialStock] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Initialize per-warehouse stock inputs to 0
  const defaultStock = useMemo(() => {
    const obj = {};
    warehouses.forEach((w) => (obj[w.code] = 0));
    return obj;
  }, [warehouses]);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setInitialStock(defaultStock);
      setSaving(false);
      setError("");
    }
  }, [isOpen, defaultStock]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateWarehouseQty = (code, value) => {
    const qty = Math.max(0, Number(value || 0));
    setInitialStock((prev) => ({ ...prev, [code]: qty }));
  };

  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

  const validate = () => {
    if (!form.brand?.trim()) return "Brand is required.";
    if (!form.code?.trim()) return "Code is required.";
    if (!form.name?.trim()) return "Name is required.";
    if (form.year === "" || isNaN(Number(form.year))) return "Year must be a valid number.";
    if (Number(form.year) < 1900 || Number(form.year) > new Date().getFullYear() + 5) {
      return "Year must be between 1900 and " + (new Date().getFullYear() + 5);
    }

    const rp = num(form.retailPrice);
    const tp = num(form.tradePrice);
    const md = num(form.maxDiscountPercent);

    if (rp !== null && (isNaN(rp) || rp < 0)) return "Retail price must be ≥ 0.";
    if (tp !== null && (isNaN(tp) || tp < 0)) return "Trade price must be ≥ 0.";
    if (md !== null && (isNaN(md) || md < 0 || md > 100)) return "Max discount must be between 0 and 100.";

    return "";
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    
    try {
      const payload = {
        brand: form.brand.trim(),
        code: form.code.trim(),
        name: form.name.trim(),
        year: Number(form.year),

        // New: pricing fields
        retailPrice: num(form.retailPrice),
        tradePrice: num(form.tradePrice),
        isPriceOverridable: !!form.isPriceOverridable,
        maxDiscountPercent: num(form.maxDiscountPercent),

        // Include initial stock if warehouses are provided
        ...(warehouses.length > 0 && { stock: initialStock }),
      };

      const success = await onSuccess(payload);
      if (!success) throw new Error("Failed to create radiator");
    } catch (e) {
      console.error("Error creating radiator:", e);
      setError(e.message || "Failed to create radiator");
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Radiator">
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* Basic details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Denso"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unique product code"
              disabled={saving}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Toyota Corolla Radiator"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2018"
              min={1900}
              max={new Date().getFullYear() + 5}
              disabled={saving}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Pricing</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.retailPrice}
                onChange={(e) => updateField("retailPrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 149.99"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Price ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.tradePrice}
                onChange={(e) => updateField("tradePrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 129.99"
                disabled={saving}
              />
            </div>

            

            
          </div>
        </div>

        {/* Initial stock per warehouse */}
        {warehouses.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Initial Stock by Warehouse</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {warehouses.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800">{w.name}</div>
                    <div className="text-xs text-gray-500">Code: {w.code}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={initialStock[w.code] ?? 0}
                    onChange={(e) => updateWarehouseQty(w.code, e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create Radiator"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddRadiatorModal;
