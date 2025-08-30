import React from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRadiators } from '../../hooks/useRadiators';
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
import StockUpdateModal from './modals/StockUpdateModal';

const RadiatorList = () => {
  const { user } = useAuth();
  const { 
    radiators, 
    loading, 
    error, 
    createRadiator, 
    updateRadiator, 
    deleteRadiator 
  } = useRadiators();
  
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

  const handleAddRadiator = async (radiatorData) => {
    const result = await createRadiator(radiatorData);
    if (result.success) {
      addModal.closeModal();
      return true;
    }
    return false;
  };

  const handleEditRadiator = async (radiatorData) => {
    const result = await updateRadiator(editModal.data.id, radiatorData);
    if (result.success) {
      editModal.closeModal();
      return true;
    }
    return false;
  };

  const handleDeleteRadiator = async (radiator) => {
    if (!window.confirm(`Are you sure you want to delete ${radiator.name}?`)) {
      return;
    }
    
    const result = await deleteRadiator(radiator.id);
    if (!result.success) {
      alert('Failed to delete radiator: ' + result.error);
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
        {user?.role === 'Admin' && (
          <Button
            onClick={() => addModal.openModal()}
            icon={Plus}
          >
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
          userRole={user?.role}
        />
      )}

      {/* Modals */}
      <AddRadiatorModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSubmit={handleAddRadiator}
      />
      
      <EditRadiatorModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSubmit={handleEditRadiator}
        radiator={editModal.data}
      />
      
      <StockUpdateModal
        isOpen={stockModal.isOpen}
        onClose={stockModal.closeModal}
        onSuccess={() => {
          // Refresh radiators to get updated stock
          window.location.reload(); // Simple refresh - could be optimized
        }}
        radiator={stockModal.data}
      />
    </div>
  );
};

export default RadiatorList;
