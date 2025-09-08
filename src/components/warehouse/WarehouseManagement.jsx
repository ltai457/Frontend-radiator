// src/components/warehouse/WarehouseManagement.jsx
import React, { useState } from 'react';
import { Warehouse, Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWarehouses } from '../../hooks/useWarehouses';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/layout/EmptyState';
import { Button } from '../common/ui/Button';
import { useModal } from '../../hooks/useModal';
import CreateWarehouseModal from './modals/CreateWarehouseModal';
import EditWarehouseModal from './modals/EditWarehouseModal';
import ConfirmDeleteModal from '../common/modals/ConfirmDeleteModal';

const WarehouseManagement = () => {
  const { user } = useAuth();
  const { warehouses, loading, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === 'Admin' || user?.role?.includes?.('Admin');

  const handleCreateWarehouse = async (warehouseData) => {
    try {
      setActionLoading(true);
      const result = await createWarehouse(warehouseData);
      
      if (result.success) {
        createModal.closeModal();
        return true;
      } else {
        throw new Error(result.error || 'Failed to create warehouse');
      }
    } catch (error) {
      console.error('Create warehouse failed:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditWarehouse = async (warehouseData) => {
    try {
      setActionLoading(true);
      const result = await updateWarehouse(editModal.data.id, warehouseData);
      
      if (result.success) {
        editModal.closeModal();
        return true;
      } else {
        throw new Error(result.error || 'Failed to update warehouse');
      }
    } catch (error) {
      console.error('Update warehouse failed:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    try {
      setActionLoading(true);
      const result = await deleteWarehouse(deleteModal.data.id);
      
      if (result.success) {
        deleteModal.closeModal();
      } else {
        throw new Error(result.error || 'Failed to delete warehouse');
      }
    } catch (error) {
      console.error('Delete warehouse failed:', error);
      // You might want to show a toast notification here
      alert(`Failed to delete warehouse: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading warehouses..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warehouse Management</h2>
          <p className="text-sm text-gray-600">
            Manage your warehouse locations and distribution centers
          </p>
        </div>
        {isAdmin && (
          <Button onClick={createModal.openModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        )}
      </div>

      {/* Warehouses List */}
      {warehouses.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No Warehouses Found"
          description="Get started by creating your first warehouse location"
          action={isAdmin}
          actionLabel="Create Warehouse"
          onAction={createModal.openModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              isAdmin={isAdmin}
              onEdit={(warehouse) => editModal.openModal(warehouse)}
              onDelete={(warehouse) => deleteModal.openModal(warehouse)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateWarehouseModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSuccess={handleCreateWarehouse}
      />

      <EditWarehouseModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleEditWarehouse}
        warehouse={editModal.data}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteWarehouse}
        title="Delete Warehouse"
        description={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone and may affect stock tracking.`}
        confirmText="Delete Warehouse"
        loading={actionLoading}
      />
    </div>
  );
};

// Warehouse Card Component
const WarehouseCard = ({ warehouse, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <Warehouse className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {warehouse.code}
              </span>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(warehouse)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit warehouse"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(warehouse)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete warehouse"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {warehouse.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.location}</span>
          </div>
        )}
        
        {warehouse.address && (
          <div className="text-gray-600">
            <p className="ml-6">{warehouse.address}</p>
          </div>
        )}

        {warehouse.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.phone}</span>
          </div>
        )}

        {warehouse.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.email}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;