// src/components/sales/modals/CreateSaleModal.jsx
// REPLACE YOUR ENTIRE FILE WITH THIS
import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Search, Trash2, DollarSign, Package } from "lucide-react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import { LoadingSpinner } from "../../common/ui/LoadingSpinner";
import customerService from "../../../api/customerService";
import stockService from "../../../api/stockService";
import warehouseService from "../../../api/warehouseService";
import { formatCurrency } from "../../../utils/formatters";

// Payment methods
const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "EFTPOS"];

const CreateSaleModal = ({ isOpen, onClose, onSubmit }) => {
  // Form data state
  const [formData, setFormData] = useState({
    customerId: "",
    items: [],
    paymentMethod: "Cash",
    notes: "",
  });

  // Data loading states
  const [customers, setCustomers] = useState([]);
  const [radiators, setRadiators] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    setLoadingData(true);
    try {
      console.log("🔄 Loading form data for CreateSaleModal...");

      const [customersResult, radiatorsResult, warehousesResult] =
        await Promise.all([
          customerService.getAll(),
          stockService.getAllRadiatorsWithStock(),
          warehouseService.getAll(),
        ]);

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      }
      if (radiatorsResult.success) {
        setRadiators(radiatorsResult.data || []);
      }
      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data || []);
      }

      console.log("✅ Form data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading form data:", error);
      setError("Failed to load form data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const searchLower = customerSearch.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.firstName?.toLowerCase().includes(searchLower) ||
        customer.lastName?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.company?.toLowerCase().includes(searchLower)
    );
  }, [customers, customerSearch]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch) return radiators;
    const searchLower = productSearch.toLowerCase();
    return radiators.filter(
      (radiator) =>
        radiator.name?.toLowerCase().includes(searchLower) ||
        radiator.code?.toLowerCase().includes(searchLower) ||
        radiator.brand?.toLowerCase().includes(searchLower)
    );
  }, [radiators, productSearch]);

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(
      `${customer.firstName} ${customer.lastName}${
        customer.company ? ` - ${customer.company}` : ""
      }`
    );
    setShowCustomerDropdown(false);
  };

  // Handle adding product to sale
  const handleAddProduct = (radiator) => {
    const existingItemIndex = formData.items.findIndex(
      (item) => item.radiatorId === radiator.id
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].quantity *
        updatedItems[existingItemIndex].unitPrice;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    } else {
      const chosen = getDefaultWarehouseForRadiator(radiator.stock, warehouses);
      const available = chosen
        ? getWarehouseStock(radiator.stock, chosen.code)
        : 0;

      const newItem = {
        radiatorId: radiator.id,
        radiatorName: radiator.name,
        radiatorCode: radiator.code,
        brand: radiator.brand,
        quantity: 1,
        unitPrice: radiator.retailPrice || 0,
        totalPrice: radiator.retailPrice || 0,
        warehouseId: chosen?.id || "",
        warehouseCode: chosen?.code || "",
        availableStock: available,
      };

      setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setProductSearch("");
    setShowProductDropdown(false);
  };

  // Handle warehouse change for an item
  const handleItemWarehouseChange = (index, warehouseId) => {
    const w = warehouses.find((x) => String(x.id) === String(warehouseId));
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    const newWarehouseCode = w?.code || "";
    const newAvailable = newWarehouseCode
      ? getWarehouseStock(
          radiators.find((r) => r.id === item.radiatorId)?.stock,
          newWarehouseCode
        )
      : 0;

    const clampedQty = Math.max(1, Math.min(item.quantity, newAvailable));

    updatedItems[index] = {
      ...item,
      warehouseId,
      warehouseCode: newWarehouseCode,
      availableStock: newAvailable,
      quantity: clampedQty,
      totalPrice: clampedQty * item.unitPrice,
    };

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Handle item quantity change
  const handleItemQuantityChange = (index, quantity) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];
    const newQuantity = Math.max(1, Math.min(quantity, item.availableStock));

    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      totalPrice: newQuantity * item.unitPrice,
    };

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Handle item price change
  const handleItemPriceChange = (index, unitPrice) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];
    const newPrice = Math.max(0, unitPrice);

    updatedItems[index] = {
      ...item,
      unitPrice: newPrice,
      totalPrice: item.quantity * newPrice,
    };

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Remove item from sale
  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getWarehouseStock = (stockObj, warehouseCode) => {
    if (!stockObj) return 0;
    return Number(stockObj[warehouseCode] || 0);
  };

  const getDefaultWarehouseForRadiator = (stockObj, warehouses) => {
    if (!stockObj || !warehouses?.length) return null;
    const w = warehouses.find((w) => getWarehouseStock(stockObj, w.code) > 0);
    return w ? { id: w.id, code: w.code } : null;
  };

  // Validate form
  const validateForm = () => {
    if (!formData.customerId) {
      setError("Please select a customer");
      return false;
    }

    if (formData.items.length === 0) {
      setError("Please add at least one item to the sale");
      return false;
    }

    for (const item of formData.items) {
      if (item.quantity > item.availableStock) {
        setError(
          `Not enough stock for ${item.radiatorName}. Available: ${item.availableStock}`
        );
        return false;
      }
      if (!item.warehouseId) {
        setError(`Please select a warehouse for ${item.radiatorName}`);
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    const saleData = {
      customerId: formData.customerId,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      items: formData.items.map((item) => ({
        radiatorId: item.radiatorId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    const success = await onSubmit(saleData);

    if (success) {
      handleClose();
    }

    setLoading(false);
  };

  // Reset and close modal
  const handleClose = () => {
    setFormData({
      customerId: "",
      items: [],
      paymentMethod: "Cash",
      notes: "",
    });
    setCustomerSearch("");
    setProductSearch("");
    setSelectedCustomer(null);
    setError("");
    onClose();
  };

  if (loadingData) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Sale">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading form data..." />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Sale" maxWidth="4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Search customer by name, email, or company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />

            {/* Customer Dropdown */}
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    {customer.company && (
                      <div className="text-sm text-gray-500">{customer.company}</div>
                    )}
                    {customer.email && (
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Products
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Search products by name, code, or brand..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />

            {/* Product Dropdown */}
            {showProductDropdown && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((radiator) => {
                  const totalStock = radiator.totalStock || 0;
                  return (
                    <button
                      key={radiator.id}
                      type="button"
                      onClick={() => handleAddProduct(radiator)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
                      disabled={totalStock === 0}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {radiator.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {radiator.brand} - {radiator.code}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(radiator.retailPrice)}
                          </div>
                          <div
                            className={`text-xs ${
                              totalStock === 0
                                ? "text-red-600"
                                : totalStock <= 5
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {totalStock} in stock
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Items List - IMPROVED VERSION */}
        {formData.items.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sale Items ({formData.items.length})
            </label>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  {/* Product Info Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.radiatorName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.brand} - {item.radiatorCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Warehouse Selector - PROMINENT */}
                  <div className="mb-3 bg-white border border-blue-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📦 Select Warehouse
                    </label>
                    <select
                      value={item.warehouseId || ""}
                      onChange={(e) =>
                        handleItemWarehouseChange(index, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      disabled={loading || warehouses.length === 0}
                    >
                      <option value="" disabled>
                        Choose warehouse location...
                      </option>
                      {warehouses.map((w) => {
                        const stockForW = getWarehouseStock(
                          radiators.find((r) => r.id === item.radiatorId)
                            ?.stock,
                          w.code
                        );
                        const isSelected =
                          String(item.warehouseId) === String(w.id);
                        return (
                          <option
                            key={w.id}
                            value={w.id}
                            disabled={stockForW === 0}
                          >
                            {w.name || w.code} -{" "}
                            {stockForW > 0
                              ? `${stockForW} in stock`
                              : "Out of stock"}
                            {isSelected ? " ✓" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {/* Stock Warning */}
                    {item.availableStock === 0 && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Out of stock at selected warehouse</span>
                      </p>
                    )}
                    {item.availableStock > 0 && item.availableStock <= 5 && (
                      <p className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>
                          Low stock: Only {item.availableStock} available
                        </span>
                      </p>
                    )}
                    {item.availableStock > 5 && (
                      <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <span>✓</span>
                        <span>{item.availableStock} units available</span>
                      </p>
                    )}
                  </div>

                  {/* Quantity and Price Controls */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemQuantityChange(
                            index,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || item.availableStock === 0}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Max: {item.availableStock}
                      </p>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemPriceChange(
                            index,
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>

                    {/* Total Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-gray-900 flex items-center h-[42px]">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment and Notes */}
        <div className="grid grid-cols-2 gap-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add any notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Order Summary */}
        {formData.items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (15%):</span>
                <span className="font-medium">
                  {formatCurrency(calculateTax())}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || formData.items.length === 0}>
            {loading ? "Creating Sale..." : `Create Sale (${formatCurrency(calculateTotal())})`}
          </Button>
        </div>
      </form>

      {/* Click outside handlers */}
      {showCustomerDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowCustomerDropdown(false)}
        />
      )}
      {showProductDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowProductDropdown(false)}
        />
      )}
    </Modal>
  );
};

export default CreateSaleModal;