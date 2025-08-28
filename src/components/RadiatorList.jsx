// src/components/RadiatorList.jsx
import React, { useState, useEffect } from 'react';
import radiatorService from '../api/radiatorService';
import { useAuth } from '../contexts/AuthContext';

import AddRadiatorModal from './AddRadiatorModal';
import EditRadiatorModal from './EditRadiatorModal';

const RadiatorList = () => {
  const [radiators, setRadiators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRadiators();
  }, []);

  const fetchRadiators = async () => {
    setLoading(true);
    const result = await radiatorService.getAll();
    if (result.success) {
      setRadiators(result.data);
      setError('');
    } else {
      setError(result.error || 'Failed to load radiators');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this radiator?')) return;
    const result = await radiatorService.delete(id);
    if (result.success) {
      setRadiators((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert('Failed to delete radiator: ' + result.error);
    }
  };

  const handleAddSuccess = (newItem) => setRadiators((p) => [newItem, ...p]);
  const handleEditSuccess = (updated) =>
    setRadiators((p) => p.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading radiators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Radiator Inventory</h2>
        {user?.role === 'Admin' && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            Add New Radiator
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {radiators.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No radiators found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {radiators.map((radiator) => (
              <li key={radiator.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">{radiator.name}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Brand:</span> {radiator.brand} |{' '}
                      <span className="font-medium">Code:</span> {radiator.code} |{' '}
                      <span className="font-medium">Year:</span> {radiator.year}
                    </p>
                  </div>

                  {/* Stock preview */}
                  

                  {/* Actions: View (stub), Edit radiator, Delete radiator */}
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => alert('View details - Coming soon!')}
                    >
                      View
                    </button>
                    {user?.role === 'Admin' && (
                      <>
                        <button
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          onClick={() => {
                            setSelected(radiator);
                            setShowEdit(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          onClick={() => handleDelete(radiator.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modals */}
      <AddRadiatorModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAddSuccess}
      />
      <EditRadiatorModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={handleEditSuccess}
        radiator={selected}
      />
    </div>
  );
};

export default RadiatorList;
