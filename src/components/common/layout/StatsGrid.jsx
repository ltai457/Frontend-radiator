import React from 'react';

export const StatsGrid = ({ stats, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold ${colors[color]}`}>
            {value}
          </div>
          <div className="text-sm text-gray-600">{title}</div>
          {change && (
            <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 ${colors[color].replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
};