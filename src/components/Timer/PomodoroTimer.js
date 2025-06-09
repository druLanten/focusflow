import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import Timer from './Timer';
import TimerControls from './TimerControls';
// Temporarily disable TaskSelector and DailyGoals to isolate the issue
// import TaskSelector from './TaskSelector';
// import { DailyGoals } from '../Goals';

const PomodoroTimer = () => {
  const {
    pomodoroCount,
    sessionsCompleted,
    dailyStats,
    sessionType,
    SESSION_TYPES
  } = useTimer();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Statistics */}
      <div className="card-gradient p-6 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="animate-slide-in-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
              <span className="animate-bounce-gentle">🍅</span>
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Pomodoro Timer
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Stay focused and productive with the Pomodoro technique!
            </p>
          </div>

          {/* Daily Statistics */}
          <div className="mt-4 lg:mt-0 grid grid-cols-3 gap-4 animate-slide-in-right">
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 transform hover:scale-105 transition-all duration-200">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 animate-scale-in">
                {dailyStats.pomodorosCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Pomodoros Today
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-all duration-200">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-scale-in">
                {Math.floor(dailyStats.focusTime / 3600)}h {Math.floor((dailyStats.focusTime % 3600) / 60)}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Focus Time
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 transform hover:scale-105 transition-all duration-200">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-scale-in">
                {sessionsCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Sessions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Display */}
        <div className="lg:col-span-2 animate-fade-in-up">
          <div className="card-gradient p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full transform -translate-x-12 translate-y-12 opacity-50"></div>

            <div className="relative z-10">
              <Timer />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Timer Controls */}
          <TimerControls />

          {/* Session Info */}
          <div className="card-gradient p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Session Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionType === SESSION_TYPES.FOCUS ? '🍅 Focus' :
                   sessionType === SESSION_TYPES.SHORT_BREAK ? '☕ Short Break' :
                   '🌟 Long Break'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pomodoros:</span>
                <span className="font-medium text-gray-900 dark:text-white">{pomodoroCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                <span className="font-medium text-gray-900 dark:text-white">{sessionsCompleted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
