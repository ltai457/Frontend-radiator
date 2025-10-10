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
import { formatCurrency } from "../../../utils/formatters";

// Fallback payment methods if constants file doesn't exist
const DEFAULT_PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Cheque"];

// Try to import payment methods, fallback to default if not available
let PAYMENT_METHODS;
try {
  const constants = require("../../../utils/constants");
  PAYMENT_METHODS = constants.PAYMENT_METHODS || DEFAULT_PAYMENT_METHODS;
} catch (error) {
  console.warn("Constants file not found, using default payment methods");
  PAYMENT_METHODS = DEFAULT_PAYMENT_METHODS;
}

const FastCreateSaleModal = ({ isOpen, onClose, onSubmit }) => {
  // Form data state
  const [formData, setFormData] = useState({
    customerId: "",
    items: [],
    paymentMethod: "Cash",
    notes: "",
  });

  // Data states - now loaded separately for better performance
  const [customers, setCustomers] = useState([]);
  const [radiators, setRadiators] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Loading states - separate for each data type
  const [loadingStates, setLoadingStates] = useState({
    customers: false,
    radiators: false,
    warehouses: false,
    submitting: false,
  });

  const [error, setError] = useState("");

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ✅ OPTIMIZED: Load data progressively when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset states
      setError("");
      setFormData({
        customerId: "",
        items: [],
        paymentMethod: "Cash",
        notes: "",
      });
      setCustomerSearch("");
      setProductSearch("");
      setSelectedCustomer(null);

      // Load data progressively - customers first (most important)
      loadCustomersFirst();
    }
  }, [isOpen]);

  // 🚀 FAST: Load customers immediately, others in background
  const loadCustomersFirst = async () => {
    try {
      console.log("🔄 Loading customers first...");
      setLoadingStates((prev) => ({ ...prev, customers: true }));

      const customersResult = await customerService.getAll();

      if (customersResult.success) {
        console.log("✅ Customers loaded:", customersResult.data.length);
        setCustomers(customersResult.data.filter((c) => c.isActive));
      } else {
        console.error("❌ Failed to load customers:", customersResult.error);
        setError("Failed to load customers: " + customersResult.error);
      }

      setLoadingStates((prev) => ({ ...prev, customers: false }));

      // Now load other data in background
      loadRemainingData();
    } catch (err) {
      console.error("❌ Error loading customers:", err);
      setError("Failed to load customers");
      setLoadingStates((prev) => ({ ...prev, customers: false }));
    }
  };

  // 🔄 BACKGROUND: Load other data after customers are ready
  const loadRemainingData = async () => {
    try {
      console.log("🔄 Loading remaining data in background...");

      // Load warehouses and radiators in parallel
      setLoadingStates((prev) => ({
        ...prev,
        warehouses: true,
        radiators: true,
      }));

      const [warehousesResult, radiatorsResult] = await Promise.all([
        warehouseService.getAll(),
        stockService.getAllRadiatorsWithStock(),
      ]);

      if (warehousesResult.success) {
        console.log("✅ Warehouses loaded:", warehousesResult.data.length);
        setWarehouses(warehousesResult.data);
      } else {
        console.error("❌ Failed to load warehouses:", warehousesResult.error);
      }

      if (radiatorsResult.success) {
        console.log("✅ Radiators loaded:", radiatorsResult.data.length);
        setRadiators(radiatorsResult.data);
      } else {
        console.error("❌ Failed to load radiators:", radiatorsResult.error);
      }

      setLoadingStates((prev) => ({
        ...prev,
        warehouses: false,
        radiators: false,
      }));
    } catch (err) {
      console.error("❌ Error loading remaining data:", err);
      setLoadingStates((prev) => ({
        ...prev,
        warehouses: false,
        radiators: false,
      }));
    }
  };

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

  // Helper functions
  const getWarehouseStock = (stock, warehouseCode) => {
    return stock?.[warehouseCode] || 0;
  };

  const getDefaultWarehouseForRadiator = (stock, warehouses) => {
    if (!stock || !warehouses.length) return null;

    // Find warehouse with highest stock
    let bestWarehouse = null;
    let maxStock = 0;

    warehouses.forEach((warehouse) => {
      const stockLevel = getWarehouseStock(stock, warehouse.code);
      if (stockLevel > maxStock) {
        maxStock = stockLevel;
        bestWarehouse = warehouse;
      }
    });

    return bestWarehouse;
  };

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

  // Handle adding product to sale with auto-pricing
