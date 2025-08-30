import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../common/ui/Table';
import { StatusBadge } from '../common/ui/StatusBadge';
import { Button } from '../common/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerTable = ({ customers, onEdit, onDelete, onViewDetails, userRole }) => {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Contact</TableHeader>
          <TableHeader>Orders</TableHeader>
          <TableHeader>Total Spent</TableHeader>
          <TableHeader>Last Order</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div>
                <div className="font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </div>
                {customer.company && (
                  <div className="text-sm text-gray-500">{customer.company}</div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm">
                {customer.email && (
                  <div className="text-gray-900">{customer.email}</div>
                )}
                {customer.phone && (
                  <div className="text-gray-500">{customer.phone}</div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm font-medium text-gray-900">
                {customer.totalPurchases || 0}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(customer.totalSpent)}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm text-gray-900">
                {formatDate(customer.lastPurchaseDate)}
              </div>
            </TableCell>
            
            <TableCell>
              <StatusBadge 
                status={customer.isActive ? 'Active' : 'Inactive'} 
              />
            </TableCell>
            
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(customer)}
                  icon={Eye}
                  className="p-1"
                />
                
                {userRole === 'Admin' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(customer)}
                      icon={Edit}
                      className="p-1 text-yellow-600 hover:text-yellow-800"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(customer)}
                      icon={Trash2}
                      className="p-1 text-red-600 hover:text-red-800"
                    />
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomerTable;
