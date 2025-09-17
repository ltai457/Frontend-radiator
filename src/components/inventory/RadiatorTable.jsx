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

// Money formatter
const fmtMoney = (n) =>
  (n ?? n === 0)
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "NZD" }).format(n)
    : "—";

const RadiatorTable = ({
  radiators,
  onEdit,
  onDelete,
  onEditStock,
  isAdmin, // boolean passed from parent
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

  const userIsAdmin = !!isAdmin;

  return (
    <Table className="min-w-[1300px] table-auto">
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

          {/* NEW COLUMNS */}
          <TableHead className="table-cell text-center align-middle">
            Type
          </TableHead>
          <TableHead className="table-cell text-center align-middle">
            Dimensions
          </TableHead>

          <TableHead className="table-cell text-center align-middle">
            Retail
          </TableHead>
          <TableHead className="table-cell text-center align-middle">
            Trade
          </TableHead>

          {/* Stock */}
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
                {/* Show notes as subtitle if available */}
                {radiator.notes && (
                  <div className="text-xs text-gray-500 mt-1 truncate max-w-48">
                    {radiator.notes}
                  </div>
                )}
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

              {/* NEW CELLS */}
              <TableCell>
                <div className="text-sm text-gray-900">
                  {radiator.productType && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {radiator.productType}
                    </span>
                  )}
                  {!radiator.productType && <span className="text-gray-400">—</span>}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-900">
                  {radiator.dimensions || <span className="text-gray-400">—</span>}
                </div>
              </TableCell>

              {/* Retail Price */}
              <TableCell className="text-center align-middle">
                <div className="text-sm text-gray-900">
                  {fmtMoney(radiator.retailPrice)}
                </div>
              </TableCell>

              {/* Trade Price */}
              <TableCell className="text-center align-middle">
                <div className="text-sm text-gray-900">
                  {fmtMoney(radiator.tradePrice)}
                </div>
              </TableCell>

              {/* Stock */}
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

              {/* Actions */}
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

                  {userIsAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(radiator)}
                        icon={Edit}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                        title="Edit Radiator"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(radiator)}
                        icon={Trash2}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Radiator"
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