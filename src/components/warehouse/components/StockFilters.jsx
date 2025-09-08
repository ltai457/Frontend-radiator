// src/components/warehouse/components/StockFilters.jsx
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../../common/ui/Button';

const StockFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters, 
  radiators 
}) => {
  // Get unique brands from radiators
  const brands = React.useMemo(() => {
    const uniqueBrands = [...new Set(radiators.map(r => r.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [radiators]);

  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Brand Filter */}
        <div className="min-w-40">
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="min-w-40">
          <select
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock (5+)</option>
            <option value="low-stock">Low Stock (1-5)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
            <div className="flex gap-2 flex-wrap">
              {filters.search && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.brand !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Brand: {filters.brand}
                </span>
              )}
              {filters.stockStatus !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Status: {filters.stockStatus.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockFilters;