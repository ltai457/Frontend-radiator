import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomers } from '../../hooks/useCustomers';
import { useModal } from '../../hooks/useModal';
import { useFilters } from '../../hooks/useFilters';
import { PageHeader } from '../common/layout/PageHeader';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { Button } from '../common/ui/Button';
import { EmptyState } from '../common/layout/EmptyState';
import CustomerFilters from './CustomerFilters';
import CustomerTable from './CustomerCards';
import CustomerStats from './CustomerStats';
import AddCustomerModal from './modals/AddCustomerModal';
import EditCustomerModal from './modals/EditCustomerModal';
import CustomerDetailsModal from './modals/CustomerDetailsModal';

const CustomerList = () => {
  const { user } = useAuth();
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, getCustomerById } = useCustomers();
  
  // Normalize admin across number/string/array cases - COPIED FROM RADIATORLIST
  const isAdmin =
    user?.role === 1 ||
    user?.role === '1' ||
    user?.role === 'Admin' ||
    user?.role === 'admin' ||
    (Array.isArray(user?.role) && user.role.map(String).some(r => r.toLowerCase() === 'admin' || r === '1'));

  // DEBUG: Let's see what we're working with
  console.log('=== DEBUGGING USER ROLE ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('Type of role:', typeof user?.role);
  console.log('isAdmin check result:', isAdmin);
  console.log('==========================');
  
  const addModal = useModal();
  const editModal = useModal();
  const detailsModal = useModal();

  const {
    filteredData: filteredCustomers,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters(customers, {
    search: '',
    status: 'all'
  });

  const handleAddCustomer = async (customerData) => {
    const result = await createCustomer(customerData);
    if (result.success) {
      addModal.closeModal();
      return true;
    }
    return false;
  };

  const handleEditCustomer = async (customerData) => {
    const result = await updateCustomer(editModal.data.id, customerData);
    if (result.success) {
      editModal.closeModal();
      return true;
    }
    return false;
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to deactivate ${customer.firstName} ${customer.lastName}?`)) {
      return;
    }
    
    const result = await deleteCustomer(customer.id);
    if (!result.success) {
      alert('Failed to delete customer: ' + result.error);
    }
  };

  const handleViewDetails = async (customer) => {
    const result = await getCustomerById(customer.id);
    if (result.success) {
      detailsModal.openModal(result.data);
    } else {
      alert('Failed to load customer details: ' + result.error);
    }
  };

  const handleViewSales = (customer) => {
    // Navigate to sales with customer filter
    // This would be implemented based on your routing setup
    console.log('View sales for customer:', customer.id);
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading customers..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        icon={Users}
        actions={
          isAdmin && (
            <Button
              onClick={() => addModal.openModal()}
              icon={Plus}
            >
              Add Customer
            </Button>
          )
        }
      />

      <CustomerStats customers={customers} />

      <CustomerFilters
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

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasActiveFilters ? 'No customers found' : 'No customers yet'}
          description={
            hasActiveFilters 
              ? 'No customers match your current filters'
              : 'Start by adding your first customer'
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onEdit={editModal.openModal}
          onDelete={handleDeleteCustomer}
          onViewDetails={handleViewDetails}
          userRole={user?.role}
        />
      )}

      {/* Modals */}
      <AddCustomerModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSubmit={handleAddCustomer}
      />
      
      <EditCustomerModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSubmit={handleEditCustomer}
        customer={editModal.data}
      />
      
      <CustomerDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        customer={detailsModal.data}
        onViewSales={handleViewSales}
      />
    </div>
  );
};

export default CustomerList;