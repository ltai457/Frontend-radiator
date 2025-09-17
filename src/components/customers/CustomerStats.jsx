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
    
  ];

  return <StatsGrid stats={stats} columns={2} />;
};

export default CustomerStats;