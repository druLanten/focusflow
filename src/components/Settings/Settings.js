import React, { useState, useEffect } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTheme } from '../../App';

const Settings = () => {
  const { 
    mode, 
    setMode, 
    autoStart, 
    setAutoStart, 
    soundEnabled, 
    setSoundEnabled,
    TIMER_MODES 
  } = useTimer();
  
  const { isDarkMode, toggleTheme } = useTheme();

  // Settings state
  const [settings, setSettings] = useState({
    dailyPomodoroGoal: 8,
    notificationsEnabled: false,
    showMotivationalQuotes: true,
    autoStartBreaks: true,
    longBreakInterval: 4,
    backgroundSounds: false,
    weeklyGoal: 40,
    reminderInterval: 30, // minutes
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('focusflow-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('focusflow-settings', JSON.stringify(settings));
  }, [settings]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, notificationsEnabled: true }));
        // Show test notification
        new Notification('FocusFlow Notifications Enabled! 🎯', {
          body: 'You\'ll now receive notifications when your Pomodoro sessions complete.',
          icon: '/favicon.ico'
        });
      } else {
        setSettings(prev => ({ ...prev, notificationsEnabled: false }));
      }
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      dailyPomodoroGoal: 8,
      notificationsEnabled: false,
      showMotivationalQuotes: true,
      autoStartBreaks: true,
      longBreakInterval: 4,
      backgroundSounds: false,
      weeklyGoal: 40,
      reminderInterval: 30,
    };
    setSettings(defaultSettings);
    setMode(TIMER_MODES.STANDARD);
    setAutoStart(true);
    setSoundEnabled(true);
  };

  const exportData = () => {
    const data = {
      settings,
      timerSettings: { mode, autoStart, soundEnabled },
      theme: isDarkMode ? 'dark' : 'light',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your FocusFlow experience and productivity preferences.
        </p>
      </div>

      {/* Timer Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">⏱️</span>
          Timer Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timer Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timer Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={TIMER_MODES.STANDARD}>Standard (25/5 min)</option>
              <option value={TIMER_MODES.EXTENDED}>Extended (50/10 min)</option>
            </select>
          </div>

          {/* Auto Start */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-start next session
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically start the next timer session
            </p>
          </div>

          {/* Sound Enabled */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sound notifications
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Play sound when sessions complete
            </p>
          </div>

          {/* Long Break Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Long break after (Pomodoros)
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={settings.longBreakInterval}
              onChange={(e) => handleSettingChange('longBreakInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Goals & Productivity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Goals & Productivity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Pomodoro Goal
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.dailyPomodoroGoal}
              onChange={(e) => handleSettingChange('dailyPomodoroGoal', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Target number of Pomodoros per day
            </p>
          </div>

          {/* Weekly Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weekly Pomodoro Goal
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={settings.weeklyGoal}
              onChange={(e) => handleSettingChange('weeklyGoal', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Target number of Pomodoros per week
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🔔</span>
          Notifications
        </h2>
        
        <div className="space-y-4">
          {/* Browser Notifications */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Browser Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified when sessions complete
                </p>
              </div>
              <button
                onClick={requestNotificationPermission}
                disabled={settings.notificationsEnabled}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.notificationsEnabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {settings.notificationsEnabled ? 'Enabled ✓' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Reminder Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Break Reminder (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.reminderInterval}
              onChange={(e) => handleSettingChange('reminderInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Remind to take breaks after this many minutes
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🎨</span>
          Appearance
        </h2>
        
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Motivational Quotes */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.showMotivationalQuotes}
                onChange={(e) => handleSettingChange('showMotivationalQuotes', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show motivational quotes
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Display inspirational quotes during focus sessions
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">💾</span>
          Data Management
        </h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Export Settings
          </button>
          
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Export your settings for backup or reset everything to default values.
        </p>
      </div>
    </div>
  );
};

export default Settings;
