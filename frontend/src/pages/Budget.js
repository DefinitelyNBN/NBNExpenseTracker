import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCategory } from '../utils/formatters';
import { BUDGET_TYPE_OPTIONS, EXPENSE_CATEGORY_OPTIONS } from '../utils/constants';
import { calculateBudgetPercentage, getBudgetStatus } from '../utils/helpers';
import Modal from '../components/Modal';

const Budget = () => {
  const { 
    budgets, 
    dashboardData,
    loading, 
    error, 
    fetchBudgets,
    fetchDashboardData,
    createBudget,
    updateBudget,
    deleteBudget 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    type: 'monthly',
    category: '',
    limit: ''
  });

  useEffect(() => {
    fetchBudgets();
    fetchDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        limit: parseFloat(formData.limit),
        category: formData.category || null
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchBudgets();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      type: budget.type,
      category: budget.category || '',
      limit: budget.limit.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        fetchBudgets();
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'monthly',
      category: '',
      limit: ''
    });
    setEditingBudget(null);
  };

  const getBudgetProgress = (budget) => {
    const categoryBreakdown = dashboardData.category_breakdown || {};
    const currentSpending = budget.category 
      ? categoryBreakdown[budget.category] || 0
      : budget.type === 'monthly' 
        ? dashboardData.current_monthly_spending || 0
        : dashboardData.current_yearly_spending || 0;

    return {
      current: currentSpending,
      percentage: calculateBudgetPercentage(currentSpending, budget.limit),
      status: getBudgetStatus(currentSpending, budget.limit)
    };
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'safe':
        return '#22c55e'; // green
      case 'warning':
        return '#f59e0b'; // yellow
      case 'danger':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Calculate overall budget summary
  const totalBudgetLimit = Array.isArray(budgets) ? budgets.reduce((sum, budget) => sum + budget.limit, 0) : 0;
  const totalCurrentSpending = Array.isArray(budgets) ? budgets.reduce((sum, budget) => {
    const progress = getBudgetProgress(budget);
    return sum + progress.current;
  }, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set and track your spending limits
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Budget
            </h3>
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalBudgetLimit)}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Spent
            </h3>
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalCurrentSpending)}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Remaining
            </h3>
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(Math.max(0, totalBudgetLimit - totalCurrentSpending))}
          </p>
        </div>
      </div>

      {/* Budget Alerts */}
      {Array.isArray(dashboardData?.budget_alerts) && dashboardData.budget_alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Budget Alerts
            </h3>
          </div>
          <div className="space-y-2">
            {dashboardData.budget_alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-800 rounded-lg">
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {alert.category ? `${formatCategory(alert.category)} (${alert.type})` : `Overall ${alert.type}`}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Exceeded by {formatCurrency(alert.exceeded_by)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {formatCurrency(alert.current)} / {formatCurrency(alert.limit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No budgets set
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by creating your first budget to track your spending
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            const remaining = budget.limit - progress.current;
            
            return (
              <div key={budget.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {budget.category ? formatCategory(budget.category) : 'Overall'} Budget
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {budget.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center ${getStatusColor(progress.status)}`}>
                      {progress.status === 'safe' && <CheckCircle className="w-5 h-5" />}
                      {progress.status === 'warning' && <AlertTriangle className="w-5 h-5" />}
                      {progress.status === 'danger' && <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={progress.percentage}
                      text={`${Math.round(progress.percentage)}%`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: getProgressColor(progress.status),
                        textColor: getProgressColor(progress.status),
                        trailColor: '#e5e7eb',
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Spent: {formatCurrency(progress.current)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Limit: {formatCurrency(budget.limit)}
                    </p>
                    <p className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {remaining >= 0 ? 'Remaining' : 'Over budget'}: {formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'safe' ? 'bg-green-600' :
                      progress.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBudget ? 'Edit Budget' : 'Create New Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Budget Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {BUDGET_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category (Optional)</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Overall Budget</option>
                {EXPENSE_CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Budget Limit (₹)</label>
            <input
              type="number"
              name="limit"
              value={formData.limit}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingBudget ? 'Update' : 'Create'} Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;