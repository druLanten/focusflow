import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const Timer = () => {
  const {
    formattedTime,
    sessionType,
    status,
    progress,
    currentQuote,
    SESSION_TYPES,
    TIMER_STATUS
  } = useTimer();

  const getSessionIcon = () => {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return '🍅';
      case SESSION_TYPES.SHORT_BREAK:
        return '☕';
      case SESSION_TYPES.LONG_BREAK:
        return '🌟';
      default:
        return '🍅';
    }
  };

  const getSessionTitle = () => {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return 'Focus Time';
      case SESSION_TYPES.SHORT_BREAK:
        return 'Short Break';
      case SESSION_TYPES.LONG_BREAK:
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return 'text-red-600 dark:text-red-400';
      case SESSION_TYPES.SHORT_BREAK:
        return 'text-green-600 dark:text-green-400';
      case SESSION_TYPES.LONG_BREAK:
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getProgressColor = () => {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return 'stroke-red-500';
      case SESSION_TYPES.SHORT_BREAK:
        return 'stroke-green-500';
      case SESSION_TYPES.LONG_BREAK:
        return 'stroke-blue-500';
      default:
        return 'stroke-red-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case TIMER_STATUS.IDLE:
        return sessionType === SESSION_TYPES.FOCUS 
          ? 'Ready to focus? Click start to begin your Pomodoro session!'
          : 'Time for a break! Relax and recharge.';
      case TIMER_STATUS.RUNNING:
        return sessionType === SESSION_TYPES.FOCUS 
          ? 'Stay focused! You\'re doing great.'
          : 'Enjoy your break! You\'ve earned it.';
      case TIMER_STATUS.PAUSED:
        return 'Timer paused. Click start to continue.';
      case TIMER_STATUS.COMPLETED:
        return sessionType === SESSION_TYPES.FOCUS 
          ? 'Great job! You completed a focus session.'
          : 'Break time is over. Ready to get back to work?';
      default:
        return '';
    }
  };

  // Calculate circle properties for progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
      {/* Session Header */}
      <div className="text-center animate-slide-in-right">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <span className={`text-4xl transition-transform duration-300 ${
            status === TIMER_STATUS.RUNNING ? 'animate-bounce-gentle' : ''
          }`}>
            {getSessionIcon()}
          </span>
          <h2 className={`text-3xl font-bold ${getSessionColor()} transition-all duration-300`}>
            {getSessionTitle()}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-fade-in">
          {getStatusMessage()}
        </p>
      </div>

      {/* Circular Progress Timer */}
      <div className="relative animate-scale-in">
        {/* Glow effect background */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
          status === TIMER_STATUS.RUNNING ? 'animate-pulse' : ''
        } ${getProgressColor()}`}
        style={{ transform: 'scale(1.1)' }}></div>

        <svg
          className="transform -rotate-90 w-64 h-64 relative z-10"
          width="256"
          height="256"
        >
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-in-out ${getProgressColor()} ${
              status === TIMER_STATUS.RUNNING ? 'drop-shadow-lg' : ''
            }`}
            style={{
              filter: status === TIMER_STATUS.RUNNING ? 'drop-shadow(0 0 8px currentColor)' : 'none'
            }}
          />
        </svg>

        {/* Timer display in center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <div className={`text-5xl font-mono font-bold ${getSessionColor()} transition-all duration-300 ${
              status === TIMER_STATUS.RUNNING ? 'animate-pulse' : ''
            }`}>
              {formattedTime}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 animate-fade-in">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote (only during focus sessions) */}
      {sessionType === SESSION_TYPES.FOCUS && status === TIMER_STATUS.RUNNING && (
        <div className="max-w-md text-center">
          <blockquote className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
            "{currentQuote}"
          </blockquote>
        </div>
      )}

      {/* Session completion celebration */}
      {status === TIMER_STATUS.COMPLETED && (
        <div className="text-center animate-bounce">
          <div className="text-6xl mb-2">🎉</div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">
            Session Complete!
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;
