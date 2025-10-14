// src/components/dashboard/Dashboard.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  Warehouse, Box, UserCog, Menu, X, LogOut,
  TrendingUp, ChevronRight, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Dashboard content components
import DashboardOverview from './DashboardOverview';
import CustomerList from '../customers/CustomerList';
import SalesManagement from '../sales/SalesManagement';
import InvoicesManagement from '../sales/InvoicesManagement';
import RadiatorList from '../inventory/RadiatorList';
import WarehouseManagement from '../warehouse/WarehouseManagement';
import StockManagement from '../stock/StockManagementPage';
import UserManagement from '../users/UserManagement';
import QuickInvoiceModal from '../sales/modals/QuickInvoiceModal';
import ReceiptModal from '../sales/modals/ReceiptModal';
import salesService from '../../api/salesService';
import { toast } from '../../utils/toast';

const TESTING_MODE = false; // Should match AuthContext

const navConfig = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'blue' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, color: 'green' },
  { id: 'invoices', label: 'Invoices', icon: FileText, color: 'teal' },
  { id: 'customers', label: 'Customers', icon: Users, color: 'purple' },
  { id: 'inventory', label: 'Inventory', icon: Package, color: 'orange' },
  { id: 'stock', label: 'Stock Management', icon: Box, color: 'indigo' },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse, color: 'cyan' },
];

const getColorClasses = (color, isActive) => {
  const colors = {
    blue: isActive ? 'bg-blue-50 text-blue-700 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
    green: isActive ? 'bg-green-50 text-green-700 border-green-700' : 'text-gray-600 hover:bg-green-50 hover:text-green-600',
    teal: isActive ? 'bg-teal-50 text-teal-700 border-teal-700' : 'text-gray-600 hover:bg-teal-50 hover:text-teal-600',
    purple: isActive ? 'bg-purple-50 text-purple-700 border-purple-700' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600',
    orange: isActive ? 'bg-orange-50 text-orange-700 border-orange-700' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600',
    indigo: isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
    cyan: isActive ? 'bg-cyan-50 text-cyan-700 border-cyan-700' : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600',
    red: isActive ? 'bg-red-50 text-red-700 border-red-700' : 'text-gray-600 hover:bg-red-50 hover:text-red-600',
  };
  return colors[color];
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Quick Invoice Modal States
  const [showQuickInvoice, setShowQuickInvoice] = useState(false);
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    data: null,
  });

  // Detect admin (matches your logic)
  const isAdmin =
    user?.role === 1 ||
    user?.role === '1' ||
    user?.role === 'Admin' ||
    user?.role === 'admin' ||
    (Array.isArray(user?.role) &&
      user.role.map(String).some((r) => r.toLowerCase() === 'admin' || r === '1'));

  // Dynamic nav with admin section
  const navItems = [
    ...navConfig,
    ...(isAdmin ?
      [{ id: 'users', label: 'User Management', icon: UserCog, color: 'red' }] : []),
  ];

  // Handle logout with testing mode
  const handleLogout = () => {
    if (TESTING_MODE) {
      if (window.confirm('In testing mode. Do you want to go to the login page?')) {
        navigate('/login');
      }
      return;
    }
    logout();
    navigate('/login');
  };

  // Handle quick invoice success
  const handleQuickInvoiceSuccess = async (sale) => {
    try {
      // Fetch receipt data
      const response = await salesService.getReceipt(sale.id);
      if (response.success) {
        setReceiptModal({
          isOpen: true,
          data: response.data,
        });
      }
    } catch (err) {
      console.error('Error fetching receipt:', err);
      toast.error('Invoice created but failed to show receipt');
    }
  };

  // Render actual tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'sales':
        return (
          <SalesManagement
            onQuickInvoice={() => setShowQuickInvoice(true)}
          />
        );
      case 'invoices':
        return <InvoicesManagement />;
      case 'customers':
        return <CustomerList />;
      case 'inventory':
        return <RadiatorList />;
      case 'warehouses':
        return <WarehouseManagement />;
      case 'stock':
        return <StockManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  // User profile initials (fallback if no user)
  const userInitials = user?.username 
    ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Chan Mary 333</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'border-l-4' : 'border-l-4 border-transparent'
                } ${getColorClasses(item.color, isActive)}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {userInitials}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : (user?.role || 'User')}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {navItems.find(item => item.id === activeTab)?.label || 'Overview'}
            </h1>
            <p className="text-sm text-gray-500">Manage your radiator inventory and sales</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              System Online
            </div>
          </div>
        </header>

        {/* Real Content Area */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Quick Invoice Modal */}
      <QuickInvoiceModal
        isOpen={showQuickInvoice}
        onClose={() => setShowQuickInvoice(false)}
        onSuccess={handleQuickInvoiceSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, data: null })}
        receipt={receiptModal.data}
      />

      {/* Testing Mode Info Box */}
      {TESTING_MODE && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg max-w-xs z-50">
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
  );
};

export default Dashboard;
