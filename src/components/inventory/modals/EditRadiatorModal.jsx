// src/components/inventory/modals/EditRadiatorModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";

const emptyForm = {
  brand: "",
  code: "",
  name: "",
  year: "",
};

const EditRadiatorModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && radiator) {
      setForm({
        brand: radiator.brand ?? "",
        code: radiator.code ?? "",
        name: radiator.name ?? "",
        year: radiator.year?.toString() ?? "",
      });
      setSaving(false);
      setError("");
    }
  }, [isOpen, radiator]);

  if (!radiator) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.brand?.trim()) return "Brand is required.";
    if (!form.code?.trim()) return "Code is required.";
    if (!form.name?.trim()) return "Name is required.";
    if (form.year === "" || isNaN(Number(form.year))) return "Year must be a valid number.";
    if (Number(form.year) < 1900 || Number(form.year) > new Date().getFullYear() + 5) {
      return "Year must be between 1900 and " + (new Date().getFullYear() + 5);
    }
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
      };

      // Call the onSuccess function which should handle the API call
      const success = await onSuccess(payload);
      if (!success) {
        throw new Error("Failed to update radiator");
      }
    } catch (e) {
      console.error('Error updating radiator:', e);
      setError(e.message || "Failed to update radiator");
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
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Radiator — ${radiator.name || ""}`}>
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

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
              min={1900}
              max={new Date().getFullYear() + 5}
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2018"
              disabled={saving}
            />
          </div>
        </div>

        {/* Show current stock levels (read-only) */}
        {radiator.stock && Object.keys(radiator.stock).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Current Stock Levels</div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(radiator.stock).map(([warehouseCode, qty]) => (
                  <div key={warehouseCode} className="flex justify-between">
                    <span className="text-gray-600">{warehouseCode}:</span>
                    <span className="font-medium">{qty} units</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Note: Use the stock management tab to update quantities
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditRadiatorModal;