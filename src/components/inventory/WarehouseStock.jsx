import React from 'react';
import { Warehouse, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useRadiators } from '../../hooks/useRadiators';
import { useModal } from '../../hooks/useModal';
import { useFilters } from '../../hooks/useFilters';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/layout/EmptyState';
import WarehouseSelector from './WarehouseSelector';
import StockFilters from './StockFilters';
import StockTable from './StockTable';
import StockStats from './StockStats';
import StockUpdateModal from './modals/StockUpdateModal';

const WarehouseStock = () => {
  const { user } = useAuth();
  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { radiators, loading: radiatorsLoading } = useRadiators();
  const stockModal = useModal();

  const [selectedWarehouse, setSelectedWarehouse] = React.useState(null);

  // Select first warehouse when data loads
  React.useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse]);

  // Filter radiators by selected warehouse
  const warehouseItems = React.useMemo(() => {
    if (!selectedWarehouse || !radiators.length) return [];
    
    return radiators.map(radiator => ({
      ...radiator,
      qty: radiator.stock?.[selectedWarehouse.code] ?? 0
    }));
  }, [radiators, selectedWarehouse]);

  const {
    filteredData: filteredItems,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters(warehouseItems, {
    search: '',
    stockLevel: 'all'
  });

  const handleStockUpdate = () => {
    // Refresh data after stock update
    window.location.reload(); // Simple refresh - could be optimized
  };

  const loading = warehousesLoading || radiatorsLoading;

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading warehouse stock..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Stock Management</h3>
          <p className="text-sm text-gray-600">Monitor and manage stock levels across warehouses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Warehouse Selector */}
        <div className="lg:col-span-1">
          <WarehouseSelector
            warehouses={warehouses}
            selectedWarehouse={selectedWarehouse}
            onSelect={setSelectedWarehouse}
          />
          
          {selectedWarehouse && (
            <StockStats 
              items={warehouseItems} 
              warehouse={selectedWarehouse}
              className="mt-4"
            />
          )}
        </div>

        {/* Stock Items */}
        <div className="lg:col-span-3">
          {!selectedWarehouse ? (
            <EmptyState
              icon={Warehouse}
              title="Select a Warehouse"
              description="Choose a warehouse from the left to view and manage stock levels"
            />
          ) : (
            <>
              <StockFilters
                filters={filters}
                onFilterChange={setFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                selectedWarehouse={selectedWarehouse}
              />

              {filteredItems.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={hasActiveFilters ? 'No products found' : 'No products in this warehouse'}
                  description={
                    hasActiveFilters 
                      ? 'No products match your current filters'
                      : `No products found in ${selectedWarehouse.name}`
                  }
                  action={hasActiveFilters}
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                />
              ) : (
                <StockTable
                  items={filteredItems}
                  warehouse={selectedWarehouse}
                  onEditStock={stockModal.openModal}
                  onQuickUpdate={handleStockUpdate}
                  userRole={user?.role}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={stockModal.isOpen}
        onClose={stockModal.closeModal}
        onSuccess={handleStockUpdate}
        radiator={stockModal.data}
      />
    </div>
  );
};

export default WarehouseStock;