import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { safeLocalStorage, safeTimer, getBrowserConfig, logBrowserInfo } from '../utils/browserCompat';
import { statsAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Timer Context
const TimerContext = createContext();

// Custom hook to use timer context
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Timer modes and session types
export const TIMER_MODES = {
  STANDARD: 'standard', // 25/5 minutes
  EXTENDED: 'extended'  // 50/10 minutes
};

export const SESSION_TYPES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break'
};

export const TIMER_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

// Timer durations in seconds
export const DURATIONS = {
  [TIMER_MODES.STANDARD]: {
    [SESSION_TYPES.FOCUS]: 25 * 60,        // 25 minutes
    [SESSION_TYPES.SHORT_BREAK]: 5 * 60,   // 5 minutes
    [SESSION_TYPES.LONG_BREAK]: 20 * 60    // 20 minutes
  },
  [TIMER_MODES.EXTENDED]: {
    [SESSION_TYPES.FOCUS]: 50 * 60,        // 50 minutes
    [SESSION_TYPES.SHORT_BREAK]: 10 * 60,  // 10 minutes
    [SESSION_TYPES.LONG_BREAK]: 20 * 60    // 20 minutes
  }
};

// Motivational quotes for focus sessions
export const FOCUS_QUOTES = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Focus on being productive instead of busy. - Tim Ferriss",
  "Concentrate all your thoughts upon the work at hand. - Alexander Graham Bell",
  "The successful warrior is the average man with laser-like focus. - Bruce Lee",
  "Where focus goes, energy flows and results show. - Tony Robbins",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "Focus is a matter of deciding what things you're not going to do. - John Carmack",
  "The art of being wise is knowing what to overlook. - William James",
  "Lack of direction, not lack of time, is the problem. - Zig Ziglar"
];

// Initial state
const initialState = {
  mode: TIMER_MODES.STANDARD,
  sessionType: SESSION_TYPES.FOCUS,
  status: TIMER_STATUS.IDLE,
  timeRemaining: DURATIONS[TIMER_MODES.STANDARD][SESSION_TYPES.FOCUS],
  totalTime: DURATIONS[TIMER_MODES.STANDARD][SESSION_TYPES.FOCUS],
  currentTask: null,
  pomodoroCount: 0,
  sessionsCompleted: 0,
  autoStart: true,
  soundEnabled: true,
  currentQuote: FOCUS_QUOTES[0],
  dailyStats: {
    pomodorosCompleted: 0,
    focusTime: 0, // in seconds
    tasksCompleted: 0,
    date: new Date().toDateString()
  }
};

// Action types
const ACTIONS = {
  SET_MODE: 'SET_MODE',
  SET_SESSION_TYPE: 'SET_SESSION_TYPE',
  SET_STATUS: 'SET_STATUS',
  SET_TIME_REMAINING: 'SET_TIME_REMAINING',
  SET_CURRENT_TASK: 'SET_CURRENT_TASK',
  INCREMENT_POMODORO: 'INCREMENT_POMODORO',
  RESET_TIMER: 'RESET_TIMER',
  COMPLETE_SESSION: 'COMPLETE_SESSION',
  SET_AUTO_START: 'SET_AUTO_START',
  SET_SOUND_ENABLED: 'SET_SOUND_ENABLED',
  SET_QUOTE: 'SET_QUOTE',
  UPDATE_DAILY_STATS: 'UPDATE_DAILY_STATS',
  LOAD_STATS: 'LOAD_STATS',
  TICK: 'TICK'
};

// Reducer function
const timerReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_MODE:
      const newDuration = DURATIONS[action.payload][state.sessionType];
      return {
        ...state,
        mode: action.payload,
        timeRemaining: newDuration,
        totalTime: newDuration,
        status: TIMER_STATUS.IDLE
      };

    case ACTIONS.SET_SESSION_TYPE:
      const duration = DURATIONS[state.mode][action.payload];
      return {
        ...state,
        sessionType: action.payload,
        timeRemaining: duration,
        totalTime: duration,
        status: TIMER_STATUS.IDLE
      };

    case ACTIONS.SET_STATUS:
      return {
        ...state,
        status: action.payload
      };

    case ACTIONS.SET_TIME_REMAINING:
      return {
        ...state,
        timeRemaining: action.payload
      };

    case ACTIONS.SET_CURRENT_TASK:
      return {
        ...state,
        currentTask: action.payload
      };

    case ACTIONS.INCREMENT_POMODORO:
      return {
        ...state,
        pomodoroCount: state.pomodoroCount + 1
      };

    case ACTIONS.RESET_TIMER:
      const resetDuration = DURATIONS[state.mode][state.sessionType];
      return {
        ...state,
        timeRemaining: resetDuration,
        totalTime: resetDuration,
        status: TIMER_STATUS.IDLE
      };

    case ACTIONS.COMPLETE_SESSION:
      return {
        ...state,
        status: TIMER_STATUS.COMPLETED,
        sessionsCompleted: state.sessionsCompleted + 1
      };

    case ACTIONS.SET_AUTO_START:
      return {
        ...state,
        autoStart: action.payload
      };

    case ACTIONS.SET_SOUND_ENABLED:
      return {
        ...state,
        soundEnabled: action.payload
      };

    case ACTIONS.SET_QUOTE:
      return {
        ...state,
        currentQuote: action.payload
      };

    case ACTIONS.UPDATE_DAILY_STATS:
      return {
        ...state,
        dailyStats: {
          ...state.dailyStats,
          ...action.payload
        }
      };

    case ACTIONS.LOAD_STATS:
      return {
        ...state,
        dailyStats: action.payload
      };

    case ACTIONS.TICK:
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      };

    default:
      return state;
  }
};

