import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell 
} from '../common/ui/Table';
import { StatusBadge } from '../common/ui/StatusBadge';
import { Button } from '../common/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerTable = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  userRole 
}) => {
  const canEdit = userRole === 'Admin';

  return (
    <div className="bg-white rounded-lg shadow">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Customer
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Contact
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Orders
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Total Spent
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Last Order
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell className="px-4 py-8 text-center text-sm text-gray-500" colSpan={7}>
                No customers to display
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                {/* Customer Name & Company */}
                <TableCell className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    {customer.company && (
                      <div className="text-xs text-gray-500">
                        {customer.company}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Contact Info */}
                <TableCell className="px-4 py-3">
                  <div>
                    {customer.email && (
                      <div className="text-sm text-gray-900">{customer.email}</div>
                    )}
                    {customer.phone && (
                      <div className="text-xs text-gray-500">{customer.phone}</div>
                    )}
                  </div>
                </TableCell>
                
                {/* Orders Count */}
                <TableCell className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {customer.totalPurchases || 0}
                  </span>
                </TableCell>
                
                {/* Total Spent */}
                <TableCell className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </TableCell>
                
                {/* Last Order Date */}
                <TableCell className="px-4 py-3 text-center">
                  <span className="text-sm text-gray-900">
                    {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : '-'}
                  </span>
                </TableCell>
                
                {/* Status Badge */}
                <TableCell className="px-4 py-3 text-center">
                  {customer.isActive ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </TableCell>
                
                {/* Actions */}
                <TableCell className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(customer)}
                      className="p-1.5 hover:bg-blue-50"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                          className="p-1.5 hover:bg-yellow-50"
                          aria-label="Edit customer"
                        >
                          <Edit className="w-4 h-4 text-yellow-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(customer)}
                          className="p-1.5 hover:bg-red-50"
                          aria-label="Delete customer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;