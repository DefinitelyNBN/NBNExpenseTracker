import { format, parseISO, isValid, differenceInDays, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { EXPENSE_CATEGORIES, BILLING_FREQUENCIES, STORAGE_KEYS } from './constants';

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Generate a random UUID
 * @returns {string} Random UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Calculate next due date for a subscription
 * @param {Date} currentDate - Current due date
 * @param {string} frequency - Billing frequency
 * @returns {Date} Next due date
 */
export const calculateNextDueDate = (currentDate, frequency) => {
  const date = new Date(currentDate);
  
  if (frequency === BILLING_FREQUENCIES.MONTHLY) {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === BILLING_FREQUENCIES.YEARLY) {
    date.setFullYear(date.getFullYear() + 1);
  }
  
  return date;
};

/**
 * Calculate days until due date
 * @param {Date|string} dueDate - Due date
 * @returns {number} Days until due (negative if overdue)
 */
export const calculateDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return differenceInDays(due, today);
};

/**
 * Check if a subscription is due soon
 * @param {Date|string} dueDate - Due date
 * @param {number} alertDays - Days before due to alert
 * @returns {boolean} True if due soon
 */
export const isSubscriptionDueSoon = (dueDate, alertDays = 7) => {
  const daysUntilDue = calculateDaysUntilDue(dueDate);
  return daysUntilDue >= 0 && daysUntilDue <= alertDays;
};

/**
 * Calculate yearly cost from monthly cost
 * @param {number} monthlyCost - Monthly cost
 * @returns {number} Yearly cost
 */
export const calculateYearlyCost = (monthlyCost) => {
  return monthlyCost * 12;
};

/**
 * Calculate monthly cost from yearly cost
 * @param {number} yearlyCost - Yearly cost
 * @returns {number} Monthly cost
 */
export const calculateMonthlyCost = (yearlyCost) => {
  return yearlyCost / 12;
};

/**
 * Get date range for a given period
 * @param {string} period - Period type (today, this_week, this_month, etc.)
 * @returns {object} Object with start and end dates
 */
export const getDateRange = (period) => {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: today
      };
    
    case 'this_week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return {
        start: startOfWeek,
        end: endOfWeek
      };
    
    case 'this_month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today)
      };
    
    case 'this_year':
      return {
        start: startOfYear(today),
        end: endOfYear(today)
      };
    
    case 'last_30_days':
      return {
        start: addDays(today, -30),
        end: today
      };
    
    case 'last_90_days':
      return {
        start: addDays(today, -90),
        end: today
      };
    
    default:
      return {
        start: today,
        end: today
      };
  }
};

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expenses
 * @returns {object} Expenses grouped by category
 */
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {});
};

/**
 * Calculate total expenses by category
 * @param {Array} expenses - Array of expenses
 * @returns {object} Total amount by category
 */
export const calculateTotalsByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});
};

/**
 * Sort array by multiple criteria
 * @param {Array} array - Array to sort
 * @param {Array} sortBy - Array of sort criteria
 * @returns {Array} Sorted array
 */
export const multiSort = (array, sortBy) => {
  return array.sort((a, b) => {
    for (const criterion of sortBy) {
      const { key, direction = 'asc' } = criterion;
      const aValue = getNestedValue(a, key);
      const bValue = getNestedValue(b, key);
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Get nested value from object using dot notation
 * @param {object} obj - Object to get value from
 * @param {string} path - Path to value (e.g., 'user.name')
 * @returns {any} Value at path
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Set nested value in object using dot notation
 * @param {object} obj - Object to set value in
 * @param {string} path - Path to value (e.g., 'user.name')
 * @param {any} value - Value to set
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

/**
 * Filter array by multiple criteria
 * @param {Array} array - Array to filter
 * @param {object} filters - Filter criteria
 * @returns {Array} Filtered array
 */
export const multiFilter = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      const itemValue = getNestedValue(item, key);
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === 'string') {
        return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

/**
 * Calculate percentage of budget used
 * @param {number} spent - Amount spent
 * @param {number} budget - Budget limit
 * @returns {number} Percentage (0-100)
 */
export const calculateBudgetPercentage = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

/**
 * Get budget status
 * @param {number} spent - Amount spent
 * @param {number} budget - Budget limit
 * @returns {string} Status (safe, warning, danger)
 */
export const getBudgetStatus = (spent, budget) => {
  const percentage = calculateBudgetPercentage(spent, budget);
  
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'safe';
};

/**
 * Generate savings suggestions
 * @param {Array} subscriptions - Array of subscriptions
 * @param {Array} expenses - Array of expenses
 * @returns {Array} Array of suggestions
 */
export const generateSavingsSuggestions = (subscriptions, expenses) => {
  const suggestions = [];
  
  // Find expensive subscriptions
  const expensiveSubscriptions = subscriptions.filter(sub => 
    sub.is_active && sub.cost > 500
  );
  
  if (expensiveSubscriptions.length > 0) {
    const totalSavings = expensiveSubscriptions.reduce((sum, sub) => 
      sum + (sub.billing_frequency === 'monthly' ? sub.cost * 12 : sub.cost), 0
    );
    suggestions.push(`Consider reviewing ${expensiveSubscriptions.length} expensive subscriptions to save up to ₹${totalSavings.toFixed(0)} annually`);
  }
  
  // Find high-spending categories
  const categoryTotals = calculateTotalsByCategory(expenses);
  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > totalExpenses * 0.3) {
      suggestions.push(`Consider reducing spending on ${category} where you've spent ₹${amount.toFixed(0)} this year`);
    }
  });
  
  return suggestions;
};

/**
 * Validate form data
 * @param {object} data - Form data
 * @param {object} rules - Validation rules
 * @returns {object} Validation result
 */
export const validateFormData = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    if (value && rule.minLength && value.toString().length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
      return;
    }
    
    if (value && rule.min && parseFloat(value) < rule.min) {
      errors[field] = `${field} must be at least ${rule.min}`;
      return;
    }
    
    if (value && rule.max && parseFloat(value) > rule.max) {
      errors[field] = `${field} must be no more than ${rule.max}`;
      return;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

/**
 * Request notification permission
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const notification = new Notification(title, {
    ...options
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
};

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - File name
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Scroll to element
 * @param {string} elementId - Element ID
 * @param {object} options - Scroll options
 */
export const scrollToElement = (elementId, options = {}) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }
};