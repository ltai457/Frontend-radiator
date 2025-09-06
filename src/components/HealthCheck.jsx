// src/components/HealthCheck.jsx
import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import authService from '../api/authService';

export default function HealthCheck() {
  const [health, setHealth] = useState({
    status: 'checking',
    api: null,
    database: null,
    timestamp: null,
    error: null
  });

  const checkHealth = async () => {
    try {
      setHealth(prev => ({ ...prev, status: 'checking' }));
      
      const result = await authService.testConnection();
      
      if (result.success) {
        setHealth({
          status: 'healthy',
          api: result.data.status,
          database: result.data.checks?.find(c => c.name === 'database')?.status || 'unknown',
          timestamp: result.data.timestamp,
          error: null
        });
      } else {
        setHealth({
          status: 'unhealthy',
          api: 'unhealthy',
          database: 'unknown',
          timestamp: new Date().toISOString(),
          error: result.error
        });
      }
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        api: 'unhealthy',
        database: 'unknown',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'checking':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(health.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(health.status)}
          <h3 className="font-medium">System Health</h3>
        </div>
        <button
          onClick={checkHealth}
          className="text-sm px-3 py-1 rounded border hover:bg-white/50 transition-colors"
          disabled={health.status === 'checking'}
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>API Server:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(health.api)}
            <span className="font-medium">{health.api || 'unknown'}</span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span>Database:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(health.database)}
            <span className="font-medium">{health.database || 'unknown'}</span>
          </div>
        </div>
        
        {health.timestamp && (
          <div className="flex justify-between">
            <span>Last Check:</span>
            <span className="font-medium">
              {new Date(health.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {health.error && (
          <div className="mt-3 p-2 bg-white/50 rounded border">
            <div className="font-medium text-red-600">Error:</div>
            <div className="text-xs">{health.error}</div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t text-xs opacity-75">
        <div>API Base: {import.meta.env.VITE_API_BASE || 'http://localhost:5128/api/v1'}</div>
        <div>Environment: {import.meta.env.MODE}</div>
      </div>
    </div>
  );
}