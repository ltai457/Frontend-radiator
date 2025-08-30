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
  const { radiators, loading: radiatorsLoading, refetch } = useRadiators();
  const stockModal = useModal();

  const [selectedWarehouse, setSelectedWarehouse] = React.useState(null);

  // Select first warehouse when data loads
  React.useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse]);

  // Filter radiators by selected warehouse and prepare data
  const warehouseItems = React.useMemo(() => {
    if (!selectedWarehouse || !radiators.length) {
      console.log('No warehouse selected or no radiators:', { selectedWarehouse, radiatorsCount: radiators.length });
      return [];
    }
    
    console.log('Creating warehouse items for:', selectedWarehouse.code);
    console.log('Sample radiator stock:', radiators[0]?.stock);
    
    return radiators.map(radiator => ({
      ...radiator,
      qty: radiator.stock?.[selectedWarehouse.code] ?? 0
    }));
  }, [radiators, selectedWarehouse]);

  // Custom filter function for stock levels
  const filterItems = (items, filters) => {
    let filtered = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.code?.toLowerCase().includes(searchLower)
      );
    }

    // Stock level filter
    if (filters.stockLevel && filters.stockLevel !== 'all') {
      filtered = filtered.filter(item => {
        const qty = item.qty || 0;
        switch (filters.stockLevel) {
          case 'available':
            return qty > 0;
          case 'good':
            return qty > 5;
          case 'low':
            return qty > 0 && qty <= 5;
          case 'out':
            return qty === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const {
    filteredData: filteredItems,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters(warehouseItems, {
    search: '',
    stockLevel: 'all'
  }, filterItems);

  const handleStockUpdate = async () => {
    // Refresh data after stock update
    if (refetch) {
      await refetch();
    } else {
      window.location.reload();
    }
  };

  const loading = warehousesLoading || radiatorsLoading;

  console.log('WarehouseStock render:', {
    loading,
    warehousesCount: warehouses.length,
    radiatorsCount: radiators.length,
    selectedWarehouse: selectedWarehouse?.name,
    warehouseItemsCount: warehouseItems.length,
    filteredItemsCount: filteredItems.length
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading warehouse stock..." />;
  }

  if (warehouses.length === 0) {
    return (
      <EmptyState
        icon={Warehouse}
        title="No Warehouses Found"
        description="No warehouses are configured. Please add warehouses first."
      />
    );
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
          
          {selectedWarehouse && warehouseItems.length > 0 && (
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
          ) : warehouseItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products Found"
              description={`No products have stock configured for ${selectedWarehouse.name}`}
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