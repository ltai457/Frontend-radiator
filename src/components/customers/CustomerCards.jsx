import React from 'react';
import { Eye, Edit, Trash2, Mail, Phone, User, Calendar } from 'lucide-react';
import { Button } from '../common/ui/Button';
import { formatDate } from '../../utils/formatters';

const CustomerCards = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  userRole
}) => {
  // ✅ FIXED: Use comprehensive admin role check
  const canEdit = 
    userRole === 1 ||
    userRole === '1' ||
    userRole === 'Admin' ||
    userRole === 'admin' ||
    (Array.isArray(userRole) && userRole.map(String).some(r => r.toLowerCase() === 'admin' || r === '1'));

  console.log('=== CUSTOMER CARDS DEBUG ===');
  console.log('userRole:', userRole);
  console.log('canEdit result:', canEdit);
  console.log('============================');

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or add a new customer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div 
          key={customer.id} 
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Left Side - Customer Info */}
              <div className="flex-1 min-w-0">
                {/* Customer Name & Company */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    {customer.company && (
                      <p className="text-sm text-gray-600 truncate">
                        {customer.company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customer.email ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span>No email</span>
                      </div>
                    )}
                    
                    {customer.phone ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>No phone</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Order */}
                <div className="mb-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 uppercase">Last Order</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'No orders yet'}
                    </div>
                    {customer.lastPurchaseDate && (
                      <div className="text-xs text-purple-600">
                        {Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Status & Actions */}
              <div className="flex flex-col items-end gap-3 ml-4">
                {/* Status Badge */}
                <div>
                  {customer.isActive ? (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                      ● Inactive
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* View Button - Always visible */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(customer)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    title="View customer details"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  
                  {/* Edit Button - Admin only */}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(customer)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      title="Edit customer"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                  )}
                  
                  {/* Delete Button - Admin only */}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(customer)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs border-red-200 text-red-700 hover:bg-red-50"
                      title="Delete customer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Border with Customer ID */}
          <div className="bg-gray-50 px-6 py-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Customer ID: {customer.id?.substring(0, 8)}...
              </span>
              {!canEdit && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  Limited Access
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Debug Panel - Remove in production */}
      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-xs text-gray-600">
          <strong>🔍 Debug Info:</strong> userRole = <code>{JSON.stringify(userRole)}</code>, canEdit = <code>{canEdit.toString()}</code>
          {canEdit && <span className="text-green-600 ml-2">✅ Edit buttons visible</span>}
          {!canEdit && <span className="text-red-600 ml-2">❌ Edit buttons hidden</span>}
        </div>
      </div> */}
    </div>
  );
};

export default CustomerCards;