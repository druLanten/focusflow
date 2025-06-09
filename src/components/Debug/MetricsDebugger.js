import React, { useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';
import { useGamification } from '../../contexts/GamificationContext';

const MetricsDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const { dailyStats, pomodoroCount, sessionsCompleted } = useTimer();
  const { allTasks, stats: taskStats } = useTasks();
  const { getTodayStats, insights } = useStatistics();
  const { totalPomodoros, totalTasks, currentStreak, level, points } = useGamification();

  const todayStats = getTodayStats();
  const completedTasks = allTasks.filter(task => task.completed).length;
  const todayCompletedTasks = allTasks.filter(task => 
    task.completed && 
    task.completedAt && 
    new Date(task.completedAt).toDateString() === new Date().toDateString()
  ).length;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors"
        >
          📊 Debug Metrics
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📊 Metrics Debug
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Timer Context */}
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Timer Context</h4>
          <div className="space-y-1 text-red-700 dark:text-red-400">
            <div>Daily Pomodoros: {dailyStats.pomodorosCompleted}</div>
            <div>Focus Time: {Math.floor(dailyStats.focusTime / 60)}m</div>
            <div>Pomodoro Count: {pomodoroCount}</div>
            <div>Sessions: {sessionsCompleted}</div>
            <div>Date: {dailyStats.date}</div>
          </div>
        </div>

        {/* Task Context */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Task Context</h4>
          <div className="space-y-1 text-green-700 dark:text-green-400">
            <div>Total Tasks: {taskStats.total}</div>
            <div>Completed: {taskStats.completed}</div>
            <div>Active: {taskStats.active}</div>
            <div>All Completed: {completedTasks}</div>
            <div>Today Completed: {todayCompletedTasks}</div>
          </div>
        </div>

        {/* Statistics Context */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Statistics Context</h4>
          <div className="space-y-1 text-blue-700 dark:text-blue-400">
            <div>Today Pomodoros: {todayStats.pomodorosCompleted}</div>
            <div>Today Focus: {Math.floor(todayStats.focusTime / 60)}m</div>
            <div>Today Tasks: {todayStats.tasksCompleted}</div>
            <div>Streak: {insights?.streak || 0}</div>
            <div>Avg Pomodoros: {insights?.averagePomodoros || 0}</div>
          </div>
        </div>

        {/* Gamification Context */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Gamification Context</h4>
          <div className="space-y-1 text-purple-700 dark:text-purple-400">
            <div>Total Pomodoros: {totalPomodoros}</div>
            <div>Total Tasks: {totalTasks}</div>
            <div>Streak: {currentStreak}</div>
            <div>Level: {level?.name || 'Unknown'}</div>
            <div>Points: {points}</div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Sync Status</h4>
          <div className="space-y-1 text-yellow-700 dark:text-yellow-400">
            <div className="flex justify-between">
              <span>Timer ↔ Stats:</span>
              <span className={dailyStats.pomodorosCompleted === todayStats.pomodorosCompleted ? 'text-green-600' : 'text-red-600'}>
                {dailyStats.pomodorosCompleted === todayStats.pomodorosCompleted ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stats ↔ Gamification:</span>
              <span className={todayStats.pomodorosCompleted === totalPomodoros ? 'text-green-600' : 'text-red-600'}>
                {todayStats.pomodorosCompleted === totalPomodoros ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasks ↔ Stats:</span>
              <span className={todayCompletedTasks === todayStats.tasksCompleted ? 'text-green-600' : 'text-red-600'}>
                {todayCompletedTasks === todayStats.tasksCompleted ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-xs"
          >
            🔄 Reload
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs"
          >
            🗑️ Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsDebugger;
