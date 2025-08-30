import React from 'react';
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { PageHeader } from '../common/layout/PageHeader';
import { StatsGrid } from '../common/layout/StatsGrid';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';

const DashboardOverview = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Today\'s Sales',
      value: '5',
      change: 12.5,
      color: 'blue',
      icon: ShoppingCart
    },
    {
      title: 'Revenue Today',
      value: '$2,450.75',
      change: 8.2,
      color: 'green',
      icon: TrendingUp
    },
    {
      title: 'Active Customers',
      value: '847',
      change: 2.1,
      color: 'purple',
      icon: Users
    },
    {
      title: 'Low Stock Items',
      value: '12',
      change: -5.4,
      color: 'yellow',
      icon: Package
    }
  ];

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
          <RecentActivity />
        </div>
      </div>

      <DashboardStats />
    </div>
  );
};

export default DashboardOverview;