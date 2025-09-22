// src/components/inventory/modals/EditRadiatorModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";

const emptyForm = {
  brand: "",
  code: "",
  name: "",
  year: "",
  retailPrice: "",
  tradePrice: "",
  costPrice: "",
  isPriceOverridable: false,
  maxDiscountPercent: "",
  productType: "",
  dimensions: "",
  notes: "",
};

const EditRadiatorModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && radiator) {
      setForm({
        brand: radiator.brand ?? "",
        code: radiator.code ?? "",
        name: radiator.name ?? "",
        year: radiator.year?.toString() ?? "",
        retailPrice:
          typeof radiator.retailPrice === "number"
            ? radiator.retailPrice.toString()
            : "",
        tradePrice:
          typeof radiator.tradePrice === "number"
            ? radiator.tradePrice.toString()
            : "",
        costPrice:
          typeof radiator.costPrice === "number"
            ? radiator.costPrice.toString()
            : "",
        isPriceOverridable: !!radiator.isPriceOverridable,
        maxDiscountPercent:
          typeof radiator.maxDiscountPercent === "number"
            ? radiator.maxDiscountPercent.toString()
            : "",
        productType: radiator.productType ?? "",
        dimensions: radiator.dimensions ?? "",
        notes: radiator.notes ?? "",
      });

      // Set existing image if available
      setExistingImageUrl(radiator.imageUrl || null);
      setSelectedImage(null);
      setImagePreview(null);
      
      setSaving(false);
      setError("");
    }
  }, [isOpen, radiator]);

  if (!radiator) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

  // Image handling
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setError("");
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    const cp = num(form.costPrice);
    const md = num(form.maxDiscountPercent);

    if (rp === null || isNaN(rp) || rp < 0) return "Retail price is required and must be ≥ 0.";
    if (tp !== null && (isNaN(tp) || tp < 0)) return "Trade price must be ≥ 0.";
    if (cp !== null && (isNaN(cp) || cp < 0)) return "Cost price must be ≥ 0.";
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
        retailPrice: num(form.retailPrice),
        tradePrice: num(form.tradePrice),
        costPrice: num(form.costPrice),
        isPriceOverridable: !!form.isPriceOverridable,
        maxDiscountPercent: num(form.maxDiscountPercent),
        productType: form.productType.trim() || null,
        dimensions: form.dimensions.trim() || null,
        notes: form.notes.trim() || null,
      };

      // Pass both payload and selected image to parent
      const success = await onSuccess(payload, selectedImage);
      if (!success) throw new Error("Failed to update radiator");
    } catch (e) {
      console.error("Error updating radiator:", e);
      setError(e.message || "Failed to update radiator");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    }
  };

  // Determine which image to show
  const displayImage = imagePreview || existingImageUrl;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Radiator — ${radiator.name || ""}`}>
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
              placeholder="e.g., DEN-001"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Heavy Duty Radiator"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 5}
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2024"
              disabled={saving}
            />
          </div>
        </div>

        {/* Pricing section */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Pricing</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retail Price ($) <span className="text-red-500">*</span>
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.costPrice}
                onChange={(e) => updateField("costPrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 99.99"
                disabled={saving}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPriceOverridable"
                checked={form.isPriceOverridable}
                onChange={(e) => updateField("isPriceOverridable", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={saving}
              />
              <label htmlFor="isPriceOverridable" className="ml-2 block text-sm text-gray-700">
                Allow price override
              </label>
            </div>
          </div>

          {form.isPriceOverridable && (
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.maxDiscountPercent}
                onChange={(e) => updateField("maxDiscountPercent", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                disabled={saving}
              />
            </div>
          )}
        </div>

        {/* Additional fields section */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Additional Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                value={form.productType}
                onChange={(e) => updateField("productType", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="">Select type...</option>
                <option value="Truck">Truck (ទុក)</option>
                <option value="Excavator">Excavator (ឧស្កា)</option>
                <option value="Tractor">Tractor (ត្រាក)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => updateField("dimensions", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 250x240x40mm, 500x600, or 1020x430x100"
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional product information..."
                rows={2}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Product Image</div>

          {!displayImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={saving}
              />
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Click to upload a product image</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
            </div>
          ) : (
            <div className="relative border border-gray-300 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={displayImage}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedImage?.name || "Current image"}
                  </p>
                  {selectedImage && (
                    <p className="text-xs text-gray-500">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {existingImageUrl && !selectedImage ? "Replace" : "Change"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={saving}
              />
            </div>
          )}
        </div>

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