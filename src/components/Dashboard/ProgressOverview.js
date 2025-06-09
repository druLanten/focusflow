import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';

const ProgressOverview = () => {
  const { dailyStats } = useTimer();
  const { allTasks, PRIORITY_COLORS, CATEGORY_COLORS } = useTasks();
  const { insights } = useStatistics();

  // Ensure allTasks is an array first
  const safeTasks = Array.isArray(allTasks) ? allTasks : [];

  // Calculate task distribution by category
  const tasksByCategory = safeTasks.reduce((acc, task) => {
    if (task && task.category) {
      acc[task.category] = (acc[task.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate task distribution by priority
  const tasksByPriority = safeTasks.reduce((acc, task) => {
    if (task && task.priority) {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate completion rates
  const completedTasks = safeTasks.filter(task => task && task.completed);
  const completionRate = safeTasks.length > 0 ? (completedTasks.length / safeTasks.length) * 100 : 0;

  // Calculate Pomodoro efficiency (for future use)
  const totalEstimatedPomodoros = safeTasks.reduce((sum, task) => sum + (task?.pomodorosEstimated || 0), 0);
  const totalCompletedPomodoros = safeTasks.reduce((sum, task) => sum + (task?.pomodorosCompleted || 0), 0);
  // const pomodoroEfficiency = totalEstimatedPomodoros > 0 ? (totalCompletedPomodoros / totalEstimatedPomodoros) * 100 : 0;

  // Weekly goals
  const weeklyPomodoroGoal = 40; // 8 per day * 5 days
  const weeklyProgress = (insights.averagePomodoros * 7 / weeklyPomodoroGoal) * 100;

  const categoryData = Object.entries(tasksByCategory).map(([category, count]) => ({
    category,
    count,
    percentage: safeTasks.length > 0 ? (count / safeTasks.length) * 100 : 0,
    color: CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800'
  }));

  const priorityData = Object.entries(tasksByPriority).map(([priority, count]) => ({
    priority,
    count,
    percentage: safeTasks.length > 0 ? (count / safeTasks.length) * 100 : 0,
    color: PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800'
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        📋 Progress Overview
      </h3>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Daily Goal Progress */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-red-500"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={`${Math.min((dailyStats.pomodorosCompleted / 8) * 100, 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round((dailyStats.pomodorosCompleted / 8) * 100)}%
              </span>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Goal</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {dailyStats.pomodorosCompleted}/8 Pomodoros
          </p>
        </div>

        {/* Task Completion Rate */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-green-500"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={`${completionRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Completion</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {completedTasks.length}/{safeTasks.length} Tasks
          </p>
        </div>

        {/* Weekly Progress */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={`${Math.min(weeklyProgress, 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(weeklyProgress)}%
              </span>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Goal</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(insights.averagePomodoros * 7)}/40 Pomodoros
          </p>
        </div>
      </div>

      {/* Task Distribution */}
      {safeTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Category */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tasks by Category
            </h4>
            <div className="space-y-2">
              {categoryData.map(({ category, count, percentage, color }) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                      {category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tasks by Priority
            </h4>
            <div className="space-y-2">
              {priorityData.map(({ priority, count, percentage, color }) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                      {priority}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {safeTasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first task to see progress analytics!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;
