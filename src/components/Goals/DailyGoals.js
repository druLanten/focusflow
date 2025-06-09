import React, { useState, useEffect } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';

const DailyGoals = () => {
  const { dailyStats } = useTimer();
  const { tasks } = useTasks();
  const { getTodayStats } = useStatistics();
  
  const [settings, setSettings] = useState({
    dailyPomodoroGoal: 8,
    weeklyGoal: 40,
    dailyTaskGoal: 5
  });

  // Load settings from localStorage
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

  const todayStats = getTodayStats();
  const completedTasks = (tasks || []).filter(task => task.completed &&
    task.completedAt && new Date(task.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const pomodoroProgress = (dailyStats.pomodorosCompleted / settings.dailyPomodoroGoal) * 100;
  const taskProgress = (completedTasks / settings.dailyTaskGoal) * 100;
  const focusTimeHours = dailyStats.focusTime / 3600;
  const focusTimeGoal = (settings.dailyPomodoroGoal * 25) / 60; // hours
  const focusTimeProgress = (focusTimeHours / focusTimeGoal) * 100;

  const CircularProgress = ({ progress, size = 50, strokeWidth = 4, color = 'indigo' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`text-${color}-500 transition-all duration-500 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  };

  const GoalCard = ({ title, current, goal, progress, icon, color = 'indigo', unit = '' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header with icon and title */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
      </div>

      {/* Main content with progress circle and stats */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-baseline space-x-1 mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {current}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            of {goal}{unit} goal
          </p>
          <div className="mt-2">
            <p className={`text-xs font-medium ${
              progress >= 100 ? 'text-green-600 dark:text-green-400' :
              progress >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {progress >= 100 ? '🎉 Complete!' :
               progress >= 50 ? '💪 Halfway!' :
               '🎯 Keep going!'}
            </p>
          </div>
        </div>

        {/* Progress circle */}
        <div className="ml-3">
          <CircularProgress progress={progress} size={50} strokeWidth={5} color={color} />
        </div>
      </div>
    </div>
  );

  const getMotivationalMessage = () => {
    const totalProgress = (pomodoroProgress + taskProgress + focusTimeProgress) / 3;
    
    if (totalProgress >= 100) {
      return {
        message: "🎉 Amazing! You've crushed all your goals today!",
        color: "text-green-600 dark:text-green-400"
      };
    } else if (totalProgress >= 75) {
      return {
        message: "🔥 You're on fire! Almost there!",
        color: "text-orange-600 dark:text-orange-400"
      };
    } else if (totalProgress >= 50) {
      return {
        message: "💪 Great progress! Keep up the momentum!",
        color: "text-blue-600 dark:text-blue-400"
      };
    } else if (totalProgress >= 25) {
      return {
        message: "🎯 Good start! You've got this!",
        color: "text-indigo-600 dark:text-indigo-400"
      };
    } else {
      return {
        message: "🌟 Every journey begins with a single step!",
        color: "text-gray-600 dark:text-gray-400"
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Today's Goals</h2>
            <p className="text-sm text-white/90">
              {motivationalMessage.message}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {Math.round((pomodoroProgress + taskProgress + focusTimeProgress) / 3)}%
            </div>
            <div className="text-xs text-white/80">Overall</div>
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GoalCard
          title="Pomodoros"
          current={dailyStats.pomodorosCompleted}
          goal={settings.dailyPomodoroGoal}
          progress={pomodoroProgress}
          icon="🍅"
          color="red"
        />

        <GoalCard
          title="Tasks"
          current={completedTasks}
          goal={settings.dailyTaskGoal}
          progress={taskProgress}
          icon="✅"
          color="green"
        />

        <GoalCard
          title="Focus Time"
          current={Math.round(focusTimeHours * 10) / 10}
          goal={Math.round(focusTimeGoal * 10) / 10}
          progress={focusTimeProgress}
          icon="⏰"
          color="blue"
          unit="h"
        />
      </div>

      {/* Streak Info - Compact */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥</span>
            <div>
              <h3 className="text-sm font-medium">Current Streak</h3>
              <p className="text-lg font-bold">{todayStats.streak || 0} days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/90">
              {todayStats.streak >= 7 ? 'Amazing!' :
               todayStats.streak >= 3 ? 'Building!' :
               'Start today!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;
