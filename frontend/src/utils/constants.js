// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  DASHBOARD: '/dashboard',
  SUBSCRIPTIONS: '/subscriptions',
  EXPENSES: '/expenses',
  BUDGETS: '/budgets',
  ANALYTICS: '/analytics',
  EXPORT: '/export',
};

// Billing frequencies
export const BILLING_FREQUENCIES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const BILLING_FREQUENCY_OPTIONS = [
  { value: BILLING_FREQUENCIES.MONTHLY, label: 'Monthly' },
  { value: BILLING_FREQUENCIES.YEARLY, label: 'Yearly' },
];

// Expense categories
export const EXPENSE_CATEGORIES = {
  ENTERTAINMENT: 'entertainment',
  UTILITIES: 'utilities',
  FOOD: 'food',
  TRANSPORT: 'transport',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  SHOPPING: 'shopping',
  SUBSCRIPTIONS: 'subscriptions',
  OTHER: 'other',
};

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: EXPENSE_CATEGORIES.ENTERTAINMENT, label: 'Entertainment' },
  { value: EXPENSE_CATEGORIES.UTILITIES, label: 'Utilities' },
  { value: EXPENSE_CATEGORIES.FOOD, label: 'Food & Dining' },
  { value: EXPENSE_CATEGORIES.TRANSPORT, label: 'Transport' },
  { value: EXPENSE_CATEGORIES.HEALTHCARE, label: 'Healthcare' },
  { value: EXPENSE_CATEGORIES.EDUCATION, label: 'Education' },
  { value: EXPENSE_CATEGORIES.SHOPPING, label: 'Shopping' },
  { value: EXPENSE_CATEGORIES.SUBSCRIPTIONS, label: 'Subscriptions' },
  { value: EXPENSE_CATEGORIES.OTHER, label: 'Other' },
];

// Budget types
export const BUDGET_TYPES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const BUDGET_TYPE_OPTIONS = [
  { value: BUDGET_TYPES.MONTHLY, label: 'Monthly' },
  { value: BUDGET_TYPES.YEARLY, label: 'Yearly' },
];

// Common expense tags
export const COMMON_EXPENSE_TAGS = [
  'groceries',
  'fuel',
  'rent',
  'bills',
  'medical',
  'dining',
  'shopping',
  'travel',
  'insurance',
  'maintenance',
  'education',
  'entertainment',
  'gifts',
  'charity',
  'investment',
  'emergency',
  'home',
  'personal',
  'business',
  'recurring',
];

// Chart colors
export const CHART_COLORS = [
  '#0ea5e9', // Primary blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
];

// Default values
export const DEFAULT_VALUES = {
  CURRENCY: 'INR',
  ALERT_DAYS_BEFORE_DUE: 7,
  PAGINATION_LIMIT: 50,
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  PREFERENCES: 'preferences',
  AUTH_TOKEN: 'token',
  DASHBOARD_CACHE: 'dashboard_cache',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
};

// Toast messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    SUBSCRIPTION_CREATED: 'Subscription created successfully!',
    SUBSCRIPTION_UPDATED: 'Subscription updated successfully!',
    SUBSCRIPTION_DELETED: 'Subscription deleted successfully!',
    EXPENSE_CREATED: 'Expense added successfully!',
    EXPENSE_UPDATED: 'Expense updated successfully!',
    EXPENSE_DELETED: 'Expense deleted successfully!',
    BUDGET_CREATED: 'Budget created successfully!',
    BUDGET_UPDATED: 'Budget updated successfully!',
    BUDGET_DELETED: 'Budget deleted successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!',
    DATA_EXPORTED: 'Data exported successfully!',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    SUBSCRIPTION_LOAD: 'Failed to load subscriptions.',
    EXPENSE_LOAD: 'Failed to load expenses.',
    BUDGET_LOAD: 'Failed to load budgets.',
    DASHBOARD_LOAD: 'Failed to load dashboard data.',
    INVALID_DATE: 'Please enter a valid date.',
    INVALID_AMOUNT: 'Please enter a valid amount.',
    REQUIRED_FIELDS: 'Please fill in all required fields.',
  },
};

// Form validation rules
export const VALIDATION_RULES = {
  SUBSCRIPTION_NAME: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  SUBSCRIPTION_COST: {
    required: true,
    min: 0.01,
    max: 10000000,
  },
  EXPENSE_AMOUNT: {
    required: true,
    min: 0.01,
    max: 10000000,
  },
  BUDGET_LIMIT: {
    required: true,
    min: 1,
    max: 100000000,
  },
  NOTES: {
    maxLength: 500,
  },
  TAGS: {
    maxLength: 50,
    maxCount: 10,
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Screen breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
};

// Sorting options
export const SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  AMOUNT_ASC: 'amount_asc',
  AMOUNT_DESC: 'amount_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
};

// Filter options
export const FILTER_OPTIONS = {
  TIME_RANGES: [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ],
};

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
};

// Feature flags
export const FEATURE_FLAGS = {
  DARK_MODE: true,
  EXPORT_DATA: true,
  PUSH_NOTIFICATIONS: true,
  ADVANCED_ANALYTICS: true,
  MULTI_CURRENCY: false,
  BULK_OPERATIONS: true,
};

// App metadata
export const APP_METADATA = {
  NAME: 'NBNTracker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Smart Subscription and Expense Manager',
  AUTHOR: 'NBN Team',
  SUPPORT_EMAIL: 'support@nbntracker.com',
};