import React from "react";
import {
  Warehouse,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function WarehouseCards({
  items,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((warehouse) => (
        <div
          key={warehouse.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Warehouse className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {warehouse.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    {warehouse.code}
                  </span>
                </div>
              </div>
              {isAdmin && (
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block z-10 border">
                    <button
                      onClick={() => onView(warehouse)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      <Eye className="inline w-4 h-4 mr-2" /> View Details
                    </button>
                    <button
                      onClick={() => onEdit(warehouse)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="inline w-4 h-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(warehouse)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      <Trash2 className="inline w-4 h-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {warehouse.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{warehouse.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
