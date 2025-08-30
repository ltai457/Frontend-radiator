import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../common/ui/Table';
import { Button } from '../common/ui/Button';

const RadiatorTable = ({ radiators, onEdit, onDelete, onEditStock, userRole }) => {
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  const getStockColor = (totalStock) => {
    if (totalStock === 0) return 'text-red-600';
    if (totalStock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Product</TableHeader>
          <TableHeader>Brand</TableHeader>
          <TableHeader>Code</TableHeader>
          <TableHeader>Year</TableHeader>
          <TableHeader>Stock</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {radiators.map((radiator) => {
          const totalStock = getTotalStock(radiator.stock);
          
          return (
            <TableRow key={radiator.id}>
              <TableCell>
                <div className="font-medium text-gray-900">{radiator.name}</div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-gray-900">{radiator.brand}</div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm font-mono text-gray-900">{radiator.code}</div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-gray-900">{radiator.year}</div>
              </TableCell>
              
              <TableCell>
                <div className={`text-sm font-medium ${getStockColor(totalStock)}`}>
                  {totalStock} units
                </div>
                {radiator.stock && (
                  <div className="text-xs text-gray-500">
                    {Object.entries(radiator.stock).map(([warehouse, qty]) => (
                      <span key={warehouse} className="mr-2">
                        {warehouse}: {qty}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStock(radiator)}
                    icon={Package}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  />
                  
                  {userRole === 'Admin' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(radiator)}
                        icon={Edit}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(radiator)}
                        icon={Trash2}
                        className="p-1 text-red-600 hover:text-red-800"
                      />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default RadiatorTable;