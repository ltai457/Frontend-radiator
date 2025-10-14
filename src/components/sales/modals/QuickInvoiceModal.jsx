// src/components/sales/modals/QuickInvoiceModal.jsx
import { useState, useEffect } from "react";
import { Receipt, Search, Plus, Trash2, User, Phone, Mail } from "lucide-react";
import { Modal } from "../../common/ui/Modal";
import { Button } from "../../common/ui/Button";
import { LoadingSpinner } from "../../common/ui/LoadingSpinner";
import radiatorService from "../../../api/radiatorService";
import stockService from "../../../api/stockService";
import warehouseService from "../../../api/warehouseService";
import salesService from "../../../api/salesService";
import { formatCurrency } from "../../../utils/formatters";
import { toast } from "../../../utils/toast";

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Cheque"];

const QuickInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  // Customer details state
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Sale items state
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  // Data states
  const [radiators, setRadiators] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockLevels, setStockLevels] = useState({});

  // UI states
  const [loading, setLoading] = useState({
    radiators: false,
    warehouses: false,
    submitting: false,
  });
  const [error, setError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadRadiators();
      loadWarehouses();
    }
  }, [isOpen]);

  const loadRadiators = async () => {
    try {
      setLoading((prev) => ({ ...prev, radiators: true }));
      const response = await radiatorService.getAll();
      setRadiators(response.data || []);
    } catch (err) {
      console.error("Error loading radiators:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading((prev) => ({ ...prev, radiators: false }));
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoading((prev) => ({ ...prev, warehouses: true }));
      const response = await warehouseService.getAll();
      setWarehouses(response.data || []);
    } catch (err) {
      console.error("Error loading warehouses:", err);
      toast.error("Failed to load warehouses");
    } finally {
      setLoading((prev) => ({ ...prev, warehouses: false }));
    }
  };

  const loadStockForRadiator = async (radiatorId) => {
    try {
      const response = await stockService.getByRadiator(radiatorId);
      const stockData = response.data || [];
      setStockLevels((prev) => ({
        ...prev,
        [radiatorId]: stockData,
      }));
    } catch (err) {
      console.error("Error loading stock:", err);
    }
  };

  const handleAddProduct = async (radiator) => {
    const existingItem = items.find((item) => item.radiatorId === radiator.id);
    
    if (existingItem) {
      toast.info("Product already added. Adjust quantity below.");
      setShowProductDropdown(false);
      return;
    }

    // Load stock if not already loaded
    if (!stockLevels[radiator.id]) {
      await loadStockForRadiator(radiator.id);
    }

    const newItem = {
      id: Date.now(),
      radiatorId: radiator.id,
      radiator: radiator,
      warehouseId: "",
      quantity: 1,
      unitPrice: radiator.unitPrice || 0,
    };

    setItems([...items, newItem]);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleAddCustomItem = () => {
    const customItem = {
      id: Date.now(),
      radiatorId: null, // No radiator for custom items
      radiator: {
        brand: "Service",
        code: "CUSTOM",
        name: "Custom Item",
      },
      warehouseId: null, // No warehouse for custom items
      quantity: 1,
      unitPrice: 0,
      isCustom: true, // Flag to identify custom items
      customDescription: "Custom Service", // Editable description
    };

    setItems([...items, customItem]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleUpdateCustomDescription = (itemId, description) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, customDescription: description } : item
      )
    );
  };

  const handleUpdateItem = (itemId, field, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const getAvailableStock = (radiatorId, warehouseId) => {
    if (!radiatorId || !warehouseId) return 0;
    const stock = stockLevels[radiatorId];
    if (!stock) return 0;
    const warehouseStock = stock.find((s) => s.warehouseId === warehouseId);
    return warehouseStock?.quantity || 0;
  };

  const calculateSubTotal = () => {
    return items.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0
    );
  };

  const calculateTotal = () => {
    const subTotal = calculateSubTotal();
    const tax = subTotal * 0.15; // 15% GST
    return subTotal + tax;
  };

  const filteredRadiators = radiators.filter((rad) =>
    `${rad.brand} ${rad.code} ${rad.name}`
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  const validateForm = () => {
    // Validate customer info
    if (!customerInfo.firstName.trim() || !customerInfo.lastName.trim()) {
      setError("Please enter customer's first and last name");
      return false;
    }

    // Validate items
    if (items.length === 0) {
      setError("Please add at least one product or service");
      return false;
    }

    // Validate each item
    for (const item of items) {
      // Custom items have different validation
      if (item.isCustom) {
        if (!item.customDescription || item.customDescription.trim() === "") {
          setError("Please enter a description for custom service items");
          return false;
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          setError(`Please set a price for: ${item.customDescription}`);
          return false;
        }
        if (!item.quantity || item.quantity <= 0) {
          setError(`Please enter a valid quantity for: ${item.customDescription}`);
          return false;
        }
      } else {
        // Regular products need warehouse and stock validation
        if (!item.warehouseId) {
          setError("Please select a warehouse for all products");
          return false;
        }
        if (!item.quantity || item.quantity <= 0) {
          setError("Please enter valid quantities for all products");
          return false;
        }

        const available = getAvailableStock(item.radiatorId, item.warehouseId);
        if (item.quantity > available) {
          setError(
            `Insufficient stock for ${item.radiator.name}. Available: ${available}`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      // Prepare customer data for invoice
      const customerDto = {
        fullName: `${customerInfo.firstName.trim()} ${customerInfo.lastName.trim()}`,
        email: customerInfo.email.trim() || null,
        phone: customerInfo.phone.trim() || null,
      };

      // Prepare invoice items - handle both regular products and custom services
      const invoiceItems = items.map((item) => {
        if (item.isCustom) {
          // Custom service item - no radiatorId, no warehouseId
          return {
            radiatorId: null,
            warehouseId: null,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            description: item.customDescription.trim(),
          };
        } else {
          // Regular product from inventory
          return {
            radiatorId: item.radiatorId,
            warehouseId: item.warehouseId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            description: null,
          };
        }
      });

      // Create invoice using the invoice endpoint
      const invoiceData = {
        customer: customerDto,
        items: invoiceItems,
        paymentMethod: paymentMethod,
        notes: notes || `Quick invoice for ${customerDto.fullName}`,
        taxRate: 0.15, // 15% GST
      };

      console.log("Creating invoice:", invoiceData);
      const response = await salesService.createInvoice(invoiceData);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create invoice");
      }

      toast.success("Invoice created successfully!");

      // Show receipt or pass data to parent
      if (onSuccess) {
        await onSuccess(response.data);
      }

      // Reset form and close
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err.message || "Failed to create invoice");
      toast.error("Failed to create invoice");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const resetForm = () => {
    setCustomerInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setItems([]);
    setPaymentMethod("Cash");
    setNotes("");
    setError("");
    setProductSearch("");
  };

  const handleClose = () => {
    if (!loading.submitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-blue-600" />
          <span>Quick Invoice - One-Off Customer</span>
        </div>
      }
      size="xl"
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={customerInfo.firstName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                }
                placeholder="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={customerInfo.lastName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                }
                placeholder="Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                placeholder="+64 21 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.submitting}
              />
            </div>
          </div>
        </div>

        {/* Product Search */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Add Products *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomItem}
              className="flex items-center gap-1 text-xs"
              disabled={loading.submitting}
            >
              <Plus className="w-3 h-3" />
              Add Custom Service
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by brand, code, or name..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.submitting || loading.radiators}
            />
          </div>

          {showProductDropdown && productSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {loading.radiators ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filteredRadiators.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No products found
                </div>
              ) : (
                filteredRadiators.map((rad) => (
                  <button
                    key={rad.id}
                    onClick={() => handleAddProduct(rad)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b last:border-0 transition-colors"
                  >
                    <div className="font-medium text-sm">
                      {rad.brand} - {rad.code}
                    </div>
                    <div className="text-xs text-gray-600">{rad.name}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {formatCurrency(rad.unitPrice)}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Items */}
        {items.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="text-sm font-semibold text-gray-900">
                Invoice Items ({items.length})
              </h4>
            </div>
            <div className="divide-y">
              {items.map((item) => {
                const available = getAvailableStock(
                  item.radiatorId,
                  item.warehouseId
                );
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {item.isCustom ? (
                          <>
                            <input
                              type="text"
                              value={item.customDescription}
                              onChange={(e) =>
                                handleUpdateCustomDescription(item.id, e.target.value)
                              }
                              placeholder="Enter service description (e.g., Toyota Camry radiator repair)"
                              className="w-full font-medium text-sm bg-yellow-50 border border-yellow-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={loading.submitting}
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Custom Service
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-sm">
                              {item.radiator.brand} - {item.radiator.code}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.radiator.name}
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        disabled={loading.submitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {!item.isCustom && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Warehouse *
                          </label>
                          <select
                            value={item.warehouseId}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "warehouseId", e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            disabled={loading.submitting}
                          >
                            <option value="">Select...</option>
                            {warehouses.map((wh) => (
                              <option key={wh.id} value={wh.id}>
                                {wh.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          disabled={loading.submitting}
                        />
                        {!item.isCustom && item.warehouseId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {available}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          disabled={loading.submitting}
                        />
                      </div>
                    </div>

                    <div className="text-right text-sm font-semibold">
                      Total: {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment & Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading.submitting}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading.submitting}
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(calculateSubTotal())}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax (15% GST):</span>
              <span className="font-medium">
                {formatCurrency(calculateSubTotal() * 0.15)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-blue-300 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading.submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading.submitting}
            disabled={
              loading.submitting ||
              items.length === 0 ||
              !customerInfo.firstName ||
              !customerInfo.lastName
            }
          >
            {loading.submitting
              ? "Creating Invoice..."
              : `Generate Invoice (${formatCurrency(calculateTotal())})`}
          </Button>
        </div>
      </div>

      {/* Dropdown backdrop */}
      {showProductDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowProductDropdown(false)}
        />
      )}
    </Modal>
  );
};

export default QuickInvoiceModal;
