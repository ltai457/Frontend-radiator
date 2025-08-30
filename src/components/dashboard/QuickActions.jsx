import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, BarChart3, Package } from 'lucide-react';
import { Button } from '../common/ui/Button';

const QuickActions = ({ onNavigate }) => {
  const { user } = useAuth();

  const actions = [
    {
      label: 'Create New Sale',
      icon: Plus,
      color: 'blue',
      onClick: () => onNavigate('sales')
    },
    {
      label: 'Manage Stock',
      icon: Package,
      color: 'indigo',
      onClick: () => onNavigate('stock')
    },
    {
      label: 'View Reports',
      icon: BarChart3,
      color: 'green',
      onClick: () => onNavigate('sales')
    },
    {
      label: 'Search Inventory',
      icon: Search,
      color: 'purple',
      onClick: () => onNavigate('inventory')
    }
  ];

  // Add customer action for admins
  if (user?.role === 'Admin') {
    actions.splice(1, 0, {
      label: 'Add New Customer',
      icon: Plus,
      color: 'emerald',
      onClick: () => onNavigate('customers')
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={action.onClick}
            icon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;