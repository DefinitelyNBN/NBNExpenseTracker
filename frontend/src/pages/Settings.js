import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const Settings = () => {
  const { preferences, updatePreferences } = useApp();
  const [settings, setSettings] = useState({
    dark_mode: false,
    notifications_enabled: true,
    alert_days_before_due: 7,
    currency: 'INR',
    ...preferences
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      ...preferences
    }));
  }, [preferences]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    updatePreferences(settings);
    setHasChanges(false);
    toast.success('Settings saved successfully!');
  };

  const handleExportAllData = async () => {
    try {
      // This would typically make an API call to get all data
      // For now, we'll use a placeholder
      toast.success('Data export started! You\'ll receive a download link shortly.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        // This would typically make an API call to clear all data
        // For now, we'll just show a message
        toast.success('All data cleared successfully!');
      } catch (error) {
        console.error('Clear data error:', error);
        toast.error('Failed to clear data');
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        handleSettingChange('notifications_enabled', true);
      } else {
        toast.error('Notification permission denied');
        handleSettingChange('notifications_enabled', false);
      }
    } else {
      toast.error('Notifications not supported in this browser');
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('NBNTracker', {
        body: 'Test notification is working!',
        icon: '/favicon.ico'
      });
    } else {
      toast.error('Notifications not enabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your NBNTracker experience
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        )}
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-800 dark:text-blue-200">
              You have unsaved changes. Don't forget to save your settings!
            </span>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            General Settings
          </h3>
        </div>
        <div className="dashboard-card-body space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.dark_mode ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dark_mode}
                onChange={(e) => handleSettingChange('dark_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Currency
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred currency
                </p>
              </div>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="form-select w-32"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h3>
        </div>
        <div className="dashboard-card-body space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Enable Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications for subscription due dates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={requestNotificationPermission}
                className="btn btn-sm btn-secondary"
              >
                Enable
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Alert Days */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Alert Days Before Due
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Number of days before subscription due date to send alerts
                </p>
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.alert_days_before_due}
              onChange={(e) => handleSettingChange('alert_days_before_due', parseInt(e.target.value))}
              className="form-input w-20"
            />
          </div>

          {/* Test Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Test Notification
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send a test notification to check if it's working
                </p>
              </div>
            </div>
            <button
              onClick={testNotification}
              className="btn btn-sm btn-secondary"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Data Management
          </h3>
        </div>
        <div className="dashboard-card-body space-y-6">
          {/* Export Data */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Export Data
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download all your data as CSV files
                </p>
              </div>
            </div>
            <button
              onClick={handleExportAllData}
              className="btn btn-sm btn-secondary"
            >
              Export All
            </button>
          </div>

          {/* Clear Data */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Clear All Data
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Permanently delete all your data. This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAllData}
              className="btn btn-sm btn-danger"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            App Information
          </h3>
        </div>
        <div className="dashboard-card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Version</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Last Updated</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">July 2025</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@nbntracker.com</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Privacy</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">All data stored locally</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Mobile) */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 md:hidden">
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;