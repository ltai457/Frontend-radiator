export const USER_ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff'
};

export const SALE_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded'
};

export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  EFTPOS: 'EFTPOS'
};

export const STOCK_LEVELS = {
  LOW_STOCK_THRESHOLD: 5,
  OUT_OF_STOCK: 0
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
};

export const API_ENDPOINTS = {
  CUSTOMERS: '/customers',
  SALES: '/sales',
  RADIATORS: '/radiators',
  WAREHOUSES: '/warehouses',
  AUTH: '/auth'
};

export const TABLE_COLUMNS = {
  CUSTOMERS: [
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'contact', label: 'Contact', sortable: false },
    { key: 'orders', label: 'Orders', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', sortable: true },
    { key: 'lastOrder', label: 'Last Order', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ],
  SALES: [
    { key: 'saleNumber', label: 'Sale Number', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items', sortable: false },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'payment', label: 'Payment', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ]
};
