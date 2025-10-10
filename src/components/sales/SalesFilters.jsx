import React from 'react';
import { Filter } from 'lucide-react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';
import { useModal } from '../../hooks/useModal';

const SalesFilters = ({ filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
  const advancedFilters = useModal();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={filters.search || ''}
            onChange={(value) => onFilterChange('search', value)}
            onClear={() => onFilterChange('search', '')}
            placeholder="Search by sale number, customer, or staff..."
          />
        </div>
        
        <div className="flex gap-2">
          
          
          <Button
            variant="outline"
            onClick={advancedFilters.toggleModal}
            icon={Filter}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {advancedFilters.isOpen && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => onFilterChange('dateRange', { 
                ...filters.dateRange, 
                start: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => onFilterChange('dateRange', { 
                ...filters.dateRange, 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesFilters;