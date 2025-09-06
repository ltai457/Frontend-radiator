import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const RecentActivity = ({ sales = [], customers = [] }) => {
  // Generate real activities from actual data
  const generateActivities = () => {
    const activities = [];

    // Add recent sales (last 5)
    const recentSales = sales
      .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
      .slice(0, 3);

    recentSales.forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        message: sale.status === 'Completed' ? 'Sale completed' : 
                 sale.status === 'Cancelled' ? 'Sale cancelled' :
                 sale.status === 'Refunded' ? 'Sale refunded' : 'Sale created',
        details: `${sale.customerName} - ${formatCurrency(sale.totalAmount)}`,
        time: new Date(sale.saleDate),
        color: sale.status === 'Completed' ? 'blue' : 
               sale.status === 'Cancelled' ? 'red' :
               sale.status === 'Refunded' ? 'orange' : 'gray'
      });
    });

    // Add recent customers (last 2)
    const recentCustomers = customers
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 2);

    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        message: 'New customer added',
        details: `${customer.firstName} ${customer.lastName}${customer.company ? ` - ${customer.company}` : ''}`,
        time: new Date(customer.createdAt || Date.now()),
        color: 'purple'
      });
    });

    // Sort all activities by time (most recent first)
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6); // Show max 6 activities
  };

  const activities = generateActivities();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case 'customer':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'stock':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (time) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as you use the system</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.details}</p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {formatTimeAgo(activity.time)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;