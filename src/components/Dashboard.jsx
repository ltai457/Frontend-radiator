// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RadiatorList from './RadiatorList';
import StockManager from './StockManager'; // NEW
import WarehouseStock from './WarehouseStock';
import SalesManager from './SalesManager';
import CustomersManager from './CustomersManager';

// Services for dashboard stats
import radiatorService from '../api/radiatorService';
import warehouseService from '../api/warehouseService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRadiators: 0,
    totalStock: 0,
    totalWarehouses: 0,
    lowStockItems: 0,
    loading: true
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [radiatorsResult, warehousesResult] = await Promise.all([
          radiatorService.getAll(),
          warehouseService.getAll()
        ]);

        let totalRadiators = 0;
        let totalStock = 0;
        let lowStockItems = 0;

        if (radiatorsResult.success) {
          totalRadiators = radiatorsResult.data.length;
          
          // Calculate total stock and low stock items
          radiatorsResult.data.forEach(radiator => {
            if (radiator.stock) {
              const radiatorTotal = Object.values(radiator.stock).reduce((sum, qty) => sum + qty, 0);
              totalStock += radiatorTotal;
              
              // Consider items with total stock < 5 as low stock
              if (radiatorTotal < 5 && radiatorTotal > 0) {
                lowStockItems++;
              }
            }
          });
        }

        setStats({
          totalRadiators,
          totalStock,
          totalWarehouses: warehousesResult.success ? warehousesResult.data.length : 0,
          lowStockItems,
          loading: false
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <RadiatorList />;
      case 'stock':
        return <WarehouseStock />;
      case 'sales':
        return <SalesManager />;
      case 'customers':
        return <CustomersManager />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Here's your business overview for today
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Radiators</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.loading ? '...' : stats.totalRadiators.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Stock Items</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.loading ? '...' : stats.totalStock.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.loading ? '...' : stats.lowStockItems}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Warehouses</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.loading ? '...' : stats.totalWarehouses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full text-left flex items-center p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    View All Radiators
                  </button>
                  <button
                    onClick={() => setActiveTab('stock')}
                    className="w-full text-left flex items-center p-3 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Manage Stock Levels
                  </button>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="w-full text-left flex items-center p-3 text-sm text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Process Sale
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                <div className="space-y-2">
                  {stats.loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : stats.lowStockItems > 0 ? (
                    <>
                      <div className="flex items-center text-sm text-yellow-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {stats.lowStockItems} items running low
                      </div>
                      <button
                        onClick={() => setActiveTab('stock')}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View stock details →
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      All items well stocked
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No recent sales</p>
                  <p className="text-sm text-gray-500">System last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Getting Started
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Welcome to RadiatorStock NZ! Start by managing your inventory, updating stock levels, 
                      and processing sales. Need help? Contact support at support@radiatorstock.co.nz
                    </p>
                  </div>
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
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`text-sm font-medium ${
                    activeTab === 'sales'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } pb-1`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`text-sm font-medium ${
                    activeTab === 'customers'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } pb-1`}
                >
                  Customers
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