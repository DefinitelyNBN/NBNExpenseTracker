import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  PieChart,
  ArrowRight,
  Plus,
  Bell,
  Target,
  Lightbulb
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';

const Dashboard = () => {
  const { 
    dashboardData, 
    loading, 
    error, 
    fetchDashboardData 
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Transform category breakdown for charts
  const categoryChartData = Object.entries(dashboardData?.category_breakdown || {}).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
    color: CHART_COLORS[Object.keys(dashboardData?.category_breakdown || {}).indexOf(category) % CHART_COLORS.length]
  }));

  // Calculate savings potential
  const savingsPotential = dashboardData.total_yearly_projection * 0.1; // 10% potential savings

  if (loading && !dashboardData.total_yearly_projection) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="loading-spinner"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
        <button 
          onClick={handleRefresh}
          className="mt-2 btn btn-sm btn-danger"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your financial activity
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-sm btn-secondary"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/subscriptions" className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Monthly Spending</p>
              <p className="metric-value">
                {formatCurrency(dashboardData?.current_monthly_spending || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Yearly Spending</p>
              <p className="metric-value">
                {formatCurrency(dashboardData.current_yearly_spending)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Yearly Projection</p>
              <p className="metric-value">
                {formatCurrency(dashboardData.total_yearly_projection)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Savings Potential</p>
              <p className="metric-value">
                {formatCurrency(savingsPotential)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
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
                    {alert.category ? `${alert.category} (${alert.type})` : `Total ${alert.type}`}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Spending by Category
            </h3>
          </div>
          <div className="dashboard-card-body">
            {categoryChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPieChart
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No spending data available</p>
                  <Link to="/expenses" className="text-primary-600 hover:text-primary-700 text-sm">
                    Add your first expense
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Subscriptions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Subscriptions
            </h3>
          </div>
          <div className="dashboard-card-body">
            {Array.isArray(dashboardData?.upcoming_subscriptions) && dashboardData.upcoming_subscriptions.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcoming_subscriptions.slice(0, 5).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {subscription.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(subscription.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(subscription.cost)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(subscription.due_date)}
                      </p>
                    </div>
                  </div>
                ))}
                {dashboardData.upcoming_subscriptions.length > 5 && (
                  <Link 
                    to="/subscriptions" 
                    className="block text-center text-primary-600 hover:text-primary-700 text-sm py-2"
                  >
                    View all subscriptions
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming subscriptions</p>
                  <Link to="/subscriptions" className="text-primary-600 hover:text-primary-700 text-sm">
                    Add a subscription
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Suggestions */}
      {dashboardData.savings_suggestions && dashboardData.savings_suggestions.length > 0 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Smart Savings Suggestions
            </h3>
          </div>
          <div className="dashboard-card-body">
            <div className="space-y-3">
              {dashboardData.savings_suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/subscriptions" className="block p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Manage Subscriptions
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Add, edit, or cancel subscriptions
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Link>

        <Link to="/expenses" className="block p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">
                Track Expenses
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                Record and categorize expenses
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Link>

        <Link to="/budget" className="block p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                Set Budgets
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Create and monitor budgets
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;