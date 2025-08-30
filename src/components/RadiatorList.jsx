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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter radiators based on search term
  const filteredRadiators = radiators.filter(radiator => {
    const searchLower = searchTerm.toLowerCase();
    return (
      radiator.name.toLowerCase().includes(searchLower) ||
      radiator.brand.toLowerCase().includes(searchLower) ||
      radiator.code.toLowerCase().includes(searchLower) ||
      radiator.year.toString().includes(searchLower)
    );
  });

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

  // Clear search
  const clearSearch = () => setSearchTerm('');

  // Calculate total stock for a radiator across all warehouses
  const getTotalStock = (radiator) => {
    if (!radiator.stock) return 0;
    return Object.values(radiator.stock).reduce((sum, qty) => sum + qty, 0);
  };

  // Get stock status color
  const getStockStatusColor = (totalStock) => {
    if (totalStock === 0) return 'text-red-600 bg-red-50';
    if (totalStock <= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Get stock status text
  const getStockStatusText = (totalStock) => {
    if (totalStock === 0) return 'Out of Stock';
    if (totalStock <= 5) return 'Low Stock';
    return 'In Stock';
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Radiator Inventory</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your radiator products and view stock levels
          </p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 sm:mt-0" 
            onClick={() => setShowAdd(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Radiator
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, brand, code, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Results Counter */}
        {searchTerm && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="whitespace-nowrap">
              {filteredRadiators.length} of {radiators.length} radiators
            </span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {searchTerm ? 'Filtered' : 'Total'} Products
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {searchTerm ? filteredRadiators.length : radiators.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredRadiators.filter(r => getTotalStock(r) > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredRadiators.filter(r => {
                  const total = getTotalStock(r);
                  return total > 0 && total <= 5;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* No search results */}
      {searchTerm && filteredRadiators.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No radiators found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No radiators match your search for "{searchTerm}"
          </p>
          <div className="mt-4">
            <button
              onClick={clearSearch}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Radiators List */}
      {filteredRadiators.length === 0 && !searchTerm ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No radiators found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first radiator to the inventory.</p>
          {user?.role === 'Admin' && (
            <div className="mt-6">
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add New Radiator
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRadiators.map((radiator) => {
              const totalStock = getTotalStock(radiator);
              
              return (
                <li key={radiator.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{radiator.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>
                              <span className="font-medium">Brand:</span> {radiator.brand}
                            </span>
                            <span>
                              <span className="font-medium">Code:</span> {radiator.code}
                            </span>
                            <span>
                              <span className="font-medium">Year:</span> {radiator.year}
                            </span>
                          </div>
                          
                          {/* Stock Information */}
                          <div className="mt-2 flex items-center gap-4">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(totalStock)}`}>
                              {getStockStatusText(totalStock)}
                            </div>
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Total Stock:</span> {totalStock} units
                            </span>
                          </div>

                          {/* Warehouse Stock Breakdown */}
                          {radiator.stock && Object.keys(radiator.stock).length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Stock by warehouse:</span>
                              {Object.entries(radiator.stock).map(([warehouse, qty], index) => (
                                <span key={warehouse}>
                                  {index > 0 && ' • '}
                                  <span className="ml-1">
                                    {warehouse}: <span className="font-medium">{qty}</span>
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
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
              );
            })}
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