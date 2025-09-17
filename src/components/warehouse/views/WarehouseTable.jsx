import React from "react";
import { Warehouse, Phone, Mail, Eye, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../../common/ui/Button";

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
  const SortButton = ({ column, children }) => (
    <button
      onClick={() => onSort(column)}
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
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
        <div className="col-span-3">
          <SortButton column="name">Warehouse</SortButton>
        </div>
        <div className="col-span-1">
          <SortButton column="code">Code</SortButton>
        </div>
        <div className="col-span-3">
          <SortButton column="location">Location</SortButton>
        </div>
        <div className="col-span-2">
          Contact
        </div>
        <div className="col-span-2">
          <SortButton column="updatedAt">Last Updated</SortButton>
        </div>
        <div className="col-span-1 text-center">
          Actions
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {items.map((warehouse) => (
          <div 
            key={warehouse.id} 
            className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
          >
            {/* Warehouse Info - 3 columns */}
            <div className="col-span-3 flex items-center gap-2">
              <Warehouse className="h-8 w-8 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {warehouse.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  ID: {warehouse.id?.substring(0, 8)}...
                </div>
              </div>
            </div>

            {/* Code - 1 column */}
            <div className="col-span-1">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 inline-block">
                {warehouse.code}
              </span>
            </div>

            {/* Location - 3 columns */}
            <div className="col-span-3">
              <div className="min-w-0">
                <div className="text-sm text-gray-900 truncate">
                  {warehouse.location || "Not specified"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {warehouse.address}
                </div>
              </div>
            </div>

            {/* Contact - 2 columns */}
            <div className="col-span-2">
              <div className="min-w-0 space-y-1">
                {warehouse.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{warehouse.phone}</span>
                  </div>
                )}
                {warehouse.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{warehouse.email}</span>
                  </div>
                )}
                {!warehouse.phone && !warehouse.email && (
                  <span className="text-sm text-gray-400">No contact info</span>
                )}
              </div>
            </div>

            {/* Last Updated - 2 columns */}
            <div className="col-span-2">
              <div className="text-sm text-gray-500">
                {new Date(
                  warehouse.updatedAt || warehouse.createdAt
                ).toLocaleDateString('en-NZ', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Actions - 1 column */}
            <div className="col-span-1 flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(warehouse)}
                className="p-1 hover:bg-gray-100"
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
                    className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                    title="Edit Warehouse"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(warehouse)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Warehouse className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No warehouses found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}