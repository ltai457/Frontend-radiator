// src/components/inventory/modals/AddRadiatorModal.jsx
import React, { useState, useRef } from "react";
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
  // NEW FIELDS ADDED
  productType: "",
  dimensions: "",
  notes: "",
};

const AddRadiatorModal = ({ isOpen, onClose, onSuccess, warehouses = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Initial stock for warehouses
  const [initialStock, setInitialStock] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStock = (warehouseCode, quantity) => {
    setInitialStock((prev) => ({
      ...prev,
      [warehouseCode]: Math.max(0, parseInt(quantity) || 0),
    }));
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
    const md = num(form.maxDiscountPercent);

    if (rp === null || isNaN(rp) || rp < 0) return "Retail price is required and must be ≥ 0.";
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
        retailPrice: num(form.retailPrice),
        tradePrice: num(form.tradePrice),
        costPrice: num(form.costPrice),
        isPriceOverridable: !!form.isPriceOverridable,
        maxDiscountPercent: num(form.maxDiscountPercent),
        stock: initialStock, // key used by service to map to InitialStock[…]
        
        // NEW FIELDS ADDED
        productType: form.productType.trim() || null,
        dimensions: form.dimensions.trim() || null,
        notes: form.notes.trim() || null,
      };

      // onSuccess is provided by parent and must return true/false
      const success = await onSuccess(payload, selectedImage);
      if (!success) throw new Error("Failed to create radiator");

      // Reset form
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview(null);
      setInitialStock({});
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError(e.message || "Failed to create radiator");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError("");
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview(null);
      setInitialStock({});
      if (fileInputRef.current) fileInputRef.current.value = "";
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

          {/* NEW FIELDS SECTION */}
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
              <option value="">Select Type</option>
              <option value="Vehicle">Vehicle (រថយន្ត)</option>
              <option value="Truck">Truck (ឡាន)</option>
              <option value="Machinery">Machinery (យន្តរឧបករណ៍)</option>
              <option value="Generator">Generator (ម៉ាស៊ីនភ្លើង)</option>
              <option value="Forklift">Forklift (រទេះអូស)</option>
              <option value="Harvester">Harvester (ម៉ាស៊ីនច្រូត)</option>
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
          {/* END NEW FIELDS SECTION */}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Product Image</div>

          {!imagePreview ? (
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
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedImage?.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={saving}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">Pricing</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retail Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.retailPrice}
                onChange={(e) => updateField("retailPrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trade Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.tradePrice}
                onChange={(e) => updateField("tradePrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => updateField("costPrice", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                disabled={saving}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPriceOverridable"
                checked={form.isPriceOverridable}
                onChange={(e) => updateField("isPriceOverridable", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={saving}
              />
              <label htmlFor="isPriceOverridable" className="text-sm text-gray-700">
                Allow price override during sales
              </label>
            </div>
          </div>

          {form.isPriceOverridable && (
            <div className="sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.maxDiscountPercent}
                onChange={(e) => updateField("maxDiscountPercent", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                disabled={saving}
              />
            </div>
          )}
        </div>

        {/* Initial Stock */}
        {warehouses.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Initial Stock</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {warehouse.name} ({warehouse.code})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialStock[warehouse.code] || ""}
                    onChange={(e) => updateStock(warehouse.code, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {saving ? "Creating..." : "Create Radiator"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddRadiatorModal;