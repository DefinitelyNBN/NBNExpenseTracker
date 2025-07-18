import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Download,
  Filter,
  DollarSign,
  Target,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCategory } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import { exportToCSV } from '../utils/helpers';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { dashboardData, expenses, subscriptions, loading } = useApp();
  const [analyticsData, setAnalyticsData] = useState({
    categories: {},
    trends: {}
  });
  const [viewMode, setViewMode] = useState('category');
  const [timeRange, setTimeRange] = useState('this_year');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const [categoriesResponse, trendsResponse] = await Promise.all([
        api.get('/analytics/categories'),
        api.get('/analytics/trends')
      ]);

      setAnalyticsData({
        categories: categoriesResponse.data.category_breakdown || {},
        trends: trendsResponse.data.monthly_trends || {}
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleExportAnalytics = () => {
    const exportData = Object.entries(analyticsData.categories).map(([category, amount]) => ({
      Category: formatCategory(category),
      Amount: amount,
      Percentage: ((amount / Object.values(analyticsData.categories).reduce((sum, val) => sum + val, 0)) * 100).toFixed(2) + '%'
    }));

    exportToCSV(exportData, 'analytics.csv');
    toast.success('Analytics exported successfully');
  };

  // Transform data for charts
  const categoryChartData = Object.entries(analyticsData.categories).map(([category, amount], index) => ({
    name: formatCategory(category),
    value: amount,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const trendChartData = Object.entries(analyticsData.trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: amount
    }));

  // Calculate key metrics
  const totalSpending = Object.values(analyticsData.categories).reduce((sum, amount) => sum + amount, 0);
  const topCategory = Object.entries(analyticsData.categories).reduce((prev, current) => 
    prev[1] > current[1] ? prev : current, ['', 0]
  );
  const averageMonthlySpending = Object.values(analyticsData.trends).reduce((sum, amount) => sum + amount, 0) / 
    Math.max(Object.keys(analyticsData.trends).length, 1);

  // Calculate subscription vs expenses breakdown
  const subscriptionYearlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.is_active) {
      return sum + (sub.billing_frequency === 'monthly' ? sub.cost * 12 : sub.cost);
    }
    return sum;
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const subscriptionVsExpensesData = [
    { name: 'Subscriptions', value: subscriptionYearlyCost, fill: CHART_COLORS[0] },
    { name: 'Other Expenses', value: totalExpenses, fill: CHART_COLORS[1] }
  ];

  // Calculate monthly comparison
  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  const currentMonthSpending = analyticsData.trends[currentMonth] || 0;
  const previousMonthSpending = analyticsData.trends[previousMonth] || 0;
  const monthlyChange = previousMonthSpending > 0 ? 
    ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed insights into your spending patterns
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={fetchAnalyticsData}
            disabled={loadingAnalytics}
            className="btn btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportAnalytics}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Spending</p>
              <p className="metric-value">
                {formatCurrency(totalSpending)}
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
              <p className="metric-label">Top Category</p>
              <p className="metric-value text-lg">
                {formatCategory(topCategory[0])}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(topCategory[1])}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Avg Monthly</p>
              <p className="metric-value">
                {formatCurrency(averageMonthlySpending)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Monthly Change</p>
              <p className={`metric-value ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${monthlyChange >= 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
              {monthlyChange >= 0 ? (
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode('category')}
          className={`btn ${viewMode === 'category' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Category Breakdown
        </button>
        <button
          onClick={() => setViewMode('trends')}
          className={`btn ${viewMode === 'trends' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Spending Trends
        </button>
        <button
          onClick={() => setViewMode('comparison')}
          className={`btn ${viewMode === 'comparison' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Subscriptions vs Expenses
        </button>
      </div>

      {/* Charts */}
      {loading || loadingAnalytics ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {viewMode === 'category' && 'Spending by Category'}
                {viewMode === 'trends' && 'Monthly Spending Trends'}
                {viewMode === 'comparison' && 'Subscriptions vs Other Expenses'}
              </h3>
            </div>
            <div className="dashboard-card-body">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'category' && (
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  )}
                  
                  {viewMode === 'trends' && (
                    <AreaChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#0ea5e9" 
                        fill="#0ea5e9" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  )}
                  
                  {viewMode === 'comparison' && (
                    <PieChart>
                      <Pie
                        data={subscriptionVsExpensesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {subscriptionVsExpensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Details */}
      {viewMode === 'category' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Details
            </h3>
          </div>
          <div className="dashboard-card-body">
            <div className="space-y-4">
              {Object.entries(analyticsData.categories)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[Object.keys(analyticsData.categories).indexOf(category) % CHART_COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCategory(category)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Key Insights
          </h3>
        </div>
        <div className="dashboard-card-body">
          <div className="space-y-4">
            {monthlyChange > 20 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    High Monthly Increase
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Your spending increased by {monthlyChange.toFixed(1)}% compared to last month
                  </p>
                </div>
              </div>
            )}

            {topCategory[1] > totalSpending * 0.4 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Category Concentration
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    {formatCategory(topCategory[0])} accounts for {((topCategory[1] / totalSpending) * 100).toFixed(1)}% of your spending
                  </p>
                </div>
              </div>
            )}

            {subscriptionYearlyCost > totalExpenses && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Subscription Heavy
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Your subscriptions ({formatCurrency(subscriptionYearlyCost)}) cost more than your other expenses
                  </p>
                </div>
              </div>
            )}

            {Object.keys(analyticsData.trends).length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Average Monthly Spending
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    You spend an average of {formatCurrency(averageMonthlySpending)} per month
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;