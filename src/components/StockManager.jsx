// src/components/StockManager.jsx
import React, { useEffect, useState } from 'react';
import radiatorService from '../api/radiatorService';
import { useAuth } from '../contexts/AuthContext';
import StockUpdateModal from './StockUpdateModal';

const StockManager = () => {
  const { user } = useAuth();
  const [radiators, setRadiators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStock, setShowStock] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result = await radiatorService.getAll();
    if (result.success) {
      setRadiators(result.data);
      setError('');
    } else {
      setError(result.error || 'Failed to load stock');
    }
    setLoading(false);
  };

  const tryClearStock = async (radiator) => {
    if (!window.confirm('Clear all stock for this radiator?')) return;

    // Prefer an explicit clear endpoint if your service has it:
    if (typeof radiatorService.clearStock === 'function') {
      const res = await radiatorService.clearStock(radiator.id);
      if (!res.success) return alert('Failed: ' + res.error);
      await fetchData();
      return;
    }

    // Fallback: set all warehouses to 0 using updateStock
    const zeroed = Object.keys(radiator.stock || {}).reduce((acc, k) => {
      acc[k] = 0;
      return acc;
    }, {});
    if (typeof radiatorService.updateStock === 'function') {
      const res = await radiatorService.updateStock(radiator.id, zeroed);
      if (!res.success) return alert('Failed: ' + res.error);
      await fetchData();
    } else {
      alert('No stock API available (updateStock/clearStock missing).');
    }
  };

  const openEditStock = (r) => {
    setSelected(r);
    setShowStock(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading stock…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Stock</h2>
        <p className="text-sm text-gray-500">Edit or clear per radiator</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {radiators.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No items</div>
      ) : (
        <div className="bg-white shadow sm:rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {radiators.map((r) => (
              <li key={r.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">{r.name}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Brand:</span> {r.brand} |{' '}
                      <span className="font-medium">Code:</span> {r.code}
                    </p>
                    <div className="mt-1 text-sm text-gray-600">
                      <strong>Stock:</strong>
                      {Object.entries(r.stock || {}).map(([w, q]) => (
                        <span key={w} className="ml-2">
                          {w}: <span className="font-medium">{q}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      onClick={() => openEditStock(r)}
                    >
                      Edit
                    </button>
                    {user?.role === 'Admin' && (
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        onClick={() => tryClearStock(r)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit stock modal */}
      <StockUpdateModal
        isOpen={showStock}
        onClose={() => setShowStock(false)}
        onSuccess={fetchData}
        radiator={selected}
      />
    </div>
  );
};

export default StockManager;
