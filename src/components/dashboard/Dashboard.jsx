// src/components/dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardNavigation from './DashboardNavigation';
import DashboardOverview from './DashboardOverview';
import CustomerList from '../customers/CustomerList';
import SalesManagement from '../sales/SalesManagement';
import RadiatorList from '../inventory/RadiatorList';
/* import WarehouseStock from '../warehouse/WarehouseStock'; */

// Check if we're in testing mode
const TESTING_MODE = true; // Should match the setting in AuthContext

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    if (TESTING_MODE) {
      // In testing mode, you might want to just show a message
      if (window.confirm('In testing mode. Do you want to go to the login page?')) {
        navigate('/login');
      }
      return;
    }
    
    logout();
    navigate('/login');
  };

  // Render different components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'sales':
        return <SalesManagement />;
      case 'customers':
        return <CustomerList />; // Fixed: was CustomerManagement
      case 'inventory':
        return <RadiatorList />;
      case 'warehouses':
        // Uncomment when WarehouseManagement component is available
        // return <WarehouseManagement />;
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Warehouse Management</h2>
            <p className="text-gray-600">Warehouse management component is under development.</p>
          </div>
        );
      case 'stock':
        // Uncomment when WarehouseStock component is available
        // return <WarehouseStock />;
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Stock Management</h2>
            <p className="text-gray-600">Stock management component is under development.</p>
          </div>
        );
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add padding-top if testing banner is shown */}
      <div className={TESTING_MODE ? "pt-8" : ""}>
        <DashboardHeader 
          user={user} 
          onLogout={handleLogout}
        />
        
        <DashboardNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>

        {/* Testing Mode Info Box */}
        {TESTING_MODE && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Testing Mode Active</p>
                <p className="text-xs mt-1">Authentication is disabled for testing. Set TESTING_MODE to false in App.jsx and AuthContext.jsx to enable authentication.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;