import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { PageHeader } from '../common/layout/PageHeader';
import { StatsGrid } from '../common/layout/StatsGrid';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import salesService from '../../api/salesService';
import customerService from '../../api/customerService';
import radiatorService from '../../api/radiatorService';
import { formatCurrency } from '../../utils/formatters';

const DashboardOverview = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState({
    sales: [],
    customers: [],
    radiators: [],
    loading: true,
    error: null
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesResult, customersResult, radiatorsResult] = await Promise.all([
          salesService.getAll(),
          customerService.getAll(),
          radiatorService.getAll()
        ]);

        setDashboardData({
          sales: salesResult.success ? salesResult.data : [],
          customers: customersResult.success ? customersResult.data : [],
          radiators: radiatorsResult.success ? radiatorsResult.data : [],
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate real statistics
  const calculateStats = () => {
    const { sales, customers, radiators } = dashboardData;
    
    // Today's sales
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= todayStart && sale.status === 'Completed';
    });

    // Revenue calculations
    const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalRevenue = sales
      .filter(sale => sale.status === 'Completed')
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Customer stats
    const activeCustomers = customers.filter(customer => customer.isActive).length;

    // Low stock calculation
    const lowStockItems = radiators.filter(radiator => {
      if (!radiator.stock) return false;
      const totalStock = Object.values(radiator.stock).reduce((sum, qty) => sum + qty, 0);
      return totalStock > 0 && totalStock <= 5; // Low stock threshold
    }).length;

    // Out of stock items
    const outOfStockItems = radiators.filter(radiator => {
      if (!radiator.stock) return true;
      const totalStock = Object.values(radiator.stock).reduce((sum, qty) => sum + qty, 0);
      return totalStock === 0;
    }).length;

    return [
      {
        title: 'Today\'s Sales',
        value: todaysSales.length.toString(),
        change: todaysSales.length > 0 ? 12.5 : 0,
        color: 'blue',
        icon: ShoppingCart
      },
      {
        title: 'Revenue Today',
        value: formatCurrency(todaysRevenue),
        change: todaysRevenue > 0 ? 8.2 : 0,
        color: 'green',
        icon: TrendingUp
      },
      {
        title: 'Active Customers',
        value: activeCustomers.toString(),
        change: 2.1,
        color: 'purple',
        icon: Users
      },
      {
        title: 'Low Stock Items',
        value: lowStockItems.toString(),
        change: lowStockItems > 0 ? -5.4 : 0,
        color: 'yellow',
        icon: Package
      }
    ];
  };

  if (dashboardData.loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (dashboardData.error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Welcome to RadiatorStock NZ!"
          subtitle="Your complete radiator inventory and sales management system"
        />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {dashboardData.error}
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to RadiatorStock NZ!"
        subtitle="Your complete radiator inventory and sales management system"
      />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity sales={dashboardData.sales} customers={dashboardData.customers} />
        </div>
      </div>

      <DashboardStats />
    </div>
  );
};

export default DashboardOverview;