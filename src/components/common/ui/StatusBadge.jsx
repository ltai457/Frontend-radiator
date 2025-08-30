import React from 'react';

export const StatusBadge = ({ status, variant = 'default' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  const statusVariants = {
    'Active': 'success',
    'Completed': 'success',
    'Inactive': 'error',
    'Cancelled': 'error',
    'Pending': 'warning',
    'Refunded': 'info'
  };
  
  const badgeVariant = statusVariants[status] || variant;
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[badgeVariant]}`}>
      {status}
    </span>
  );
};