import React from 'react';
import { Users, UserCheck, ShoppingCart, DollarSign } from 'lucide-react';
import { StatsGrid } from '../common/layout/StatsGrid';
import { formatCurrency } from '../../utils/formatters';

const CustomerStats = ({ customers }) => {
  const stats = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      color: 'blue',
      icon: Users
    },
    {
      title: 'Active Customers',
      value: customers.filter(c => c.isActive).length.toString(),
      color: 'green',
      icon: UserCheck
    },
    {
      title: 'Total Orders',
      value: customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0).toString(),
      color: 'yellow',
      icon: ShoppingCart
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)),
      color: 'purple',
      icon: DollarSign
    }
  ];

  return <StatsGrid stats={stats} columns={4} />;
};

export default CustomerStats;