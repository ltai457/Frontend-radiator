// src/components/warehouse/components/WarehouseSelector.jsx
import React from 'react';
import { Warehouse, MapPin } from 'lucide-react';

const WarehouseSelector = ({ warehouses, selectedWarehouse, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Select Warehouse</h3>
        <p className="text-sm text-gray-600 mt-1">Choose a location to view stock</p>
      </div>
      
      <div className="p-2">
        {warehouses.map((warehouse) => (
          <button
            key={warehouse.id}
            onClick={() => onSelect(warehouse)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedWarehouse?.id === warehouse.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                selectedWarehouse?.id === warehouse.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Warehouse className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {warehouse.name}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    selectedWarehouse?.id === warehouse.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {warehouse.code}
                  </span>
                </div>
                
                {warehouse.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{warehouse.location}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WarehouseSelector;