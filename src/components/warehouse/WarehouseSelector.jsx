import React from 'react';
import { Warehouse, Check } from 'lucide-react';

const WarehouseSelector = ({ warehouses, selectedWarehouse, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 flex items-center">
          <Warehouse className="w-4 h-4 mr-2" />
          Warehouses
        </h4>
      </div>
      <div className="divide-y divide-gray-200">
        {warehouses.map((warehouse) => (
          <button
            key={warehouse.id}
            onClick={() => onSelect(warehouse)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
              selectedWarehouse?.id === warehouse.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{warehouse.name}</div>
                <div className="text-xs text-gray-500">Code: {warehouse.code}</div>
              </div>
              {selectedWarehouse?.id === warehouse.id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WarehouseSelector;
