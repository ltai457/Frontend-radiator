// src/components/WarehouseStock.jsx
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
      // preselect first warehouse
      setSelectedWh(whRes.data?.[0] || null);
      setErr('');
      setLoading(false);
    };
    load();
  }, []);

  const itemsForSelected = useMemo(() => {
    if (!selectedWh) return [];
    const code = selectedWh.code; // e.g., '156W'
    return (radiators || [])
      .map(r => ({ ...r, qty: r?.stock?.[code] ?? 0 }))
      .filter(r => r.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [radiators, selectedWh]);

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
      // update local state
      setRadiators(prev =>
        prev.map(x => (x.id === r.id ? { ...x, stock: { ...(x.stock || {}), [code]: 0 } } : x))
      );
    } else {
      alert('radiatorService.updateStock is not implemented');
    }
  };

  const refreshAfterModal = async () => {
    // After editing in the modal, reload the list for accuracy
    const radRes = await radiatorService.getAll();
    if (radRes.success) setRadiators(radRes.data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading warehouses & stock…</span>
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
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                      active ? 'bg-blue-50' : ''
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
      </div>

      {/* Products in selected warehouse */}
      <div className="md:col-span-9">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedWh ? `${selectedWh.name} — Products` : 'Select a warehouse'}
            </h3>
            {selectedWh && (
              <div className="text-sm text-gray-500">
                Showing items with quantity &gt; 0
              </div>
            )}
          </div>

          {!selectedWh ? (
            <div className="p-6 text-gray-500">Please choose a warehouse.</div>
          ) : itemsForSelected.length === 0 ? (
            <div className="p-6 text-gray-500">
              No products with stock in <span className="font-medium">{selectedWh.name}</span>.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {itemsForSelected.map((r) => (
                <li key={r.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-gray-900 font-medium">{r.name}</div>
                      <div className="text-sm text-gray-600">
                        Brand: {r.brand} • Code: {r.code} • Year: {r.year}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-gray-700">
                        Qty:&nbsp;<span className="font-semibold">{r.qty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>
                        {user?.role === 'Admin' && (
                          <button
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            onClick={() => clearQtyForWarehouse(r)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stock modal (reuses your existing component) */}
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
