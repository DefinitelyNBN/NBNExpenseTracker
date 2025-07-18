import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatRelativeTime, formatCategory } from '../utils/formatters';
import { BILLING_FREQUENCY_OPTIONS, EXPENSE_CATEGORY_OPTIONS } from '../utils/constants';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const { 
    subscriptions, 
    loading, 
    error, 
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('next_due_date');
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billing_frequency: 'monthly',
    next_due_date: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchSubscriptions();
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
      const subscriptionData = {
        ...formData,
        cost: parseFloat(formData.cost),
        next_due_date: new Date(formData.next_due_date).toISOString()
      };

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, subscriptionData);
      } else {
        await createSubscription(subscriptionData);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      cost: subscription.cost.toString(),
      billing_frequency: subscription.billing_frequency,
      next_due_date: subscription.next_due_date.split('T')[0],
      category: subscription.category,
      description: subscription.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await deleteSubscription(id);
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cost: '',
      billing_frequency: 'monthly',
      next_due_date: '',
      category: '',
      description: ''
    });
    setEditingSubscription(null);
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    if (diffDays <= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    if (diffDays <= 7) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || sub.category === categoryFilter)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return b.cost - a.cost;
        case 'next_due_date':
          return new Date(a.next_due_date) - new Date(b.next_due_date);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your recurring subscriptions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input sm:w-48"
        >
          <option value="next_due_date">Sort by Due Date</option>
          <option value="name">Sort by Name</option>
          <option value="cost">Sort by Cost</option>
        </select>
      </div>

      {/* Subscriptions List */}
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
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No subscriptions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter ? 'Try adjusting your filters' : 'Get started by adding your first subscription'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {subscription.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCategory(subscription.category)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(subscription.cost)} / {subscription.billing_frequency}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Due</span>
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(subscription.next_due_date)}`}>
                      <span>{formatRelativeTime(subscription.next_due_date)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(subscription.next_due_date)}
                  </span>
                </div>

                {subscription.description && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subscription.description}
                    </p>
                  </div>
                )}
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
        title={editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Cost (₹)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Frequency</label>
              <select
                name="billing_frequency"
                value={formData.billing_frequency}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {BILLING_FREQUENCY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                name="next_due_date"
                value={formData.next_due_date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
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
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
              placeholder="Add any notes about this subscription..."
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
              {loading ? 'Saving...' : editingSubscription ? 'Update' : 'Add'} Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;