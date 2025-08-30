import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';

const StockFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters, 
  selectedWarehouse 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {selectedWarehouse?.name || 'Warehouse'} — Stock Levels
        </h4>
        {hasActiveFilters && (
          <span className="text-sm text-gray-500">Filtered results</span>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={filters.search || ''}
            onChange={(value) => onFilterChange('search', value)}
            onClear={() => onFilterChange('search', '')}
            placeholder="Search products, brands, or codes..."
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.stockLevel || 'all'}
            onChange={(e) => onFilterChange('stockLevel', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="available">Available (&gt;0)</option>
            <option value="good">Good Stock (&gt;5)</option>
            <option value="low">Low Stock (1-5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant={filters.stockLevel === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('stockLevel', 'all')}
        >
          All Items
        </Button>
        <Button
          variant={filters.stockLevel === 'good' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('stockLevel', 'good')}
        >
          Good Stock
        </Button>
        <Button
          variant={filters.stockLevel === 'low' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('stockLevel', 'low')}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low Stock
        </Button>
        <Button
          variant={filters.stockLevel === 'out' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('stockLevel', 'out')}
        >
          Out of Stock
        </Button>
      </div>
    </div>
  );
};

export default StockFilters;