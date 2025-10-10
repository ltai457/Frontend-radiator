import React from 'react';
import { Button } from '../common/ui/Button';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Chan Mary 333</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.username}</span>
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {user?.role}
              </span>
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;