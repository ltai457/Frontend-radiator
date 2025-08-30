import { useState, useMemo, useCallback } from 'react';
import { filterArray, sortArray, debounce } from '../utils/helpers';

export const useFilters = (data = [], initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  // Debounced search to avoid too many re-renders
  const debouncedSetFilter = useMemo(
    () => debounce((key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    }, 300),
    []
  );

  const setFilter = useCallback((key, value) => {
    if (key === 'search') {
      debouncedSetFilter(key, value);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, [debouncedSetFilter]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSortConfig({ key: '', direction: 'asc' });
  }, [initialFilters]);

  const setSorting = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = filterArray(data, filters);
    
    if (sortConfig.key) {
      result = sortArray(result, sortConfig.key, sortConfig.direction);
    }
    
    return result;
  }, [data, filters, sortConfig]);

  return {
    filters,
    sortConfig,
    filteredData: filteredAndSortedData,
    setFilter,
    clearFilters,
    setSorting,
    hasActiveFilters: Object.values(filters).some(value => 
      value && value !== 'all' && value !== ''
    )
  };
};