// Add this enhanced debug section to your product dropdown
// Replace the entire filteredRadiators.map section with this version:

filteredRadiators.map((radiator) => {
  const totalStock = Object.values(radiator.stock || {}).reduce(
    (sum, qty) => sum + (qty || 0),
    0
  );

  // 🔍 ENHANCED DEBUG: Log the entire radiator object
  console.log("🔍 Full radiator object:", radiator);
  console.log("🔍 Object keys:", Object.keys(radiator));
  console.log("🔍 Pricing fields check:", {
    retailPrice: radiator.retailPrice,
    tradePrice: radiator.tradePrice,
    costPrice: radiator.costPrice,
    price: radiator.price,
    sellingPrice: radiator.sellingPrice,
    unitPrice: radiator.unitPrice,
    // Check with capital letters too (in case of API casing issues)
    RetailPrice: radiator.RetailPrice,
    TradePrice: radiator.TradePrice,
    CostPrice: radiator.CostPrice,
  });

  // Try to find ANY field that might contain pricing
  const allFields = Object.keys(radiator);
  const potentialPriceFields = allFields.filter(key => 
    key.toLowerCase().includes('price') || 
    key.toLowerCase().includes('cost') ||
    key.toLowerCase().includes('amount')
  );
  console.log("🔍 Potential price fields found:", potentialPriceFields);

  // Check the actual values and types
  potentialPriceFields.forEach(field => {
    const value = radiator[field];
    console.log(`🔍 ${field}:`, value, `(type: ${typeof value})`);
  });

  // 🔧 ENHANCED PRICE DETECTION with more fallbacks
  let debugPrice = 0;
  let priceSource = "none";
  
  // Try all possible field names and variations
  const priceChecks = [
    { field: 'retailPrice', value: radiator.retailPrice },
    { field: 'RetailPrice', value: radiator.RetailPrice },
    { field: 'tradePrice', value: radiator.tradePrice },
    { field: 'TradePrice', value: radiator.TradePrice },
    { field: 'costPrice', value: radiator.costPrice },
    { field: 'CostPrice', value: radiator.CostPrice },
    { field: 'price', value: radiator.price },
    { field: 'Price', value: radiator.Price },
    { field: 'sellingPrice', value: radiator.sellingPrice },
    { field: 'SellingPrice', value: radiator.SellingPrice },
    { field: 'unitPrice', value: radiator.unitPrice },
    { field: 'UnitPrice', value: radiator.UnitPrice },
  ];

  for (const check of priceChecks) {
    if (check.value != null && check.value !== '' && !isNaN(check.value) && parseFloat(check.value) > 0) {
      debugPrice = parseFloat(check.value);
      priceSource = check.field;
      console.log(`✅ Found price: ${debugPrice} from field: ${check.field}`);
      break;
    }
  }

  if (debugPrice === 0) {
    console.log("❌ No valid price found for radiator:", radiator.name);
  }

  return (
    <button
      key={radiator.id}
      type="button"
      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
      onClick={() => handleAddProduct(radiator)}
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

          {/* 🔍 SUPER DETAILED PRICING DEBUG */}
          <div className="flex flex-col gap-1 text-xs mt-1">
            {debugPrice > 0 ? (
              <span className="text-green-600 font-semibold">
                ✅ Auto-price: ${debugPrice.toFixed(2)} (from: {priceSource})
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                ❌ No price found
              </span>
            )}
            
            {/* Show all pricing fields that were found */}
            <div className="flex flex-wrap gap-1 text-xs">
              {potentialPriceFields.map(field => {
                const value = radiator[field];
                const isValid = value != null && value !== '' && !isNaN(value) && parseFloat(value) > 0;
                return (
                  <span 
                    key={field}
                    className={`px-1 py-0.5 rounded ${isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {field}:{value}
                  </span>
                );
              })}
            </div>
            
            {/* If no price fields found, show all fields for debugging */}
            {potentialPriceFields.length === 0 && (
              <div className="text-orange-600 text-xs">
                No price fields found. All fields: {Object.keys(radiator).join(', ')}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-right">
          <div
            className={
              totalStock > 0 ? "text-green-600" : "text-red-600"
            }
          >
            Stock: {totalStock}
          </div>
        </div>
      </div>
    </button>
  );
})

// Also update your handleAddProduct function to use the same enhanced logic:

const handleAddProduct = (radiator) => {
  console.log("🔍 Adding product:", radiator); // Debug log
  console.log("🔍 Full radiator object keys:", Object.keys(radiator));

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

    // 🔧 SUPER ENHANCED AUTO-PRICING with all possible field names
    console.log("💰 Enhanced pricing data check:", {
      allKeys: Object.keys(radiator),
      retailPrice: radiator.retailPrice,
      RetailPrice: radiator.RetailPrice,
      tradePrice: radiator.tradePrice,
      TradePrice: radiator.TradePrice,
      costPrice: radiator.costPrice,
      CostPrice: radiator.CostPrice,
      price: radiator.price,
      Price: radiator.Price,
      sellingPrice: radiator.sellingPrice,
      SellingPrice: radiator.SellingPrice,
      unitPrice: radiator.unitPrice,
      UnitPrice: radiator.UnitPrice,
    });

    // Try all possible pricing fields in order of preference
    let defaultPrice = 0;
    let priceSource = 'none';

    const priceChecks = [
      { field: 'retailPrice', value: radiator.retailPrice },
      { field: 'RetailPrice', value: radiator.RetailPrice },
      { field: 'tradePrice', value: radiator.tradePrice },
      { field: 'TradePrice', value: radiator.TradePrice },
      { field: 'costPrice', value: radiator.costPrice },
      { field: 'CostPrice', value: radiator.CostPrice },
      { field: 'price', value: radiator.price },
      { field: 'Price', value: radiator.Price },
      { field: 'sellingPrice', value: radiator.sellingPrice },
      { field: 'SellingPrice', value: radiator.SellingPrice },
      { field: 'unitPrice', value: radiator.unitPrice },
      { field: 'UnitPrice', value: radiator.UnitPrice },
    ];

    for (const check of priceChecks) {
      console.log(`🔍 Checking ${check.field}:`, check.value, `(type: ${typeof check.value})`);
      
      if (check.value != null && check.value !== '' && !isNaN(check.value)) {
        const parsedValue = parseFloat(check.value);
        if (parsedValue > 0) {
          defaultPrice = parsedValue;
          priceSource = check.field;
          console.log(`✅ Selected price: ${defaultPrice} from field: ${priceSource}`);
          break;
        }
      }
    }

    if (defaultPrice === 0) {
      console.log("❌ No valid price found, setting to 0");
      console.log("Available fields:", Object.keys(radiator));
      // Show all fields that might contain numbers
      Object.keys(radiator).forEach(key => {
        const value = radiator[key];
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
          console.log(`  ${key}: ${value} (${typeof value})`);
        }
      });
    }

    const newItem = {
      radiatorId: radiator.id,
      radiatorName: radiator.name,
      radiatorCode: radiator.code,
      brand: radiator.brand,
      quantity: 1,
      unitPrice: defaultPrice, // Will now work with enhanced detection
      originalPrice: defaultPrice,
      totalPrice: defaultPrice,
      warehouseId: chosen?.id || "",
      warehouseCode: chosen?.code || "",
      availableStock: available,
      isPriceEditable: radiator.isPriceOverridable !== false,
      maxDiscountPercent: radiator.maxDiscountPercent || 100,
      type: "product",
      // Add debug info to help track the issue
      _debug: {
        priceSource,
        originalRadiator: radiator
      }
    };

    console.log("📦 Created new item with enhanced pricing:", newItem);

    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  }

  setProductSearch("");
  setShowProductDropdown(false);
};

  // ✅ NEW: Add custom product/service for repairs
  const handleAddCustomItem = () => {
    const customItem = {
      radiatorId: `custom-${Date.now()}`, // Unique temporary ID
      radiatorName: "Custom Item", // Will be editable
      radiatorCode: "CUSTOM",
      brand: "Service",
      quantity: 1,
      unitPrice: 0, // User sets price
      originalPrice: 0,
      totalPrice: 0,
      warehouseId: "", // No warehouse for custom items
      warehouseCode: "",
      availableStock: 999, // No stock limit for services
      isPriceEditable: true, // Always editable
      maxDiscountPercent: 100,
      type: "custom", // ✅ CUSTOM ITEM FLAG
      isNameEditable: true, // ✅ ALLOW NAME EDITING
    };

    setFormData((prev) => ({ ...prev, items: [...prev.items, customItem] }));
  };

  // ✅ ENHANCED: Handle item price change with discount validation
  const handleItemPriceChange = (index, newPrice) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    // Validate discount limits for products (not custom items)
    if (item.type === "product" && item.originalPrice > 0) {
      const discountPercent =
        ((item.originalPrice - newPrice) / item.originalPrice) * 100;
      if (discountPercent > item.maxDiscountPercent) {
        const minAllowedPrice =
          item.originalPrice * (1 - item.maxDiscountPercent / 100);
        setError(
          `Maximum discount for ${item.radiatorName} is ${
            item.maxDiscountPercent
          }%. Minimum price: ${minAllowedPrice.toFixed(2)}`
        );
        return;
      }
    }

    const validPrice = Math.max(0, newPrice);
    updatedItems[index] = {
      ...item,
      unitPrice: validPrice,
      totalPrice: item.quantity * validPrice,
    };

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setError(""); // Clear any discount errors
  };

  // Add this function to handle warehouse changes for items
  const handleItemWarehouseChange = (index, warehouseId) => {
    const warehouse = warehouses.find(
      (w) => String(w.id) === String(warehouseId)
    );
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    const newWarehouseCode = warehouse?.code || "";
    const newAvailable = newWarehouseCode
      ? getWarehouseStock(
          // Find this radiator in the full list to read its stock map
          radiators.find((r) => r.id === item.radiatorId)?.stock,
          newWarehouseCode
        )
      : 0;

    // Clamp quantity to available in the newly selected warehouse
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

  // ✅ NEW: Handle custom item name change
  const handleItemNameChange = (index, newName) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      radiatorName: newName,
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // ✅ ENHANCED: Calculate discount information
  const calculateItemDiscount = (item) => {
    if (item.type === "custom" || item.originalPrice <= 0)
      return { percent: 0, amount: 0 };

    const discountAmount = item.originalPrice - item.unitPrice;
    const discountPercent = (discountAmount / item.originalPrice) * 100;

    return {
      percent: Math.max(0, discountPercent),
      amount: Math.max(0, discountAmount),
    };
  };

  // Calculate total
  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  };

  // ✅ FIXED: Form validation with proper custom item handling
  const validateForm = () => {
    if (!formData.customerId) {
      setError("Please select a customer");
      return false;
    }

    if (formData.items.length === 0) {
      setError("Please add at least one item");
      return false;
    }

    for (const item of formData.items) {
      if (!item.quantity || item.quantity <= 0) {
        setError(`Please enter a valid quantity for ${item.radiatorName}`);
        return false;
      }

      // ✅ FIXED: Custom items can have 0 price, but warn user
      if (item.type === "custom" && (!item.unitPrice || item.unitPrice <= 0)) {
        setError(`Please set a price for custom item: ${item.radiatorName}`);
        return false;
      }

      // ✅ FIXED: Product items need positive price and stock check
      if (item.type === "product") {
        if (!item.unitPrice || item.unitPrice <= 0) {
          setError(`Please enter a valid price for ${item.radiatorName}`);
          return false;
        }

        if (item.quantity > item.availableStock) {
          setError(
            `Not enough stock for ${item.radiatorName}. Available: ${item.availableStock}`
          );
          return false;
        }
      }

      // ✅ CUSTOM ITEMS: Check if we have valid radiator and warehouse for backend
      if (item.type === "custom") {
        if (!item.radiatorId || item.radiatorId.startsWith("custom-")) {
          setError(
            "Custom items need to be converted to valid products. Please contact support."
          );
          return false;
        }
      }
    }

    return true;
  };

  // ✅ FIXED: Handle form submission with custom service support
  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    setLoadingStates((prev) => ({ ...prev, submitting: true }));
    try {
      // ✅ BETTER APPROACH: Handle custom items by using a generic service radiator
      const processedItems = [];

      for (const item of formData.items) {
        if (item.type === "custom") {
          // ✅ For custom items, we need to find or use a service radiator
          // For now, inform user they need to create a service item in inventory
          setError(
            "Please create a 'Service' or 'Repair' radiator in your inventory first for custom items. Then use that radiator and edit the name/price in the sale."
          );
          return;
        } else if (item.type === "product") {
          // Regular product - validate and add
          if (
            !item.radiatorId ||
            !item.warehouseId ||
            item.quantity <= 0 ||
            item.unitPrice <= 0
          ) {
            setError(`Invalid data for item: ${item.radiatorName}`);
            return;
          }

          processedItems.push({
            radiatorId: item.radiatorId,
            warehouseId: item.warehouseId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
          });
        }
      }

      if (processedItems.length === 0) {
        setError(
          "No valid items to create sale. Please add products from inventory."
        );
        return;
      }

      const transformedData = {
        customerId: formData.customerId,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || null,
        items: processedItems,
      };

      console.log("📤 Sending processed sale data:", transformedData);
      console.log("🔍 Data validation:", {
        customerId: typeof transformedData.customerId,
        itemCount: transformedData.items.length,
        paymentMethod: transformedData.paymentMethod,
        sampleItem: transformedData.items[0],
      });

      const success = await onSubmit(transformedData);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error("❌ Error creating sale:", err);
      setError(err.message || "Failed to create sale");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Show loading state only if customers are still loading (most important)
  if (loadingStates.customers) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Sale"
        size="xl"
      >
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" text="Loading customers..." />
          <p className="text-sm text-gray-500 mt-2">
            Getting your customer list ready...
          </p>
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
              disabled={loadingStates.submitting}
            />
          </div>

          {showCustomerDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {customerSearch
                    ? `No customers found for "${customerSearch}"`
                    : "Start typing to search customers..."}
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    {customer.company && (
                      <div className="text-sm text-gray-500">
                        {customer.company}
                      </div>
                    )}
                    {customer.email && (
                      <div className="text-xs text-gray-400">
                        {customer.email}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Product Search */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Add Products
              {loadingStates.radiators && (
                <span className="text-blue-600 text-xs ml-2">
                  Loading products...
                </span>
              )}
            </label>
            {/* ✅ ADD CUSTOM ITEM BUTTON */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomItem}
              className="flex items-center gap-1 text-xs"
              disabled={loadingStates.submitting}
            >
              <Plus className="w-3 h-3" />
              Add Custom Item
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={
                loadingStates.radiators
                  ? "Loading products..."
                  : "Search radiators by name, code, or brand..."
              }
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingStates.submitting || loadingStates.radiators}
            />
          </div>

          {showProductDropdown && !loadingStates.radiators && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredRadiators.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {productSearch
                    ? `No products found for "${productSearch}"`
                    : "Start typing to search products..."}
                </div>
              ) : (
                filteredRadiators.map((radiator) => {
                  const totalStock = Object.values(radiator.stock || {}).reduce(
                    (sum, qty) => sum + (qty || 0),
                    0
                  );

                  // 🔍 DEBUG: Calculate what price would be selected
                  let debugPrice = 0;
                  let priceSource = "none";

                  if (
                    radiator.retailPrice &&
                    parseFloat(radiator.retailPrice) > 0
                  ) {
                    debugPrice = parseFloat(radiator.retailPrice);
                    priceSource = "retail";
                  } else if (
                    radiator.tradePrice &&
                    parseFloat(radiator.tradePrice) > 0
                  ) {
                    debugPrice = parseFloat(radiator.tradePrice);
                    priceSource = "trade";
                  } else if (radiator.price && parseFloat(radiator.price) > 0) {
                    debugPrice = parseFloat(radiator.price);
                    priceSource = "price";
                  } else if (
                    radiator.sellingPrice &&
                    parseFloat(radiator.sellingPrice) > 0
                  ) {
                    debugPrice = parseFloat(radiator.sellingPrice);
                    priceSource = "selling";
                  } else if (
                    radiator.unitPrice &&
                    parseFloat(radiator.unitPrice) > 0
                  ) {
                    debugPrice = parseFloat(radiator.unitPrice);
                    priceSource = "unit";
                  }

                  return (
                    <button
                      key={radiator.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => handleAddProduct(radiator)}
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

                          {/* 🔍 ENHANCED PRICING INFO WITH DEBUG */}
                          <div className="flex items-center gap-2 text-xs mt-1">
                            {debugPrice > 0 ? (
                              <span className="text-green-600 font-semibold">
                                Auto-price: ${debugPrice.toFixed(2)} (
                                {priceSource})
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                No price found
                              </span>
                            )}

                            {/* Show all available prices for debugging */}
                            <div className="flex gap-1 text-xs">
                              {radiator.retailPrice &&
                                parseFloat(radiator.retailPrice) > 0 && (
                                  <span className="text-blue-600">
                                    R:$
                                    {parseFloat(radiator.retailPrice).toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              {radiator.tradePrice &&
                                parseFloat(radiator.tradePrice) > 0 && (
                                  <span className="text-purple-600">
                                    T:$
                                    {parseFloat(radiator.tradePrice).toFixed(2)}
                                  </span>
                                )}
                              {radiator.price &&
                                parseFloat(radiator.price) > 0 && (
                                  <span className="text-orange-600">
                                    P:${parseFloat(radiator.price).toFixed(2)}
                                  </span>
                                )}
                            </div>

                            {radiator.maxDiscountPercent && (
                              <span className="text-orange-600">
                                Max discount: {radiator.maxDiscountPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-right">
                          <div
                            className={
                              totalStock > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            Stock: {totalStock}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sale Items ({formData.items.length})
          </label>
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
              {formData.items.map((item, index) => {
                const discount = calculateItemDiscount(item);

                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Product Name - Editable for custom items */}
                        {item.isNameEditable ? (
                          <input
                            type="text"
                            value={item.radiatorName}
                            onChange={(e) =>
                              handleItemNameChange(index, e.target.value)
                            }
                            className="font-medium text-gray-900 bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:outline-none"
                            placeholder="Enter item name (e.g., Radiator Repair Service)"
                          />
                        ) : (
                          <div className="font-medium text-gray-900">
                            {item.radiatorName}
                          </div>
                        )}

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>
                            {item.brand} - {item.radiatorCode}
                          </span>
                          {item.type === "custom" && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Custom Item
                            </span>
                          )}
                          {discount.percent > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                              {discount.percent.toFixed(1)}% discount
                            </span>
                          )}
                        </div>

                        {/* Show original price and discount info */}
                        {item.type === "product" && discount.amount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Original: ${item.originalPrice.toFixed(2)} • Saving:
                            ${discount.amount.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        {/* Quantity Input */}
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Qty:</label>
                          <input
                            type="number"
                            value={item.quantity || ""}
                            placeholder="0"
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
                            min="1"
                            max={
                              item.type === "custom" ? 999 : item.availableStock
                            }
                          />
                          {item.type === "product" && (
                            <span className="text-xs text-gray-500">
                              / {item.availableStock}
                            </span>
                          )}
                        </div>

                        {/* Price Input */}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div className="relative">
                            <input
                              type="number"
                              value={item.unitPrice || ""}
                              placeholder="0.00"
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value);
                                handleItemPriceChange(index, value);
                              }}
                              className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                !item.isPriceEditable
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : "border-gray-300"
                              }`}
                              step="0.01"
                              min="0"
                              disabled={!item.isPriceEditable}
                              title={
                                item.isPriceEditable
                                  ? `Original price: ${item.originalPrice.toFixed(
                                      2
                                    )}${
                                      item.maxDiscountPercent < 100
                                        ? `. Max discount: ${item.maxDiscountPercent}%`
                                        : ""
                                    }`
                                  : "Price cannot be modified for this item"
                              }
                            />
                            {!item.isPriceEditable && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                🔒
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="text-sm font-semibold text-gray-900 min-w-[60px] text-right">
                          ${(item.totalPrice || 0).toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = formData.items.filter(
                              (_, i) => i !== index
                            );
                            setFormData((prev) => ({
                              ...prev,
                              items: updated,
                            }));
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* ✅ ADD WAREHOUSE SELECTOR HERE - This was missing! */}
                    {item.type === "product" && (
                      <div className="mt-3 flex items-center space-x-2">
                        <label className="text-sm text-gray-600">
                          Warehouse:
                        </label>
                        <select
                          value={item.warehouseId || ""}
                          onChange={(e) =>
                            handleItemWarehouseChange(index, e.target.value)
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={
                            loadingStates.submitting || warehouses.length === 0
                          }
                        >
                          <option value="" disabled>
                            Select warehouse
                          </option>
                          {warehouses.map((warehouse) => {
                            const stockForWarehouse = getWarehouseStock(
                              radiators.find((r) => r.id === item.radiatorId)
                                ?.stock,
                              warehouse.code
                            );
                            return (
                              <option
                                key={warehouse.id}
                                value={warehouse.id}
                                disabled={stockForWarehouse === 0}
                              >
                                {warehouse.name || warehouse.code}{" "}
                                {stockForWarehouse > 0
                                  ? `(${stockForWarehouse} available)`
                                  : "(Out of stock)"}
                              </option>
                            );
                          })}
                        </select>

                        {/* Show current stock info */}
                        <span className="text-xs text-gray-500">
                          Stock: {item.availableStock || 0}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total Summary - Enhanced with discount info */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="space-y-2">
                  {/* Show total savings if any discounts applied */}
                  {formData.items.some(
                    (item) => calculateItemDiscount(item).amount > 0
                  ) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Total Savings:</span>
                      <span className="font-semibold text-green-600">
                        -$
                        {formData.items
                          .reduce(
                            (sum, item) =>
                              sum + calculateItemDiscount(item).amount,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
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
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any additional notes for this sale..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loadingStates.submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loadingStates.submitting}
            disabled={
              formData.items.length === 0 ||
              !formData.customerId ||
              loadingStates.submitting
            }
          >
            {loadingStates.submitting
              ? "Creating Sale..."
              : `Create Sale (${formatCurrency(calculateTotal())})`}
          </Button>
        </div>

        {/* Loading Status */}
        {(loadingStates.radiators || loadingStates.warehouses) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              {loadingStates.radiators &&
                loadingStates.warehouses &&
                "Loading products and warehouses..."}
              {loadingStates.radiators &&
                !loadingStates.warehouses &&
                "Loading products..."}
              {!loadingStates.radiators &&
                loadingStates.warehouses &&
                "Loading warehouses..."}
            </div>
          </div>
        )}

        {/* ✅ DEBUG PANEL - Remove in production */}
        
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

export default FastCreateSaleModal;
