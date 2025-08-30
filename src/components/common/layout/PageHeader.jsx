import React from 'react';

export const PageHeader = ({ 
  title, 
  subtitle,
  icon: Icon,
  actions,
  children 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-6 h-6 text-blue-600" />}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};
