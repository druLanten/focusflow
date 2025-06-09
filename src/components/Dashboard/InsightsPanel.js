import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';

const InsightsPanel = () => {
  const { dailyStats } = useTimer();
  const { stats: taskStats } = useTasks();
  const { insights } = useStatistics();

  const getProductivityScore = () => {
    // Calculate a productivity score based on multiple factors
    const pomodoroScore = Math.min(dailyStats.pomodorosCompleted / 8, 1) * 40; // 40% weight
    const taskScore = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 30 : 0; // 30% weight
    const streakScore = Math.min(insights.streak / 7, 1) * 20; // 20% weight
    const consistencyScore = insights.averagePomodoros > 0 ? 10 : 0; // 10% weight
    
    return Math.round(pomodoroScore + taskScore + streakScore + consistencyScore);
  };

  const getInsightMessages = () => {
    const messages = [];
    
    // Productivity trend insights
    if (insights.productivityTrend === 'improving') {
      messages.push({
        type: 'success',
        icon: '📈',
        title: 'Great Progress!',
        message: 'Your productivity is trending upward. Keep up the excellent work!'
      });
    } else if (insights.productivityTrend === 'declining') {
      messages.push({
        type: 'warning',
        icon: '📉',
        title: 'Room for Improvement',
        message: 'Your productivity has declined recently. Consider reviewing your goals and schedule.'
      });
    }

    // Streak insights
    if (insights.streak >= 7) {
      messages.push({
        type: 'success',
        icon: '🔥',
        title: 'Amazing Streak!',
        message: `You've maintained productivity for ${insights.streak} days straight!`
      });
    } else if (insights.streak === 0) {
      messages.push({
        type: 'info',
        icon: '🚀',
        title: 'Start Your Streak',
        message: 'Complete at least one Pomodoro today to start building your streak!'
      });
    }

    // Daily goal insights
    if (dailyStats.pomodorosCompleted >= 8) {
      messages.push({
        type: 'success',
        icon: '🎯',
        title: 'Daily Goal Achieved!',
        message: 'You\'ve reached your daily Pomodoro target. Excellent focus!'
      });
    } else if (dailyStats.pomodorosCompleted >= 4) {
      messages.push({
        type: 'info',
        icon: '⚡',
        title: 'Halfway There!',
        message: 'You\'re making good progress toward your daily goal.'
      });
    }

    // Task completion insights
    if (taskStats.overdue > 0) {
      messages.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Overdue Tasks',
        message: `You have ${taskStats.overdue} overdue tasks. Consider prioritizing them.`
      });
    } else if (taskStats.completed > 0 && taskStats.active === 0) {
      messages.push({
        type: 'success',
        icon: '✨',
        title: 'All Caught Up!',
        message: 'You\'ve completed all your tasks. Time to add new ones or take a break!'
      });
    }

    // Best day insights
    if (insights.bestDay && dailyStats.pomodorosCompleted > insights.bestDay.pomodorosCompleted) {
      messages.push({
        type: 'success',
        icon: '🏆',
        title: 'New Record!',
        message: 'You\'ve set a new personal best for Pomodoros in a day!'
      });
    }

    return messages.slice(0, 3); // Limit to 3 insights
  };

  const productivityScore = getProductivityScore();
  const insightMessages = getInsightMessages();

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        🧠 Productivity Insights
      </h3>

      {/* Productivity Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Today's Productivity Score
          </h4>
          <span className={`text-2xl font-bold ${getScoreColor(productivityScore)}`}>
            {productivityScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              productivityScore >= 80 ? 'bg-green-500' :
              productivityScore >= 60 ? 'bg-yellow-500' :
              productivityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${productivityScore}%` }}
          />
        </div>
        <p className={`text-sm font-medium ${getScoreColor(productivityScore)}`}>
          {getScoreLabel(productivityScore)}
        </p>
      </div>

      {/* Insights Messages */}
      <div className="space-y-3">
        {insightMessages.length > 0 ? (
          insightMessages.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                insight.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{insight.icon}</span>
                <div className="flex-1">
                  <h5 className={`text-sm font-medium ${
                    insight.type === 'success' 
                      ? 'text-green-800 dark:text-green-200'
                      : insight.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {insight.title}
                  </h5>
                  <p className={`text-xs mt-1 ${
                    insight.type === 'success' 
                      ? 'text-green-700 dark:text-green-300'
                      : insight.type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start your productivity journey to unlock insights!
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          💡 Recommendations
        </h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          {dailyStats.pomodorosCompleted < 4 && (
            <div className="flex items-center space-x-2">
              <span>•</span>
              <span>Try to complete at least 4 Pomodoros today for better focus</span>
            </div>
          )}
          {taskStats.active > 10 && (
            <div className="flex items-center space-x-2">
              <span>•</span>
              <span>Consider breaking down large tasks into smaller ones</span>
            </div>
          )}
          {insights.streak === 0 && (
            <div className="flex items-center space-x-2">
              <span>•</span>
              <span>Start a consistency streak by completing one Pomodoro daily</span>
            </div>
          )}
          {insights.averagePomodoros < 3 && (
            <div className="flex items-center space-x-2">
              <span>•</span>
              <span>Gradually increase your daily Pomodoro target</span>
            </div>
          )}
          {insightMessages.length === 0 && (
            <div className="flex items-center space-x-2">
              <span>•</span>
              <span>Keep using FocusFlow consistently to unlock personalized insights</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
