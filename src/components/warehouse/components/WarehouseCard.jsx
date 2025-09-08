// src/components/warehouse/components/WarehouseCard.jsx
import React from 'react';
import { Warehouse, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';

const WarehouseCard = ({ warehouse, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <Warehouse className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {warehouse.code}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons for admins */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(warehouse)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit warehouse"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(warehouse)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete warehouse"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {warehouse.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.location}</span>
          </div>
        )}
        
        {warehouse.address && (
          <div className="text-gray-600">
            <p className="ml-6">{warehouse.address}</p>
          </div>
        )}

        {warehouse.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.phone}</span>
          </div>
        )}

        {warehouse.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>{warehouse.email}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            Active
          </span>
        </div>
        
        {/* Created date */}
        {warehouse.createdAt && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">Created</span>
            <span className="text-xs text-gray-600">
              {new Date(warehouse.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseCard;