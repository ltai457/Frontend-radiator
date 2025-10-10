import React from 'react';
import { ShoppingCart, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { StatsGrid } from '../common/layout/StatsGrid';
import { formatCurrency } from '../../utils/formatters';

const SalesStats = ({ sales }) => {
  const completedSales = sales.filter(sale => sale.status === 'Completed');
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const averageSale = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  const stats = [
    {
      title: 'Total Sales',
      value: sales.length.toString(),
      color: 'blue',
      icon: ShoppingCart
    }/* ,
    {
      title: 'Completed',
      value: completedSales.length.toString(),
      color: 'green',
      icon: CheckCircle
    },
    {
      title: 'Revenue',
      value: formatCurrency(totalRevenue),
      color: 'purple',
      icon: DollarSign
    },
    {
      title: 'Avg. Sale',
      value: formatCurrency(averageSale),
      color: 'orange',
      icon: TrendingUp
    } */
  ];

  return <StatsGrid stats={stats} columns={4} />;
};

export default SalesStats;