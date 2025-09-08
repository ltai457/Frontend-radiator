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
      case 'sales':
        return <SalesManagement />;
      case 'customers':
        return <CustomerList />;
      case 'inventory':
        return <RadiatorList />;
      case 'stock':
        return <WarehouseStock />;
      case 'overview':
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
    </div>
  );
};

export default Dashboard;