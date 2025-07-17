import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Search,
  Filter,
  Download,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatCategory } from '../utils/formatters';
import { EXPENSE_CATEGORY_OPTIONS, COMMON_EXPENSE_TAGS } from '../utils/constants';
import { exportToCSV } from '../utils/helpers';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { 
    expenses, 
    loading, 
    error, 
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    tags: [],
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      tags: expense.tags || [],
      notes: expense.notes || '',
      date: expense.date.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      tags: [],
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingExpense(null);
    setTagInput('');
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const exportData = expenses.map(expense => ({
      Date: formatDate(expense.date),
      Amount: expense.amount,
      Category: formatCategory(expense.category),
      Tags: expense.tags?.join(', ') || '',
      Notes: expense.notes || ''
    }));

    exportToCSV(exportData, 'expenses.csv');
    toast.success('Expenses exported successfully');
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;
      const matchesDate = dateFilter === '' || expense.date.startsWith(dateFilter);
      
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
          return new Date(b.date) - new Date(a.date);
        default:
          return 0;
      }
    });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your expenses
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300">Total Expenses</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input sm:w-48"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input sm:w-48"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No expenses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter || dateFilter ? 'Try adjusting your filters' : 'Get started by adding your first expense'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="badge badge-secondary">
                      {formatCategory(expense.category)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {expense.tags.map((tag, index) => (
                        <span key={index} className="badge badge-primary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {expense.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              {EXPENSE_CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="space-y-2">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="form-input"
                placeholder="Type a tag and press Enter"
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_EXPENSE_TAGS.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
              placeholder="Add any notes about this expense..."
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
              {loading ? 'Saving...' : editingExpense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;