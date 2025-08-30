import React from 'react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';

const RadiatorFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters, 
  radiators 
}) => {
  // Get unique brands and years for filter options
  const brands = [...new Set(radiators.map(r => r.brand))].sort();
  const years = [...new Set(radiators.map(r => r.year))].sort((a, b) => b - a);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={filters.search || ''}
            onChange={(value) => onFilterChange('search', value)}
            onClear={() => onFilterChange('search', '')}
            placeholder="Search radiators..."
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.brand || 'all'}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <select
            value={filters.year || 'all'}
            onChange={(e) => onFilterChange('year', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
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

export default RadiatorFilters;