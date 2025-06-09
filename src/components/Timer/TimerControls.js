import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const TimerControls = () => {
  const {
    status,
    mode,
    sessionType,
    autoStart,
    soundEnabled,
    nextSessionType,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setMode,
    setSessionType,
    setAutoStart,
    setSoundEnabled,
    TIMER_STATUS,
    TIMER_MODES,
    SESSION_TYPES
  } = useTimer();

  const handleStartPause = () => {
    if (status === TIMER_STATUS.RUNNING) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const getStartPauseIcon = () => {
    if (status === TIMER_STATUS.RUNNING) {
      return '⏸️';
    }
    return '▶️';
  };

  const getStartPauseText = () => {
    if (status === TIMER_STATUS.RUNNING) {
      return 'Pause';
    }
    if (status === TIMER_STATUS.PAUSED) {
      return 'Resume';
    }
    return 'Start';
  };

  const isTimerActive = status === TIMER_STATUS.RUNNING || status === TIMER_STATUS.PAUSED;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Main Controls */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={handleStartPause}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl ${
            status === TIMER_STATUS.RUNNING
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white focus:ring-yellow-300 animate-pulse'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-300'
          }`}
        >
          <span className="text-xl">{getStartPauseIcon()}</span>
          <span>{getStartPauseText()}</span>
        </button>

        {isTimerActive && (
          <button
            onClick={stopTimer}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            title="Stop and record partial session"
          >
            <span className="text-xl">⏹️</span>
            <span>Stop</span>
          </button>
        )}

        <button
          onClick={resetTimer}
          className="btn-secondary flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-lg"
        >
          <span className="text-xl">🔄</span>
          <span>Reset</span>
        </button>
      </div>

      {/* Timer Mode Selection */}
      <div className="card-gradient p-4 animate-slide-in-left">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Timer Mode</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode(TIMER_MODES.STANDARD)}
            disabled={isTimerActive}
            className={`p-3 rounded-lg border-2 transition-all duration-200 focus-ring ${
              mode === TIMER_MODES.STANDARD
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-medium">Standard</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">25 min / 5 min</div>
            </div>
          </button>

          <button
            onClick={() => setMode(TIMER_MODES.EXTENDED)}
            disabled={isTimerActive}
            className={`p-3 rounded-lg border-2 transition-all duration-200 focus-ring ${
              mode === TIMER_MODES.EXTENDED
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🚀</div>
              <div className="font-medium">Extended</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">50 min / 10 min</div>
            </div>
          </button>
        </div>
      </div>

      {/* Session Type Selection */}
      <div className="card-gradient p-4 animate-slide-in-right">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <span>🎯</span>
          <span>Session Type</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSessionType(SESSION_TYPES.FOCUS)}
            disabled={isTimerActive}
            className={`p-2 rounded-lg border transition-all duration-200 focus-ring ${
              sessionType === SESSION_TYPES.FOCUS
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-xl">🍅</div>
              <div className="text-xs font-medium">Focus</div>
            </div>
          </button>

          <button
            onClick={() => setSessionType(SESSION_TYPES.SHORT_BREAK)}
            disabled={isTimerActive}
            className={`p-2 rounded-lg border transition-all duration-200 focus-ring ${
              sessionType === SESSION_TYPES.SHORT_BREAK
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-xl">☕</div>
              <div className="text-xs font-medium">Short Break</div>
            </div>
          </button>

          <button
            onClick={() => setSessionType(SESSION_TYPES.LONG_BREAK)}
            disabled={isTimerActive}
            className={`p-2 rounded-lg border transition-all duration-200 focus-ring ${
              sessionType === SESSION_TYPES.LONG_BREAK
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-xl">🌟</div>
              <div className="text-xs font-medium">Long Break</div>
            </div>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="card-gradient p-4 animate-fade-in">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Settings</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-start next session
            </span>
            <button
              onClick={() => setAutoStart(!autoStart)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                autoStart ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoStart ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sound notifications
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                soundEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Next Session Info */}
      {autoStart && status !== TIMER_STATUS.IDLE && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
          <div className="text-center">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Next: {nextSessionType === SESSION_TYPES.FOCUS ? '🍅 Focus' : 
                     nextSessionType === SESSION_TYPES.SHORT_BREAK ? '☕ Short Break' : 
                     '🌟 Long Break'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerControls;
