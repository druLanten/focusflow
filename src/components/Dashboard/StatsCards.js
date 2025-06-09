import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';

const StatsCards = () => {
  const { dailyStats } = useTimer();
  const { stats: taskStats } = useTasks();
  const { insights } = useStatistics();

  const statsData = [
    {
      title: 'Today\'s Pomodoros',
      value: dailyStats.pomodorosCompleted,
      icon: '🍅',
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      change: insights.productivityTrend === 'improving' ? '+12%' : 
              insights.productivityTrend === 'declining' ? '-8%' : '0%',
      changeColor: insights.productivityTrend === 'improving' ? 'text-green-600' : 
                   insights.productivityTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
    },
    {
      title: 'Focus Time Today',
      value: `${Math.floor(dailyStats.focusTime / 3600)}h ${Math.floor((dailyStats.focusTime % 3600) / 60)}m`,
      icon: '⏱️',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      change: '+5%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Tasks Completed',
      value: taskStats.completed,
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      change: `${taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Current Streak',
      value: `${insights.streak} days`,
      icon: '🔥',
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      change: insights.streak > 0 ? 'Active' : 'Start today!',
      changeColor: insights.streak > 0 ? 'text-green-600' : 'text-gray-600'
    },
    {
      title: 'Average Pomodoros',
      value: insights.averagePomodoros,
      icon: '📊',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      change: 'per day',
      changeColor: 'text-gray-600'
    },
    {
      title: 'Active Tasks',
      value: taskStats.active,
      icon: '📝',
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      change: taskStats.overdue > 0 ? `${taskStats.overdue} overdue` : 'On track',
      changeColor: taskStats.overdue > 0 ? 'text-red-600' : 'text-green-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        📈 Statistics Overview
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </h4>
                  <p className={`text-xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${stat.changeColor}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best Day Highlight */}
      {insights.bestDay && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏆</div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Best Day Record
              </h4>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {insights.bestDay.pomodorosCompleted} Pomodoros
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(insights.bestDay.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center space-x-2 p-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
            <span>🍅</span>
            <span>Start Timer</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
            <span>📝</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
