// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RadiatorList from './RadiatorList';
import StockManager from './StockManager'; // NEW
import WarehouseStock from './WarehouseStock';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <RadiatorList />;
      case 'stock': // NEW
        return <WarehouseStock />;
      case 'overview':
      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              You have successfully logged in to RadiatorStock NZ.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="block w-full text-left text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Inventory
                  </button>
                  <button
                    onClick={() => setActiveTab('stock')}
                    className="block w-full text-left text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Manage Stock
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900">Statistics</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Total Radiators: Loading...</p>
                  <p>Total Stock: Loading...</p>
                  <p>Warehouses: 3</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">RadiatorStock NZ</h1>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } pb-1`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`text-sm font-medium ${
                    activeTab === 'inventory'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } pb-1`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setActiveTab('stock')}
                  className={`text-sm font-medium ${
                    activeTab === 'stock'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } pb-1`}
                >
                  Stock
                </button>
                <button className="text-gray-400 text-sm font-medium cursor-not-allowed pb-1" disabled>
                  Customers (Coming Soon)
                </button>
                <button className="text-gray-400 text-sm font-medium cursor-not-allowed pb-1" disabled>
                  Sales (Coming Soon)
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {user?.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
