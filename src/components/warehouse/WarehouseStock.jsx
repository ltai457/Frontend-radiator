// src/components/warehouse/WarehouseStock.jsx
import React, { useState, useEffect } from 'react';
import { Warehouse, Package, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useRadiators } from '../../hooks/useRadiators';
import { useModal } from '../../hooks/useModal';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/layout/EmptyState';
import { Button } from '../common/ui/Button';
import WarehouseSelector from './components/WarehouseSelector';
import StockFilters from './components/StockFilters';
import StockTable from './components/StockTable';
import StockStats from './components/StockStats';
import StockUpdateModal from './modals/StockUpdateModal';
import CreateWarehouseModal from './modals/CreateWarehouseModal';

const WarehouseStock = () => {
  const { user } = useAuth();
  const { warehouses, loading: warehousesLoading, createWarehouse } = useWarehouses();
  const { radiators, loading: radiatorsLoading, refetch } = useRadiators();
  
  const stockModal = useModal();
  const createWarehouseModal = useModal();

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    brand: 'all',
    stockStatus: 'all'
  });

  const isAdmin = user?.role === 'Admin' || user?.role?.includes?.('Admin');

  // Auto-select first warehouse when data loads
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse]);

  // Prepare warehouse stock data
  const warehouseItems = React.useMemo(() => {
    if (!selectedWarehouse || !radiators.length) {
      return [];
    }
    
    return radiators.map(radiator => ({
      ...radiator,
      qty: radiator.stock?.[selectedWarehouse.code] || 0
    }));
  }, [selectedWarehouse, radiators]);

  // Apply filters
  const filteredItems = React.useMemo(() => {
    let filtered = warehouseItems;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.brand?.toLowerCase().includes(searchTerm) ||
        item.code?.toLowerCase().includes(searchTerm) ||
        item.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Brand filter
    if (filters.brand !== 'all') {
      filtered = filtered.filter(item => item.brand === filters.brand);
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter(item => {
        const qty = item.qty || 0;
        switch (filters.stockStatus) {
          case 'in-stock': return qty > 5;
          case 'low-stock': return qty > 0 && qty <= 5;
          case 'out-of-stock': return qty === 0;
          default: return true;
        }
      });
    }

    return filtered;
  }, [warehouseItems, filters]);

  const handleStockUpdate = async () => {
    await refetch();
  };

  const handleCreateWarehouse = async (warehouseData) => {
    try {
      const result = await createWarehouse(warehouseData);
      
      if (result.success) {
        createWarehouseModal.closeModal();
        // Auto-select new warehouse if none selected
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

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: 'all',
      stockStatus: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.brand !== 'all' || filters.stockStatus !== 'all';

  if (warehousesLoading || radiatorsLoading) {
    return <LoadingSpinner size="lg" text="Loading warehouse stock..." />;
  }

  // No warehouses state
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

        {/* Stock Content */}
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
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                radiators={radiators}
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
        warehouse={selectedWarehouse}
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