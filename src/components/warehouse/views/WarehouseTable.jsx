import React from "react";
import { Warehouse, Phone, Mail, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../../common/ui/Button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../common/ui/Table";

export default function WarehouseTable({
  items,
  sortBy,
  sortOrder,
  onSort,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Warehouse"
              column="name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHead
              label="Code"
              column="code"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHead
              label="Location"
              column="location"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead>Contact</TableHead>
            <SortableHead
              label="Last Updated"
              column="updatedAt"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {warehouse.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {warehouse.id?.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {warehouse.code}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="text-gray-900">
                    {warehouse.location || "Not specified"}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {warehouse.address}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {warehouse.phone && (
                    <div className="flex items-center gap-1 text-gray-900">
                      <Phone className="w-3 h-3" />
                      {warehouse.phone}
                    </div>
                  )}
                  {warehouse.email && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <Mail className="w-3 h-3" />
                      {warehouse.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500">
                  {new Date(
                    warehouse.updatedAt || warehouse.createdAt
                  ).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(warehouse)}
                    className="p-1"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(warehouse)}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                        title="Edit Warehouse"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(warehouse)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Warehouse"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({ label, column, sortBy, sortOrder, onSort }) {
  const active = sortBy === column;
  return (
    <TableHead
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        {active && (
          <span className="text-blue-600">
            {sortOrder === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );
}