// Utility functions
const saveStatsToLocalStorage = (stats) => {
  try {
    safeLocalStorage.setItem('focusflow-timer-stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save timer stats to localStorage:', error);
  }
};

const loadStatsFromLocalStorage = () => {
  try {
    const saved = safeLocalStorage.getItem('focusflow-timer-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      // Reset stats if it's a new day
      if (stats.date !== new Date().toDateString()) {
        return {
          pomodorosCompleted: 0,
          focusTime: 0,
          tasksCompleted: 0,
          date: new Date().toDateString()
        };
      }
      return stats;
    }
    return {
      pomodorosCompleted: 0,
      focusTime: 0,
      tasksCompleted: 0,
      date: new Date().toDateString()
    };
  } catch (error) {
    console.error('Failed to load timer stats from localStorage:', error);
    return {
      pomodorosCompleted: 0,
      focusTime: 0,
      tasksCompleted: 0,
      date: new Date().toDateString()
    };
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const playNotificationSound = () => {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio notification not available:', error);
  }
};

// Timer Provider Component
export const TimerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef(null);
  const browserConfig = getBrowserConfig();
  const { isAuthenticated } = useAuth();

  // Log browser info on mount for debugging
  useEffect(() => {
    logBrowserInfo();
  }, []);

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = loadStatsFromLocalStorage();
    dispatch({ type: ACTIONS.LOAD_STATS, payload: savedStats });
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    saveStatsToLocalStorage(state.dailyStats);
  }, [state.dailyStats]);

  // Timer interval effect with browser compatibility
  useEffect(() => {
    if (state.status === TIMER_STATUS.RUNNING) {
      // Clear any existing interval first
      if (intervalRef.current) {
        safeTimer.clearInterval(intervalRef.current);
      }

      // Create new interval with browser-specific timing
      intervalRef.current = safeTimer.setInterval(() => {
        dispatch({ type: ACTIONS.TICK });
      }, browserConfig.timerInterval);
    } else {
      if (intervalRef.current) {
        safeTimer.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        safeTimer.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.status, browserConfig.timerInterval]);

  // Handle timer completion
  useEffect(() => {
    if (state.timeRemaining <= 0 && state.status === TIMER_STATUS.RUNNING) {
      handleSessionComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeRemaining, state.status]);

  // Action creators
  const setMode = (mode) => {
    dispatch({ type: ACTIONS.SET_MODE, payload: mode });
  };

  const setSessionType = (sessionType) => {
    dispatch({ type: ACTIONS.SET_SESSION_TYPE, payload: sessionType });
  };

  const startTimer = () => {
    dispatch({ type: ACTIONS.SET_STATUS, payload: TIMER_STATUS.RUNNING });
    
    // Set a random quote for focus sessions
    if (state.sessionType === SESSION_TYPES.FOCUS) {
      const randomQuote = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)];
      dispatch({ type: ACTIONS.SET_QUOTE, payload: randomQuote });
    }
  };

  const pauseTimer = () => {
    dispatch({ type: ACTIONS.SET_STATUS, payload: TIMER_STATUS.PAUSED });
  };

  const stopTimer = async () => {
    // Record partial session if authenticated and there was meaningful progress
    const timeSpent = state.totalTime - state.timeRemaining;
    const minimumTimeToRecord = 60; // 1 minute minimum

    if (isAuthenticated && timeSpent >= minimumTimeToRecord) {
      try {
        const sessionData = {
          taskId: state.currentTask?.id || state.currentTask?._id || null,
          type: state.sessionType === SESSION_TYPES.FOCUS ? 'focus' :
                state.sessionType === SESSION_TYPES.SHORT_BREAK ? 'short-break' : 'long-break',
          duration: Math.round(timeSpent / 60), // Convert to minutes
          plannedDuration: Math.round(state.totalTime / 60),
          startTime: new Date(Date.now() - timeSpent * 1000).toISOString(),
          endTime: new Date().toISOString(),
          completed: false,
          interrupted: true,
          interruptionReason: 'Manually stopped',
          mode: state.mode === TIMER_MODES.STANDARD ? '25/5' : '50/10',
          notes: 'Partial session',
          productivity: null
        };

        console.log('📊 Recording partial session to backend:', sessionData);
        await statsAPI.recordSession(sessionData);
        console.log('✅ Partial session recorded successfully');
      } catch (error) {
        console.error('❌ Failed to record partial session to backend:', error);
      }
    }

    dispatch({ type: ACTIONS.SET_STATUS, payload: TIMER_STATUS.STOPPED });
  };

  const resetTimer = () => {
    dispatch({ type: ACTIONS.RESET_TIMER });
  };

  const setCurrentTask = (task) => {
    dispatch({ type: ACTIONS.SET_CURRENT_TASK, payload: task });
  };

  const setAutoStart = (enabled) => {
    dispatch({ type: ACTIONS.SET_AUTO_START, payload: enabled });
  };

  const setSoundEnabled = (enabled) => {
    dispatch({ type: ACTIONS.SET_SOUND_ENABLED, payload: enabled });
  };

  const handleSessionComplete = async () => {
    dispatch({ type: ACTIONS.COMPLETE_SESSION });

    // Play notification sound
    if (state.soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification
    const settings = JSON.parse(safeLocalStorage.getItem('focusflow-settings') || '{}');
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const sessionName = state.sessionType === SESSION_TYPES.FOCUS ? 'Focus session' :
                          state.sessionType === SESSION_TYPES.SHORT_BREAK ? 'Short break' : 'Long break';
      const nextSession = getNextSessionType();
      const nextSessionName = nextSession === SESSION_TYPES.FOCUS ? 'focus session' :
                             nextSession === SESSION_TYPES.SHORT_BREAK ? 'short break' : 'long break';

      new Notification(`${sessionName} completed! 🎯`, {
        body: `Great work! ${state.autoStart ? `Your ${nextSessionName} will start automatically.` : `Ready for your ${nextSessionName}?`}`,
        icon: '/favicon.ico'
      });
    }

    // Record session in backend if authenticated
    if (isAuthenticated) {
      try {
        const sessionData = {
          taskId: state.currentTask?.id || state.currentTask?._id || null,
          type: state.sessionType === SESSION_TYPES.FOCUS ? 'focus' :
                state.sessionType === SESSION_TYPES.SHORT_BREAK ? 'short-break' : 'long-break',
          duration: Math.round((state.totalTime - state.timeRemaining) / 60), // Convert to minutes
          plannedDuration: Math.round(state.totalTime / 60),
          startTime: new Date(Date.now() - (state.totalTime - state.timeRemaining) * 1000).toISOString(),
          endTime: new Date().toISOString(),
          completed: true,
          interrupted: false,
          mode: state.mode === TIMER_MODES.STANDARD ? '25/5' : '50/10',
          notes: '',
          productivity: null
        };

        console.log('📊 Recording session to backend:', sessionData);
        await statsAPI.recordSession(sessionData);
        console.log('✅ Session recorded successfully');
      } catch (error) {
        console.error('❌ Failed to record session to backend:', error);
        // Continue with local storage as fallback
      }
    }

    // Update local statistics
    if (state.sessionType === SESSION_TYPES.FOCUS) {
      const focusTime = DURATIONS[state.mode][SESSION_TYPES.FOCUS];
      const newStats = {
        pomodorosCompleted: state.dailyStats.pomodorosCompleted + 1,
        focusTime: state.dailyStats.focusTime + focusTime
      };

      console.log('🍅 Pomodoro completed:', {
        oldStats: state.dailyStats,
        newStats,
        focusTime,
        mode: state.mode
      });

      dispatch({
        type: ACTIONS.UPDATE_DAILY_STATS,
        payload: newStats
      });
      dispatch({ type: ACTIONS.INCREMENT_POMODORO });
    }

    // Auto-start next session if enabled
    if (state.autoStart) {
      safeTimer.setTimeout(() => {
        const nextSessionType = getNextSessionType();
        setSessionType(nextSessionType);
        safeTimer.setTimeout(() => startTimer(), 1000);
      }, 2000);
    }
  };

  const getNextSessionType = () => {
    if (state.sessionType === SESSION_TYPES.FOCUS) {
      // After 4 pomodoros, take a long break
      if ((state.pomodoroCount + 1) % 4 === 0) {
        return SESSION_TYPES.LONG_BREAK;
      } else {
        return SESSION_TYPES.SHORT_BREAK;
      }
    } else {
      // After any break, return to focus
      return SESSION_TYPES.FOCUS;
    }
  };

  const getProgress = () => {
    return ((state.totalTime - state.timeRemaining) / state.totalTime) * 100;
  };

  const value = {
    // State
    mode: state.mode,
    sessionType: state.sessionType,
    status: state.status,
    timeRemaining: state.timeRemaining,
    totalTime: state.totalTime,
    currentTask: state.currentTask,
    pomodoroCount: state.pomodoroCount,
    sessionsCompleted: state.sessionsCompleted,
    autoStart: state.autoStart,
    soundEnabled: state.soundEnabled,
    currentQuote: state.currentQuote,
    dailyStats: state.dailyStats,
    
    // Actions
    setMode,
    setSessionType,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setCurrentTask,
    setAutoStart,
    setSoundEnabled,
    
    // Computed
    formattedTime: formatTime(state.timeRemaining),
    progress: getProgress(),
    nextSessionType: getNextSessionType(),
    
    // Constants
    TIMER_MODES,
    SESSION_TYPES,
    TIMER_STATUS,
    DURATIONS,
    FOCUS_QUOTES
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
