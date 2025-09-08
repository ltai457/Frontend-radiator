// src/components/warehouse/WarehouseStock.jsx
import React, { useState, useEffect } from 'react';
import { Warehouse, Package, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useRadiators } from '../../hooks/useRadiators';
import { useModal } from '../../hooks/useModal';
import { useFilters } from '../../hooks/useFilters';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/layout/EmptyState';
import { Button } from '../common/ui/Button';
import WarehouseSelector from './WarehouseSelector';
import StockFilters from './StockFilters';
import StockTable from './StockTable';
import StockStats from './StockStats';
import StockUpdateModal from './modals/StockUpdateModal';
import CreateWarehouseModal from './modals/CreateWarehouseModal';

const WarehouseStock = () => {
  const { user } = useAuth();
  const { warehouses, loading: warehousesLoading, createWarehouse } = useWarehouses();
  const { radiators, loading: radiatorsLoading, refetch } = useRadiators();
  const stockModal = useModal();
  const createWarehouseModal = useModal();

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const isAdmin = user?.role === 'Admin' || user?.role?.includes?.('Admin');

  // Select first warehouse when data loads
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse]);

  // Filter radiators by selected warehouse and prepare data
  const warehouseItems = React.useMemo(() => {
    if (!selectedWarehouse || !radiators.length) {
      return [];
    }
    
    return radiators.map(radiator => ({
      ...radiator,
      qty: radiator.stock?.[selectedWarehouse.code] || 0
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

  const handleCreateWarehouse = async (warehouseData) => {
    try {
      const result = await createWarehouse(warehouseData);
      
      if (result.success) {
        createWarehouseModal.closeModal();
        // Optionally select the new warehouse
        if (!selectedWarehouse) {
          setSelectedWarehouse(result.data);
        }
        return true;
      } else {
        throw new Error(result.error || 'Failed to create warehouse');
      }
    } catch (error) {
      console.error('Create warehouse failed:', error);
      throw error;
    }
  };

  const loading = warehousesLoading || radiatorsLoading;

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading warehouse stock..." />;
  }

  // No warehouses state - show create option
  if (warehouses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Stock Management</h2>
          <p className="text-gray-600">Monitor and manage stock levels across warehouse locations</p>
        </div>

        <EmptyState
          icon={Warehouse}
          title="No Warehouses Found"
          description="You need to create at least one warehouse before you can manage stock levels"
          action={isAdmin}
          actionLabel="Create Your First Warehouse"
          onAction={createWarehouseModal.openModal}
        />

        <CreateWarehouseModal
          isOpen={createWarehouseModal.isOpen}
          onClose={createWarehouseModal.closeModal}
          onSuccess={handleCreateWarehouse}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warehouse Stock Management</h2>
          <p className="text-sm text-gray-600">Monitor and manage stock levels across warehouses</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={createWarehouseModal.openModal} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        )}
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
              description={`No products have been added to the system yet. Add some radiators to manage stock for ${selectedWarehouse.name}.`}
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

      {/* Modals */}
      <StockUpdateModal
        isOpen={stockModal.isOpen}
        onClose={stockModal.closeModal}
        onSuccess={handleStockUpdate}
        radiator={stockModal.data}
      />

      <CreateWarehouseModal
        isOpen={createWarehouseModal.isOpen}
        onClose={createWarehouseModal.closeModal}
        onSuccess={handleCreateWarehouse}
      />
    </div>
  );
};

export default WarehouseStock;