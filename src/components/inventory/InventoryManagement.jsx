import React from "react";
import { Edit, Trash2, Package } from "lucide-react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../common/ui/Table";
import { Button } from "../common/ui/Button";

const RadiatorTable = ({
  radiators,
  onEdit,
  onDelete,
  onEditStock,
  userRole,
}) => {
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  const getStockColor = (totalStock) => {
    if (totalStock === 0) return "text-red-600";
    if (totalStock <= 5) return "text-yellow-600";
    return "text-green-600";
  };

  // FORCE SHOW ALL BUTTONS FOR TESTING
  const userIsAdmin = true;  // ALWAYS TRUE FOR TESTING

  console.log('RadiatorTable - FORCED userIsAdmin:', userIsAdmin);

  return (
    <Table className="min-w-[960px] table-auto">
      <TableHeader className="table-header-group">
        <TableRow className="table-row">
          <TableHead className="table-cell w-36 text-center align-middle">
            Product
          </TableHead>
          <TableHead className="table-cell text-center align-middle">
            Brand
          </TableHead>
          <TableHead className="table-cell text-center align-middle">
            Code
          </TableHead>
          <TableHead className="table-cell text-center align-middle">
            Year
          </TableHead>
          <TableHead className="table-cell w-40 text-center align-middle">
            Stock
          </TableHead>
          <TableHead className="table-cell w-50 text-center align-middle">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

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
                <div className="text-sm font-mono text-gray-900">
                  {radiator.code}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-900">{radiator.year}</div>
              </TableCell>

              <TableCell className="text-center align-middle">
                <div
                  className={`text-sm font-medium ${getStockColor(totalStock)}`}
                >
                  {totalStock} units
                </div>
                {radiator.stock && (
                  <div className="mt-0.5 text-xs text-gray-500 inline-flex flex-wrap justify-center gap-x-2">
                    {Object.entries(radiator.stock).map(([warehouse, qty]) => (
                      <span key={warehouse}>
                        {warehouse}: {qty}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>

              <TableCell className="text-center align-middle">
                <div className="inline-flex items-center justify-center gap-2">
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStock(radiator)}
                    icon={Package}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit Stock"
                  />

                  {/* ALWAYS SHOW THESE BUTTONS FOR TESTING */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(radiator)}
                    icon={Edit}
                    className="p-1 text-yellow-600 hover:text-yellow-800"
                    title="Edit Radiator - FORCED"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(radiator)}
                    icon={Trash2}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete Radiator - FORCED"
                  />
                  
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