import React from 'react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';

const CustomerFilters = ({ filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={filters.search || ''}
            onChange={(value) => onFilterChange('search', value)}
            onClear={() => onFilterChange('search', '')}
            placeholder="Search customers..."
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
