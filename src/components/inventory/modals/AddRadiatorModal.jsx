// src/components/inventory/modals/AddRadiatorModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import radiatorService from "../../../api/radiatorService";

const emptyForm = {
  brand: "",
  code: "",
  name: "",
  year: "",
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

  const validate = () => {
    if (!form.brand?.trim()) return "Brand is required.";
    if (!form.code?.trim()) return "Code is required.";
    if (!form.name?.trim()) return "Name is required.";
    if (form.year === "" || isNaN(Number(form.year))) return "Year must be a number.";
    return "";
  };

  const handleSave = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        initialStock: initialStock, // { AKL: 10, WEL: 0, ... }
      };

      const res = await radiatorService.create(payload);
      if (!res?.success) throw new Error(res?.error || "Failed to create radiator");

      await onSuccess?.(res.data);
      onClose?.();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to create radiator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Radiator">
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* Basic details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Denso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Unique product code"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Toyota Corolla Radiator"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2018"
              min={0}
            />
          </div>
        </div>

        {/* Initial stock per warehouse */}
        {warehouses.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Initial Stock by Warehouse</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {warehouses.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">{w.name}</div>
                    <div className="text-xs text-gray-500">Code: {w.code}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={initialStock[w.code] ?? 0}
                    onChange={(e) => updateWarehouseQty(w.code, e.target.value)}
                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddRadiatorModal;
