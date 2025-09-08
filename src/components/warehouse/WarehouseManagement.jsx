// src/components/warehouse/WarehouseManagement.jsx
import React, { useState } from 'react';
import { Warehouse, Plus, Edit, Trash2, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWarehouses } from '../../hooks/useWarehouses';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/layout/EmptyState';
import { Button } from '../common/ui/Button';
import { useModal } from '../../hooks/useModal';
import WarehouseCard from './components/WarehouseCard';
import CreateWarehouseModal from './modals/CreateWarehouseModal';
import EditWarehouseModal from './modals/EditWarehouseModal';
import ConfirmDeleteModal from '../common/modals/ConfirmDeleteModal';

const WarehouseManagement = () => {
  const { user } = useAuth();
  const { 
    warehouses, 
    loading, 
    error,
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse 
  } = useWarehouses();
  
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const [actionLoading, setActionLoading] = useState(false);

  // Check if user has admin privileges
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
      alert(`Failed to delete warehouse: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading warehouses..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error loading warehouses</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
          <Button 
            onClick={createModal.openModal} 
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        )}
      </div>

      {/* Content */}
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

export default WarehouseManagement;