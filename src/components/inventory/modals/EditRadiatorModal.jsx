// src/components/inventory/modals/EditRadiatorModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import radiatorService from "../../../api/radiatorService";

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
        year: radiator.year ?? "",
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
        brand: form.brand.trim(),
        code: form.code.trim(),
        name: form.name.trim(),
        year: Number(form.year),
      };

      const res = await radiatorService.update(radiator.id, payload);
      if (!res?.success) throw new Error(res?.error || "Failed to update radiator");

      await onSuccess?.(res.data);
      onClose?.();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update radiator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Radiator — ${radiator.name || ""}`}>
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

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
              min={0}
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2018"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
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
