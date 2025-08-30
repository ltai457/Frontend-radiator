export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const sortArray = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = key.includes('.') ? getNestedValue(a, key) : a[key];
    let bVal = key.includes('.') ? getNestedValue(b, key) : b[key];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    
    // Handle different data types
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const filterArray = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      
      const itemValue = key.includes('.') ? getNestedValue(item, key) : item[key];
      
      if (typeof value === 'string') {
        return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

export const paginateArray = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: array.slice(startIndex, endIndex),
    totalItems: array.length,
    totalPages: Math.ceil(array.length / pageSize),
    currentPage: page,
    hasNextPage: endIndex < array.length,
    hasPreviousPage: page > 1
  };
};

export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && checkDate < start) return false;
  if (end && checkDate > end) return false;
  
  return true;
};