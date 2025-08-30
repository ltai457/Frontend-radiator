export const formatCurrency = (amount, currency = 'NZD', locale = 'en-NZ') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Never';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-NZ', {
    ...defaultOptions,
    ...options
  });
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (number, locale = 'en-NZ') => {
  if (number === null || number === undefined) return '0';
  
  return new Intl.NumberFormat(locale).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  return `${Number(value).toFixed(decimals)}%`;
};