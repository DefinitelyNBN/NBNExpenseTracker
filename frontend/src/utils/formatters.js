/**
 * Currency formatter for INR
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }

  // Use Indian number format with lakh/crore system
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

/**
 * Format currency without symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date in a readable format
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return dateObj.toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format date for form inputs (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toISOString().split('T')[0];
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 1) {
    return `In ${diffDays} days`;
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} total - Total value for percentage calculation
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, total) => {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return '0%';
  }

  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format billing frequency
 * @param {string} frequency - Billing frequency ('monthly' or 'yearly')
 * @returns {string} Formatted frequency string
 */
export const formatBillingFrequency = (frequency) => {
  switch (frequency) {
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return frequency;
  }
};

/**
 * Format category name
 * @param {string} category - Category name
 * @returns {string} Formatted category name
 */
export const formatCategory = (category) => {
  if (!category) return '';
  
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format large numbers with K, L, Cr suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number with suffix
 */
export const formatLargeNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  if (num >= 10000000) { // 1 crore
    return `${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) { // 1 lakh
    return `${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) { // 1 thousand
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

/**
 * Get color class based on amount and budget
 * @param {number} amount - Current amount
 * @param {number} budget - Budget limit
 * @returns {string} Color class
 */
export const getColorForBudget = (amount, budget) => {
  if (!budget || budget === 0) return 'text-gray-600';
  
  const percentage = (amount / budget) * 100;
  
  if (percentage >= 100) {
    return 'text-red-600';
  } else if (percentage >= 80) {
    return 'text-yellow-600';
  } else {
    return 'text-green-600';
  }
};

/**
 * Get color class for subscription due date
 * @param {string|Date} dueDate - Due date
 * @returns {string} Color class
 */
export const getColorForDueDate = (dueDate) => {
  if (!dueDate) return 'text-gray-600';
  
  const dateObj = new Date(dueDate);
  if (isNaN(dateObj.getTime())) return 'text-gray-600';

  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'text-red-600'; // Overdue
  } else if (diffDays <= 3) {
    return 'text-yellow-600'; // Due soon
  } else if (diffDays <= 7) {
    return 'text-blue-600'; // Due this week
  } else {
    return 'text-green-600'; // Due later
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 * @param {string} name - Name to get initials from
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random color for categories
 * @param {string} category - Category name
 * @returns {string} Color class
 */
export const getCategoryColor = (category) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
};