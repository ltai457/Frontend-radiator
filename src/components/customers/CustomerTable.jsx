import React from 'react';
import { Eye, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../common/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerTable = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  userRole,
  sortBy = 'firstName',
  sortOrder = 'asc',
  onSort
}) => {
  // ✅ FIXED: Use comprehensive admin role check like other components
  const canEdit = 
    userRole === 1 ||
    userRole === '1' ||
    userRole === 'Admin' ||
    userRole === 'admin' ||
    (Array.isArray(userRole) && userRole.map(String).some(r => r.toLowerCase() === 'admin' || r === '1'));

  // 🔍 DEBUG: Add logging to help diagnose role issues
  console.log('=== CUSTOMER TABLE DEBUG ===');
  console.log('userRole:', userRole);
  console.log('userRole type:', typeof userRole);
  console.log('canEdit result:', canEdit);
  console.log('============================');

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => onSort?.(column)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 transition-colors text-left"
    >
      {children}
      {sortBy === column && (
        sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="grid gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-600" style={{gridTemplateColumns: '240px 200px 80px 120px 120px 80px 100px'}}>
        <div>
          <SortButton column="firstName">Customer</SortButton>
        </div>
        <div>
          Contact Information
        </div>
        <div className="text-center">
          <SortButton column="totalPurchases">Orders</SortButton>
        </div>
        <div className="text-center">
          <SortButton column="totalSpent">Total Spent</SortButton>
        </div>
        <div className="text-center">
          <SortButton column="lastPurchaseDate">Last Order</SortButton>
        </div>
        <div className="text-center">
          <SortButton column="isActive">Status</SortButton>
        </div>
        <div className="text-center">
          Actions
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No customers found</div>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div 
              key={customer.id} 
              className="grid gap-4 p-4 hover:bg-gray-50 transition-colors items-center" 
              style={{gridTemplateColumns: '240px 200px 80px 120px 120px 80px 100px'}}
            >
              {/* Customer Name & Company - 240px */}
              <div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {customer.firstName} {customer.lastName}
                  </div>
                  {customer.company && (
                    <div className="text-sm text-gray-500 truncate">
                      {customer.company}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 truncate">
                    ID: {customer.id?.substring(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Contact Information - 200px */}
              <div>
                <div className="min-w-0 space-y-1">
                  {customer.email && (
                    <div className="text-sm text-gray-900 truncate">
                      📧 {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="text-sm text-gray-600 truncate">
                      📞 {customer.phone}
                    </div>
                  )}
                  {!customer.email && !customer.phone && (
                    <div className="text-sm text-gray-400">
                      No contact info
                    </div>
                  )}
                </div>
              </div>

              {/* Orders Count - 80px */}
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {customer.totalPurchases || 0}
                </span>
              </div>

              {/* Total Spent - 120px */}
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(customer.totalSpent || 0)}
                </div>
                {customer.totalSpent > 0 && (
                  <div className="text-xs text-gray-500">
                    Avg: {formatCurrency((customer.totalSpent || 0) / Math.max(1, customer.totalPurchases || 1))}
                  </div>
                )}
              </div>

              {/* Last Order Date - 120px */}
              <div className="text-center">
                <div className="text-sm text-gray-900">
                  {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : '-'}
                </div>
                {customer.lastPurchaseDate && (
                  <div className="text-xs text-gray-500">
                    {Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                )}
              </div>

              {/* Status - 80px */}
              <div className="text-center">
                {customer.isActive ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Inactive
                  </span>
                )}
              </div>

              {/* Actions - 100px */}
              <div className="flex items-center justify-center gap-1">
                {/* View Details Button - Always visible */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(customer)}
                  className="p-1 hover:bg-blue-50 transition-colors"
                  title="View customer details"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                </Button>
                
                {/* Edit & Delete Buttons - Only for admins */}
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(customer)}
                      className="p-1 hover:bg-yellow-50 transition-colors"
                      title="Edit customer"
                    >
                      <Edit className="w-4 h-4 text-yellow-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(customer)}
                      className="p-1 hover:bg-red-50 transition-colors"
                      title="Delete customer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Debug Panel - Remove this in production */}
      <div className="border-t bg-yellow-50 p-2 text-xs text-gray-600">
        <strong>🔍 Debug Info:</strong> userRole = <code>{JSON.stringify(userRole)}</code>, canEdit = <code>{canEdit.toString()}</code>
        {canEdit && <span className="text-green-600 ml-2">✅ Edit buttons should be visible</span>}
        {!canEdit && <span className="text-red-600 ml-2">❌ Edit buttons hidden - check role</span>}
      </div>
    </div>
  );
};

export default CustomerTable;