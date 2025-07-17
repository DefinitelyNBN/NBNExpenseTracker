import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // Dashboard data
  dashboardData: {
    total_yearly_projection: 0,
    current_monthly_spending: 0,
    current_yearly_spending: 0,
    category_breakdown: {},
    upcoming_subscriptions: [],
    budget_alerts: [],
    savings_suggestions: []
  },
  
  // Subscriptions
  subscriptions: [],
  
  // Expenses
  expenses: [],
  
  // Budgets
  budgets: [],
  
  // UI state
  loading: false,
  error: null,
  
  // User preferences
  preferences: {
    dark_mode: false,
    notifications_enabled: true,
    alert_days_before_due: 7,
    currency: 'INR'
  }
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  DELETE_SUBSCRIPTION: 'DELETE_SUBSCRIPTION',
  SET_EXPENSES: 'SET_EXPENSES',
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  SET_BUDGETS: 'SET_BUDGETS',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  SET_PREFERENCES: 'SET_PREFERENCES',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_DASHBOARD_DATA:
      return { ...state, dashboardData: action.payload };
    
    case actionTypes.SET_SUBSCRIPTIONS:
      return { ...state, subscriptions: action.payload };
    
    case actionTypes.ADD_SUBSCRIPTION:
      return { 
        ...state, 
        subscriptions: [...state.subscriptions, action.payload] 
      };
    
    case actionTypes.UPDATE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === action.payload.id ? action.payload : sub
        )
      };
    
    case actionTypes.DELETE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.filter(sub => sub.id !== action.payload)
      };
    
    case actionTypes.SET_EXPENSES:
      return { ...state, expenses: action.payload };
    
    case actionTypes.ADD_EXPENSE:
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses] 
      };
    
    case actionTypes.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(exp =>
          exp.id === action.payload.id ? action.payload : exp
        )
      };
    
    case actionTypes.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(exp => exp.id !== action.payload)
      };
    
    case actionTypes.SET_BUDGETS:
      return { ...state, budgets: action.payload };
    
    case actionTypes.ADD_BUDGET:
      return { 
        ...state, 
        budgets: [...state.budgets, action.payload] 
      };
    
    case actionTypes.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        )
      };
    
    case actionTypes.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload)
      };
    
    case actionTypes.SET_PREFERENCES:
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function to handle API errors
  const handleError = (error, customMessage) => {
    const message = customMessage || error.response?.data?.detail || error.message || 'An error occurred';
    dispatch({ type: actionTypes.SET_ERROR, payload: message });
    toast.error(message);
  };

  // Dashboard actions
  const fetchDashboardData = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.get('/dashboard');
      dispatch({ type: actionTypes.SET_DASHBOARD_DATA, payload: response.data });
    } catch (error) {
      handleError(error, 'Failed to fetch dashboard data');
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Subscription actions
  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      dispatch({ type: actionTypes.SET_SUBSCRIPTIONS, payload: response.data });
    } catch (error) {
      handleError(error, 'Failed to fetch subscriptions');
    }
  };

  const createSubscription = async (subscriptionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.post('/subscriptions', subscriptionData);
      dispatch({ type: actionTypes.ADD_SUBSCRIPTION, payload: response.data });
      toast.success('Subscription created successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create subscription');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateSubscription = async (id, subscriptionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.put(`/subscriptions/${id}`, subscriptionData);
      dispatch({ type: actionTypes.UPDATE_SUBSCRIPTION, payload: response.data });
      toast.success('Subscription updated successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update subscription');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteSubscription = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      await api.delete(`/subscriptions/${id}`);
      dispatch({ type: actionTypes.DELETE_SUBSCRIPTION, payload: id });
      toast.success('Subscription deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete subscription');
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Expense actions
  const fetchExpenses = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/expenses?${params.toString()}`);
      dispatch({ type: actionTypes.SET_EXPENSES, payload: response.data });
    } catch (error) {
      handleError(error, 'Failed to fetch expenses');
    }
  };

  const createExpense = async (expenseData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.post('/expenses', expenseData);
      dispatch({ type: actionTypes.ADD_EXPENSE, payload: response.data });
      toast.success('Expense created successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create expense');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.put(`/expenses/${id}`, expenseData);
      dispatch({ type: actionTypes.UPDATE_EXPENSE, payload: response.data });
      toast.success('Expense updated successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update expense');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteExpense = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      await api.delete(`/expenses/${id}`);
      dispatch({ type: actionTypes.DELETE_EXPENSE, payload: id });
      toast.success('Expense deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete expense');
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Budget actions
  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      dispatch({ type: actionTypes.SET_BUDGETS, payload: response.data });
    } catch (error) {
      handleError(error, 'Failed to fetch budgets');
    }
  };

  const createBudget = async (budgetData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.post('/budgets', budgetData);
      dispatch({ type: actionTypes.ADD_BUDGET, payload: response.data });
      toast.success('Budget created successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create budget');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateBudget = async (id, budgetData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await api.put(`/budgets/${id}`, budgetData);
      dispatch({ type: actionTypes.UPDATE_BUDGET, payload: response.data });
      toast.success('Budget updated successfully');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update budget');
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteBudget = async (id) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      await api.delete(`/budgets/${id}`);
      dispatch({ type: actionTypes.DELETE_BUDGET, payload: id });
      toast.success('Budget deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete budget');
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Utility actions
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  const updatePreferences = (newPreferences) => {
    dispatch({ type: actionTypes.SET_PREFERENCES, payload: newPreferences });
    // Save to localStorage
    localStorage.setItem('preferences', JSON.stringify({
      ...state.preferences,
      ...newPreferences
    }));
  };

  // Initialize app
  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: actionTypes.SET_PREFERENCES, payload: preferences });
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }

    // Fetch initial data
    fetchDashboardData();
    fetchSubscriptions();
    fetchExpenses();
    fetchBudgets();
  }, []);

  // Value object
  const value = {
    // State
    ...state,
    
    // Actions
    fetchDashboardData,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    clearError,
    updatePreferences
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;