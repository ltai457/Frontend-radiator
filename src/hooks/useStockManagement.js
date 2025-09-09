import { useCallback, useEffect, useMemo, useState } from "react";
import stockService from "../api/stockService";
import warehouseService from "../api/warehouseService";

export function useStockManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [radiators, setRadiators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingStocks, setEditingStocks] = useState({});
  const [updating, setUpdating] = useState(false);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [wRes, rRes] = await Promise.all([
        warehouseService.getAll(),
        stockService.getAllRadiatorsWithStock(),
      ]);

      if (wRes?.success) setWarehouses(wRes.data || []);
      else setError(wRes?.error || "Failed to load warehouses");

      if (rRes?.success) setRadiators(rRes.data || []);
      else setError((prev) => prev || rRes?.error || "Failed to load radiators");
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  // auto-exit edit mode if user switches to "all"
  useEffect(() => {
    if (selectedWarehouse === "all" && editMode) {
      setEditMode(false);
      setEditingStocks({});
    }
  }, [selectedWarehouse, editMode]);

  const getTotalStock = useCallback((stock) => {
    if (selectedWarehouse === "all") {
      return Object.values(stock || {}).reduce((t, q) => t + (q || 0), 0);
    }
    return stock?.[selectedWarehouse] || 0;
  }, [selectedWarehouse]);

  const getStockStatus = useCallback((quantity) => {
    if (quantity === 0) return { status: "out", color: "text-red-600", bg: "bg-red-100", label: "Out of Stock" };
    if (quantity <= 5) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100", label: "Low Stock" };
    return { status: "good", color: "text-green-600", bg: "bg-green-100", label: "In Stock" };
  }, []);

  const filteredRadiators = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (radiators || []).filter((r) => {
      const matches =
        !term ||
        (r?.name || "").toLowerCase().includes(term) ||
        (r?.code || "").toLowerCase().includes(term) ||
        (r?.brand || "").toLowerCase().includes(term);
      if (!matches) return false;

      if (!filterLowStock) return true;

      if (selectedWarehouse === "all") {
        const vals = Object.values(r?.stock || {});
        const hasLow = vals.some((q) => q > 0 && q <= 5);
        const hasOut = vals.some((q) => q === 0);
        return hasLow || hasOut;
      } else {
        const s = r?.stock?.[selectedWarehouse] ?? 0;
        return s === 0 || (s > 0 && s <= 5);
      }
    });
  }, [radiators, searchTerm, filterLowStock, selectedWarehouse]);

  // edit mode actions
  const handleEditMode = useCallback(() => {
    if (selectedWarehouse === "all") {
      alert("Please select a specific warehouse to edit stock levels");
      return;
    }
    setEditMode(true);
    setEditingStocks({});
  }, [selectedWarehouse]);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setEditingStocks({});
  }, []);

  const handleStockChange = useCallback((radiatorId, newValue) => {
    const parsed = Math.max(0, parseInt(newValue, 10) || 0);
    setEditingStocks((prev) => ({ ...(prev || {}), [radiatorId]: parsed }));
  }, []);

  const getDisplayStock = useCallback((radiatorId, currentStock) => {
    return Object.prototype.hasOwnProperty.call(editingStocks || {}, radiatorId)
      ? (editingStocks || {})[radiatorId]
      : currentStock;
  }, [editingStocks]);

  const handleSaveChanges = useCallback(async () => {
    if (Object.keys(editingStocks || {}).length === 0) {
      setEditMode(false);
      return;
    }
    setUpdating(true);
    let ok = 0, fail = 0;
    try {
      for (const [radiatorId, newQty] of Object.entries(editingStocks || {})) {
        const res = await stockService.updateStock(radiatorId, selectedWarehouse, newQty);
        if (res?.success) {
          ok += 1;
          setRadiators((prev) =>
            (prev || []).map((r) =>
              r.id === radiatorId
                ? { ...r, stock: { ...(r.stock || {}), [selectedWarehouse]: newQty } }
                : r
            )
          );
        } else {
          fail += 1;
        }
      }
      if (fail) alert(`Updated ${ok} items. ${fail} failed.`);
      else alert(`Successfully updated ${ok} items!`);
      setEditMode(false);
      setEditingStocks({});
    } finally {
      setUpdating(false);
    }
  }, [editingStocks, selectedWarehouse]);

  return {
    // data
    warehouses, radiators, loading, error,
    // ui state
    selectedWarehouse, searchTerm, filterLowStock, editMode, editingStocks, updating,
    // setters
    setSelectedWarehouse, setSearchTerm, setFilterLowStock,
    // derived & helpers
    filteredRadiators, getTotalStock, getStockStatus, getDisplayStock,
    // actions
    handleEditMode, handleCancelEdit, handleStockChange, handleSaveChanges,
  };
}
