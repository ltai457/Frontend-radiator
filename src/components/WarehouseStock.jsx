import React, { useEffect, useMemo, useState } from 'react';
import warehouseService from '../api/warehouseService';
import radiatorService from '../api/radiatorService';
import { useAuth } from '../contexts/AuthContext';
import StockUpdateModal from './StockUpdateModal';

const WarehouseStock = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [radiators, setRadiators] = useState([]);
  const [selectedWh, setSelectedWh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showStock, setShowStock] = useState(false);
  const [selectedRad, setSelectedRad] = useState(null);
  
  // Filter and search states
  const [stockFilter, setStockFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [whRes, radRes] = await Promise.all([
        warehouseService.getAll(),
        radiatorService.getAll(),
      ]);
      if (!whRes.success) {
        setErr(whRes.error || 'Failed to load warehouses');
        setLoading(false);
        return;
      }
      if (!radRes.success) {
        setErr(radRes.error || 'Failed to load products');
        setLoading(false);
        return;
      }
      setWarehouses(whRes.data);
      setRadiators(radRes.data);
      setSelectedWh(whRes.data?.[0] || null);
      setErr('');
      setLoading(false);
    };
    load();
  }, []);

  // Enhanced filtering and sorting logic
  const filteredAndSortedItems = useMemo(() => {
    if (!selectedWh || !radiators.length) return [];
    
    const code = selectedWh.code;
    
    let items = radiators.map(r => {
      const qty = r?.stock?.[code] ?? 0;
      return { ...r, qty };
    });

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      items = items.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.brand.toLowerCase().includes(searchLower) ||
        r.code.toLowerCase().includes(searchLower) ||
        r.year.toString().includes(searchLower)
      );
    }

    // Apply stock filter
    switch (stockFilter) {
      case 'in-stock':
        items = items.filter(r => r.qty > lowStockThreshold);
        break;
      case 'low-stock':
        items = items.filter(r => r.qty > 0 && r.qty <= lowStockThreshold);
        break;
      case 'out-of-stock':
        items = items.filter(r => r.qty === 0);
        break;
      case 'available':
        items = items.filter(r => r.qty > 0);
        break;
      case 'all':
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'brand':
        items = items.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'stock-asc':
        items = items.sort((a, b) => a.qty - b.qty);
        break;
      case 'stock-desc':
        items = items.sort((a, b) => b.qty - a.qty);
        break;
      case 'name':
      default:
        items = items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return items;
  }, [radiators, selectedWh, stockFilter, searchTerm, sortBy, lowStockThreshold]);

  // Statistics for the selected warehouse
  const warehouseStats = useMemo(() => {
    if (!selectedWh || !radiators.length) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
    
    const code = selectedWh.code;
    const stats = radiators.reduce((acc, r) => {
      const qty = r?.stock?.[code] ?? 0;
      acc.total++;
      if (qty === 0) acc.outOfStock++;
      else if (qty <= lowStockThreshold) acc.lowStock++;
      else acc.inStock++;
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
    
    return stats;
  }, [radiators, selectedWh, lowStockThreshold]);

  const openEdit = (r) => {
    setSelectedRad(r);
    setShowStock(true);
  };

  const clearQtyForWarehouse = async (r) => {
    if (!selectedWh) return;
    if (!window.confirm(`Set ${r.name} quantity to 0 in ${selectedWh.name}?`)) return;

    const code = selectedWh.code;
    const payload = { [code]: 0 };

    if (typeof radiatorService.updateStock === 'function') {
      const res = await radiatorService.updateStock(r.id, payload);
      if (!res.success) {
        alert('Failed: ' + res.error);
        return;
      }
      setRadiators(prev =>
        prev.map(x => (x.id === r.id ? { ...x, stock: { ...(x.stock || {}), [code]: 0 } } : x))
      );
    } else {
      alert('radiatorService.updateStock is not implemented');
    }
  };

  const refreshAfterModal = async () => {
    const radRes = await radiatorService.getAll();
    if (radRes.success) setRadiators(radRes.data);
  };

  const getStockStatusColor = (qty) => {
    if (qty === 0) return 'text-red-600 bg-red-50';
    if (qty <= lowStockThreshold) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const quickStockUpdate = async (radiator, newQty) => {
    if (!selectedWh) return;
    
    const code = selectedWh.code;
    const payload = { [code]: newQty };

    const res = await radiatorService.updateStock(radiator.id, payload);
    if (res.success) {
      setRadiators(prev =>
        prev.map(x => (x.id === radiator.id ? { ...x, stock: { ...(x.stock || {}), [code]: newQty } } : x))
      );
    } else {
      alert('Failed to update stock: ' + res.error);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStockFilter('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading warehouses & stock…</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {err}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Warehouses list */}
      <div className="md:col-span-3">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Warehouses</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {warehouses.map(wh => {
              const active = selectedWh?.id === wh.id;
              return (
                <li key={wh.id}>
                  <button
                    onClick={() => setSelectedWh(wh)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      active ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{wh.name}</div>
                        <div className="text-xs text-gray-500">Code: {wh.code}</div>
                      </div>
                      {active && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Warehouse Stats */}
        {selectedWh && (
          <div className="bg-white rounded-lg shadow mt-4">
            <div className="px-4 py-3 border-b">
              <h4 className="text-md font-semibold text-gray-900">Stock Overview</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">{warehouseStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">In Stock:</span>
                <span className="font-medium">{warehouseStats.inStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Low Stock:</span>
                <span className="font-medium">{warehouseStats.lowStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Out of Stock:</span>
                <span className="font-medium">{warehouseStats.outOfStock}</span>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-500 mb-2">Quick Filters:</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setStockFilter('in-stock')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    stockFilter === 'in-stock' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  In Stock ({warehouseStats.inStock})
                </button>
                <button
                  onClick={() => setStockFilter('low-stock')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    stockFilter === 'low-stock' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Low ({warehouseStats.lowStock})
                </button>
                <button
                  onClick={() => setStockFilter('out-of-stock')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    stockFilter === 'out-of-stock' 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Out ({warehouseStats.outOfStock})
                </button>
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    stockFilter === 'all' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All ({warehouseStats.total})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products list with filters */}
      <div className="md:col-span-9">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedWh ? `${selectedWh.name} — Stock Management` : 'Select a warehouse'}
              </h3>
              {selectedWh && (
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-sm text-gray-500">
                    Showing {filteredAndSortedItems.length} of {warehouseStats.total} products
                  </div>
                  <button
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Filters
                  </button>
                </div>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {selectedWh && showFiltersPanel && (
              <div className="bg-gray-50 -mx-4 px-4 py-3 mb-4 border-t border-b">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value) || 5)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Basic Filters */}
            {selectedWh && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products, brands, codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Products</option>
                    <option value="available">Available (Any Stock)</option>
                    <option value="in-stock">In Stock (Good Levels)</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="brand">Sort by Brand</option>
                    <option value="stock-asc">Stock: Low to High</option>
                    <option value="stock-desc">Stock: High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {!selectedWh ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Warehouse</h3>
              <p className="text-gray-500">Choose a warehouse from the left to manage its stock levels</p>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No products match "${searchTerm}" with the current filters`
                  : 'No products match the current filter settings'
                }
              </p>
              {(searchTerm || stockFilter !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedItems.map((r) => (
                <div key={r.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{r.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Brand: {r.brand} • Code: {r.code} • Year: {r.year}
                          </div>
                          
                          {/* Stock status badge and quantity */}
                          <div className="flex items-center mt-2 space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(r.qty)}`}>
                              {getStockStatusText(r.qty)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              Qty: {r.qty}
                            </span>
                          </div>
                        </div>

                        {/* Quick stock actions for out of stock items */}
                        {r.qty === 0 && (
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs text-gray-500">Quick add:</span>
                            <button
                              onClick={() => quickStockUpdate(r, 1)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              title="Add 1 unit"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => quickStockUpdate(r, 5)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              title="Add 5 units"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => quickStockUpdate(r, 10)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              title="Add 10 units"
                            >
                              +10
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => openEdit(r)}
                      >
                        Edit Stock
                      </button>
                      {user?.role === 'Admin' && r.qty > 0 && (
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          onClick={() => clearQtyForWarehouse(r)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock modal */}
      <StockUpdateModal
        isOpen={showStock}
        onClose={() => setShowStock(false)}
        onSuccess={refreshAfterModal}
        radiator={selectedRad}
      />
    </div>
  );
};

export default WarehouseStock;