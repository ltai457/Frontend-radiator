import React from 'react';
import { BarChart3, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';

const DashboardStats = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">System Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={Package}
          title="Inventory Management"
          description="Track radiators, brands, codes, and specifications across all locations."
          color="blue"
        />
        <FeatureCard
          icon={BarChart3}
          title="Multi-Warehouse Stock"
          description="Real-time stock levels across Auckland, Christchurch, and Wellington."
          color="green"
        />
        <FeatureCard
          icon={Users}
          title="Customer Management"
          description="Complete customer profiles with purchase history and contact details."
          color="purple"
        />
        <FeatureCard
          icon={ShoppingCart}
          title="Sales & Receipts"
          description="Process sales, generate receipts, and track revenue with GST calculation."
          color="yellow"
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3 ${colorClasses[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default DashboardStats;