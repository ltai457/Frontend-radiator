import React from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useModal } from '../../hooks/useModal';
import { useFilters } from '../../hooks/useFilters';
import { PageHeader } from '../common/layout/PageHeader';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { Button } from '../common/ui/Button';
import { EmptyState } from '../common/layout/EmptyState';
import SalesFilters from './SalesFilters';
import SalesTable from './SalesTable';
import SalesStats from './SalesStats';
import CreateSaleModal from './modals/CreateSaleModal';
import SaleDetailsModal from './modals/SaleDetailsModal';
import ReceiptModal from './modals/ReceiptModal';

const SalesManagement = () => {
  const { user } = useAuth();
  const { 
    sales, 
    loading, 
    error, 
    createSale, 
    getSaleById, 
    getReceipt, 
    cancelSale, 
    refundSale 
  } = useSales();
  
  const createModal = useModal();
  const detailsModal = useModal();
  const receiptModal = useModal();

  const {
    filteredData: filteredSales,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters(sales, {
    search: '',
    status: 'all',
    dateRange: { start: '', end: '' }
  });

  const handleCreateSale = async (saleData) => {
    const result = await createSale(saleData);
    if (result.success) {
      createModal.closeModal();
      return true;
    }
    return false;
  };

  const handleViewDetails = async (sale) => {
    const result = await getSaleById(sale.id);
    if (result.success) {
      detailsModal.openModal(result.data);
    } else {
      alert('Failed to load sale details: ' + result.error);
    }
  };

  const handleViewReceipt = async (sale) => {
    const result = await getReceipt(sale.id);
    if (result.success) {
      receiptModal.openModal(result.data);
    } else {
      alert('Failed to load receipt: ' + result.error);
    }
  };

  const handleCancelSale = async (sale) => {
    if (!window.confirm(`Are you sure you want to cancel sale ${sale.saleNumber}?`)) {
      return;
    }
    
    const result = await cancelSale(sale.id);
    if (!result.success) {
      alert('Failed to cancel sale: ' + result.error);
    }
  };

  const handleRefundSale = async (sale) => {
    if (!window.confirm(`Are you sure you want to refund sale ${sale.saleNumber}? This will restore stock levels.`)) {
      return;
    }
    
    const result = await refundSale(sale.id);
    if (!result.success) {
      alert('Failed to refund sale: ' + result.error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading sales..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        icon={ShoppingCart}
        actions={
          <Button
            onClick={() => createModal.openModal()}
            icon={Plus}
          >
            New Sale
          </Button>
        }
      />

      <SalesStats sales={filteredSales} />

      <SalesFilters
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredSales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={hasActiveFilters ? 'No sales found' : 'No sales yet'}
          description={
            hasActiveFilters 
              ? 'No sales match your current filters'
              : 'Start by creating your first sale'
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <SalesTable
          sales={filteredSales}
          onViewDetails={handleViewDetails}
          onViewReceipt={handleViewReceipt}
          onCancel={handleCancelSale}
          onRefund={handleRefundSale}
          userRole={user?.role}
        />
      )}

      {/* Modals */}
      <CreateSaleModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSubmit={handleCreateSale}
      />
      
      <SaleDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        sale={detailsModal.data}
        onViewReceipt={handleViewReceipt}
      />
      
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.closeModal}
        receipt={receiptModal.data}
      />
    </div>
  );
};

export default SalesManagement;