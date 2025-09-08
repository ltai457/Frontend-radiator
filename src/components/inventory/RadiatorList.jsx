import React from 'react';
import { Package, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRadiators } from '../../hooks/useRadiators';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useModal } from '../../hooks/useModal';
import { useFilters } from '../../hooks/useFilters';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { Button } from '../common/ui/Button';
import { EmptyState } from '../common/layout/EmptyState';
import RadiatorFilters from './RadiatorFilters';
import RadiatorTable from './RadiatorTable';
import RadiatorStats from './RadiatorStats';
import AddRadiatorModal from './modals/AddRadiatorModal';
import EditRadiatorModal from './modals/EditRadiatorModal';
/* import StockUpdateModal from '../warehouse/modals/StockUpdateModal'; */

const RadiatorList = () => {
  const { user } = useAuth();
  const { 
    radiators, 
    loading, 
    error, 
    createRadiator, 
    updateRadiator, 
    deleteRadiator,
    refetch
  } = useRadiators();
  
  const { warehouses } = useWarehouses();
  
  const addModal = useModal();
  const editModal = useModal();
  const stockModal = useModal();

  const {
    filteredData: filteredRadiators,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters(radiators, {
    search: '',
    brand: 'all',
    year: 'all'
  });

  // Normalize admin across number/string/array cases
  const isAdmin =
    user?.role === 1 ||
    user?.role === '1' ||
    user?.role === 'Admin' ||
    user?.role === 'admin' ||
    (Array.isArray(user?.role) && user.role.map(String).some(r => r.toLowerCase() === 'admin' || r === '1'));

  const handleAddRadiator = async (radiatorData) => {
    try {
      const result = await createRadiator(radiatorData);
      if (result.success) {
        addModal.closeModal();
        if (refetch) await refetch();
        return true;
      } else {
        throw new Error(result.error || 'Failed to create radiator');
      }
    } catch (error) {
      console.error('Error adding radiator:', error);
      alert('Failed to add radiator: ' + error.message);
      return false;
    }
  };

  const handleEditRadiator = async (radiatorData) => {
    try {
      const result = await updateRadiator(editModal.data.id, radiatorData);
      if (result.success) {
        editModal.closeModal();
        if (refetch) await refetch();
        return true;
      } else {
        throw new Error(result.error || 'Failed to update radiator');
      }
    } catch (error) {
      console.error('Error updating radiator:', error);
      alert('Failed to update radiator: ' + error.message);
      return false;
    }
  };

  const handleDeleteRadiator = async (radiator) => {
    const confirmMessage = `Are you sure you want to delete "${radiator.name}"?\n\nThis will also remove all stock levels for this product across all warehouses.\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const result = await deleteRadiator(radiator.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete radiator');
      }
      if (refetch) {
        await refetch();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting radiator:', error);
      alert('Failed to delete radiator: ' + error.message);
    }
  };

  const handleStockUpdate = async () => {
    if (refetch) {
      await refetch();
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading radiators..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Product Catalog</h3>
          <p className="text-sm text-gray-600">Manage your radiator inventory</p>
        </div>
        
        {/* Show Add button for admin users */}
        {isAdmin && (
          <Button onClick={() => addModal.openModal()} icon={Plus}>
            Add Radiator
          </Button>
        )}
      </div>

      <RadiatorStats radiators={radiators} />

      <RadiatorFilters
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        radiators={radiators}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredRadiators.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasActiveFilters ? 'No radiators found' : 'No radiators yet'}
          description={
            hasActiveFilters 
              ? 'No radiators match your current filters'
              : 'Start by adding your first radiator'
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <RadiatorTable
          radiators={filteredRadiators}
          onEdit={editModal.openModal}
          onDelete={handleDeleteRadiator}
          onEditStock={stockModal.openModal}
          isAdmin={isAdmin}
        />
      )}

      {/* Modals */}
      <AddRadiatorModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSuccess={handleAddRadiator}
        warehouses={warehouses || []}
      />
      
      <EditRadiatorModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleEditRadiator}
        radiator={editModal.data}
      />
      
      
    </div>
  );
};

export default RadiatorList;
