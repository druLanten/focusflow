import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';
import StatsCards from './StatsCards';
import ProductivityChart from './ProductivityChart';
import InsightsPanel from './InsightsPanel';
import ProgressOverview from './ProgressOverview';

const Dashboard = () => {
  const { dailyStats } = useTimer();
  const { stats: taskStats } = useTasks();
  const { insights } = useStatistics();

  // const todayStats = getTodayStats(); // For future use

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your productivity and analyze your progress over time
            </p>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {dailyStats.pomodorosCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Today's Pomodoros
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(dailyStats.focusTime / 3600)}h {Math.floor((dailyStats.focusTime % 3600) / 60)}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Focus Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {taskStats.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tasks Done
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {insights.streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Day Streak
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productivity Chart */}
          <ProductivityChart />
          
          {/* Progress Overview */}
          <ProgressOverview />
        </div>

        {/* Right Column - Stats and Insights */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards />
          
          {/* Insights Panel */}
          <InsightsPanel />
        </div>
      </div>

      {/* Bottom Section - Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📅 This Week's Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Pomodoros:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {insights.averagePomodoros * 7} 🍅
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Focus Time:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.floor(insights.totalFocusTime / 3600)}h {Math.floor((insights.totalFocusTime % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Tasks:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {taskStats.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Productivity Trend:</span>
              <span className={`font-semibold ${
                insights.productivityTrend === 'improving' ? 'text-green-600 dark:text-green-400' :
                insights.productivityTrend === 'declining' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {insights.productivityTrend === 'improving' ? '📈 Improving' :
                 insights.productivityTrend === 'declining' ? '📉 Declining' :
                 '➡️ Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Goals and Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            🎯 Goals & Achievements
          </h3>
          <div className="space-y-4">
            {/* Daily Goal Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Pomodoro Goal (8)
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dailyStats.pomodorosCompleted}/8
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((dailyStats.pomodorosCompleted / 8) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Achievements:</h4>
              <div className="space-y-1">
                {insights.streak >= 7 && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <span>🔥</span>
                    <span>Week-long streak!</span>
                  </div>
                )}
                {dailyStats.pomodorosCompleted >= 8 && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                    <span>🎯</span>
                    <span>Daily goal achieved!</span>
                  </div>
                )}
                {taskStats.completed >= 5 && (
                  <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
                    <span>✅</span>
                    <span>Task master!</span>
                  </div>
                )}
                {insights.streak === 0 && dailyStats.pomodorosCompleted === 0 && taskStats.completed === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Start your productivity journey today! 🚀
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips and Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          💡 Productivity Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Aim for 6-8 Pomodoros per day for optimal productivity</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Take longer breaks after every 4 Pomodoros</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Review your weekly progress to identify patterns</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Consistency beats intensity - maintain your streak</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Break large tasks into smaller, manageable chunks</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Use the dashboard to celebrate your achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
