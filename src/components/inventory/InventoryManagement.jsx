import React, { useState } from 'react';
import { Package, Warehouse } from 'lucide-react';
import { PageHeader } from '../common/layout/PageHeader';
import RadiatorList from './RadiatorList';
import WarehouseStock from './WarehouseStock';

const InventoryManagement = () => {
  const [activeView, setActiveView] = useState('products'); // 'products' or 'stock'

  const renderContent = () => {
    switch (activeView) {
      case 'stock':
        return <WarehouseStock />;
      case 'products':
      default:
        return <RadiatorList />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        subtitle="Manage products and stock levels across all warehouses"
        icon={Package}
      />

      {/* Sub-navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveView('stock')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'stock'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Warehouse className="w-4 h-4 inline mr-2" />
              Stock Levels
            </button>
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;