// src/components/sales/modals/CreateSaleModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Search, Trash2, DollarSign, Package } from "lucide-react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import { LoadingSpinner } from "../../common/ui/LoadingSpinner";
import customerService from "../../../api/customerService";
import radiatorService from "../../../api/radiatorService";
import stockService from "../../../api/stockService";
import warehouseService from "../../../api/warehouseService";
import { PAYMENT_METHODS } from "../../../utils/constants";
import { formatCurrency } from "../../../utils/formatters";

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
          warehouseService.getAll(), // Added this!
        ]);

      console.log("📊 Customers result:", customersResult);
      console.log("📊 Radiators result:", radiatorsResult);
      console.log("📊 Warehouses result:", warehousesResult);

      if (customersResult.success) {
        console.log("✅ Setting customers:", customersResult.data.length);
        setCustomers(customersResult.data.filter((c) => c.isActive));
      }

      if (radiatorsResult.success) {
        console.log("✅ Setting radiators:", radiatorsResult.data.length);
        setRadiators(radiatorsResult.data);
      }

      if (warehousesResult.success) {
        console.log("✅ Setting warehouses:", warehousesResult.data.length);
        setWarehouses(warehousesResult.data);
      } else {
        console.error("❌ Failed to load warehouses:", warehousesResult.error);
        setError("Failed to load warehouses: " + warehousesResult.error);
      }
    } catch (err) {
      console.error("❌ Error in loadFormData:", err);
      setError("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

  // Filtered customers for search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10);

    return customers
      .filter((customer) => {
        const searchTerm = customerSearch.toLowerCase();
        return (
          customer.firstName?.toLowerCase().includes(searchTerm) ||
          customer.lastName?.toLowerCase().includes(searchTerm) ||
          customer.company?.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, 10);
  }, [customers, customerSearch]);

  // Filtered radiators for search
  const filteredRadiators = useMemo(() => {
    if (!productSearch.trim()) return radiators.slice(0, 10);

    return radiators
      .filter((radiator) => {
        const searchTerm = productSearch.toLowerCase();
        return (
          radiator.name?.toLowerCase().includes(searchTerm) ||
          radiator.code?.toLowerCase().includes(searchTerm) ||
          radiator.brand?.toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, 10);
  }, [radiators, productSearch]);

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(
      `${customer.firstName} ${customer.lastName} ${
        customer.company ? `- ${customer.company}` : ""
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
        // NEW:
        warehouseId: chosen?.id || "",
        warehouseCode: chosen?.code || "",
        availableStock: available,
      };

      setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setProductSearch("");
    setShowProductDropdown(false);
  };
  const handleItemWarehouseChange = (index, warehouseId) => {
    const w = warehouses.find((x) => String(x.id) === String(warehouseId));
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    const newWarehouseCode = w?.code || "";
    const newAvailable = newWarehouseCode
      ? getWarehouseStock(
          // find this radiator in the full list to read its stock map
          radiators.find((r) => r.id === item.radiatorId)?.stock,
          newWarehouseCode
        )
      : 0;

    // clamp quantity to available in the newly selected warehouse
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

  // Get total stock across all warehouses
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
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

  // Pick a default warehouse that actually has stock for this radiator
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
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Transform data to match backend DTO
      const transformedData = {
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

      console.log("📤 Sending sale data:", transformedData);

      const success = await onSubmit(transformedData);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error("❌ Error creating sale:", err);
      setError(err.message || "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Sale"
        size="xl"
      >
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" text="Loading form data..." />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sale" size="xl">
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name, company, or email..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {showCustomerDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {customerSearch
                    ? "No customers found"
                    : "Start typing to search customers"}
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.company && `${customer.company} • `}
                      {customer.email}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Product Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Products
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search radiators by name, code, or brand..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {showProductDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredRadiators.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {productSearch
                    ? "No products found"
                    : "Start typing to search products"}
                </div>
              ) : (
                filteredRadiators.map((radiator) => {
                  const totalStock = getTotalStock(radiator.stock);
                  return (
                    <button
                      key={radiator.id}
                      type="button"
                      onClick={() => handleAddProduct(radiator)}
                      disabled={totalStock === 0}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0 ${
                        totalStock === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {radiator.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {radiator.brand} - {radiator.code}
                          </div>
                          <div className="text-sm text-blue-600">
                            $
                            {radiator.retailPrice
                              ? radiator.retailPrice.toFixed(2)
                              : "0.00"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              totalStock === 0
                                ? "text-red-600"
                                : totalStock <= 5
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            Stock: {totalStock}
                          </div>
                          {totalStock === 0 && (
                            <div className="text-xs text-red-500">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sale Items</h4>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No items added yet</p>
              <p className="text-sm">
                Search for products above to add them to the sale
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.radiatorName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.brand} - {item.radiatorCode}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Quantity — blank by default */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Qty:</label>
                        <input
                          type="number"
                          value={item.quantity ?? ""}
                          placeholder="Qty"
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? ""
                                : parseInt(e.target.value, 10);
                            const updated = [...formData.items];
                            updated[index] = {
                              ...item,
                              quantity: value,
                              totalPrice:
                                value && item.unitPrice
                                  ? value * item.unitPrice
                                  : 0,
                            };
                            setFormData((prev) => ({
                              ...prev,
                              items: updated,
                            }));
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={item.unitPrice ?? ""}
                          placeholder="Price"
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value);
                            const updated = [...formData.items];
                            updated[index] = {
                              ...item,
                              unitPrice: value,
                              totalPrice:
                                item.quantity && value
                                  ? item.quantity * value
                                  : 0,
                            };
                            setFormData((prev) => ({
                              ...prev,
                              items: updated,
                            }));
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>

                      {/* Total */}
                      <div className="text-sm font-medium text-gray-900 min-w-[60px]">
                        {item.totalPrice
                          ? `$${item.totalPrice.toFixed(2)}`
                          : ""}
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Warehouse selector */}
                  <div className="mt-3 flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Warehouse:</label>
                    <select
                      value={item.warehouseId || ""}
                      onChange={(e) =>
                        handleItemWarehouseChange(index, e.target.value)
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || warehouses.length === 0}
                    >
                      <option value="" disabled>
                        Select warehouse
                      </option>
                      {warehouses.map((w) => {
                        const stockForW = getWarehouseStock(
                          radiators.find((r) => r.id === item.radiatorId)
                            ?.stock,
                          w.code
                        );
                        return (
                          <option
                            key={w.id}
                            value={w.id}
                            disabled={stockForW === 0}
                          >
                            {w.name || w.code}{" "}
                            {stockForW > 0
                              ? `• ${stockForW} in stock`
                              : "• Out"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional notes about this sale..."
            disabled={loading}
          />
        </div>

        {/* Sale Summary */}
        {formData.items.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Sale Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (15%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-blue-300 pt-2 mt-3">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={formData.items.length === 0 || !formData.customerId}
          >
            Create Sale (${calculateTotal().toFixed(2)})
          </Button>
        </div>
      </div>

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
