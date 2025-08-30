import { useState, useMemo } from 'react';
import { paginateArray } from '../utils/helpers';
import { PAGINATION } from '../utils/constants';

export const usePagination = (data = [], initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedData = useMemo(() => {
    return paginateArray(data, currentPage, pageSize);
  }, [data, currentPage, pageSize]);

  const goToPage = (page) => {
    if (page >= 1 && page <= paginatedData.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(paginatedData.totalPages);
  const goToNextPage = () => {
    if (paginatedData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };
  const goToPreviousPage = () => {
    if (paginatedData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset to first page when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    ...paginatedData,
    pageSize,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize
  };
};