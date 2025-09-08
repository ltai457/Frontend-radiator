// src/components/warehouse/components/StockStats.jsx
import React from 'react';
import { Package, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const StockStats = ({ items, warehouse, className = '' }) => {
  const stats = React.useMemo(() => {
    const totalItems = items.length;
    const inStock = items.filter(item => (item.qty || 0) > 5).length;
    const lowStock = items.filter(item => {
      const qty = item.qty || 0;
      return qty > 0 && qty <= 5;
    }).length;
    const outOfStock = items.filter(item => (item.qty || 0) === 0).length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalQuantity
    };
  }, [items]);

  const statItems = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'blue'
    },
    {
      label: 'In Stock',
      value: stats.inStock,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      icon: TrendingDown,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{warehouse.name} Stats</h3>
        <p className="text-sm text-gray-600 mt-1">Stock overview for {warehouse.code}</p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Total Quantity */}
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</div>
          <div className="text-sm text-gray-600">Total Units</div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Health indicator */}
        {stats.totalItems > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stock Health</span>
              <span className={`font-medium ${
                stats.outOfStock === 0 && stats.lowStock <= stats.totalItems * 0.1
                  ? 'text-green-600'
                  : stats.outOfStock <= stats.totalItems * 0.1
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {stats.outOfStock === 0 && stats.lowStock <= stats.totalItems * 0.1
                  ? 'Good'
                  : stats.outOfStock <= stats.totalItems * 0.1
                  ? 'Needs Attention'
                  : 'Critical'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockStats;