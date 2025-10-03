// src/components/dashboard/DashboardNavigation.jsx
// REPLACE YOUR EXISTING FILE
import React from 'react';

const DashboardNavigation = ({ activeTab, onTabChange, isAdmin }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: 'Sales' },
    { id: 'customers', label: 'Customers' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'stock', label: 'Stock' },
    { id: 'warehouses', label: 'Warehouses' }
  ];

  // Add Users tab only for admins
  if (isAdmin) {
    tabs.push({ id: 'users', label: 'Users' });
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default DashboardNavigation;