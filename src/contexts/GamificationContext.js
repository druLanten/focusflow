import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gamificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Gamification Context
const GamificationContext = createContext();

// Custom hook to use gamification context
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// Badge definitions
export const BADGES = {
  FIRST_POMODORO: {
    id: 'first_pomodoro',
    name: 'First Steps',
    description: 'Complete your first Pomodoro session',
    icon: '🎯',
    requirement: { type: 'pomodoros_total', value: 1 }
  },
  DAILY_GOAL: {
    id: 'daily_goal',
    name: 'Daily Champion',
    description: 'Reach your daily Pomodoro goal',
    icon: '🏆',
    requirement: { type: 'daily_goal_reached', value: 1 }
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    requirement: { type: 'streak', value: 3 }
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    requirement: { type: 'streak', value: 7 }
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Consistency Master',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    requirement: { type: 'streak', value: 30 }
  },
  POMODOROS_50: {
    id: 'pomodoros_50',
    name: 'Half Century',
    description: 'Complete 50 Pomodoro sessions',
    icon: '🎖️',
    requirement: { type: 'pomodoros_total', value: 50 }
  },
  POMODOROS_100: {
    id: 'pomodoros_100',
    name: 'Centurion',
    description: 'Complete 100 Pomodoro sessions',
    icon: '🏅',
    requirement: { type: 'pomodoros_total', value: 100 }
  },
  POMODOROS_500: {
    id: 'pomodoros_500',
    name: 'Focus Legend',
    description: 'Complete 500 Pomodoro sessions',
    icon: '👑',
    requirement: { type: 'pomodoros_total', value: 500 }
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a Pomodoro before 8 AM',
    icon: '🌅',
    requirement: { type: 'early_session', value: 1 }
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a Pomodoro after 10 PM',
    icon: '🦉',
    requirement: { type: 'late_session', value: 1 }
  },
  TASK_MASTER: {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '✅',
    requirement: { type: 'tasks_total', value: 100 }
  },
  PERFECT_DAY: {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete 10 Pomodoros in a single day',
    icon: '⭐',
    requirement: { type: 'daily_pomodoros', value: 10 }
  }
};

// Achievement levels
export const LEVELS = {
  BEGINNER: { min: 0, max: 24, name: 'Beginner', icon: '🌱' },
  FOCUSED: { min: 25, max: 99, name: 'Focused', icon: '🎯' },
  DEDICATED: { min: 100, max: 249, name: 'Dedicated', icon: '🔥' },
  EXPERT: { min: 250, max: 499, name: 'Expert', icon: '⚡' },
  MASTER: { min: 500, max: 999, name: 'Master', icon: '💎' },
  LEGEND: { min: 1000, max: Infinity, name: 'Legend', icon: '👑' }
};

// Initial state
const initialState = {
  unlockedBadges: [],
  totalPomodoros: 0,
  totalTasks: 0,
  currentStreak: 0,
  level: LEVELS.BEGINNER,
  points: 0,
  recentAchievements: [], // Last 5 achievements
  dailyGoalReached: 0, // Number of times daily goal was reached
  earlyBirdSessions: 0,
  nightOwlSessions: 0,
  perfectDays: 0
};

// Action types
const ACTIONS = {
  LOAD_GAMIFICATION_DATA: 'LOAD_GAMIFICATION_DATA',
  UPDATE_STATS: 'UPDATE_STATS',
  UNLOCK_BADGE: 'UNLOCK_BADGE',
  UPDATE_LEVEL: 'UPDATE_LEVEL',
  ADD_POINTS: 'ADD_POINTS',
  MARK_DAILY_GOAL_REACHED: 'MARK_DAILY_GOAL_REACHED',
  RECORD_SESSION_TIME: 'RECORD_SESSION_TIME'
};

// Reducer function
const gamificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_GAMIFICATION_DATA:
      return {
        ...state,
        ...action.payload
      };

    case ACTIONS.UPDATE_STATS:
      return {
        ...state,
        ...action.payload
      };

    case ACTIONS.UNLOCK_BADGE:
      if (state.unlockedBadges.includes(action.payload.id)) {
        return state;
      }
      return {
        ...state,
        unlockedBadges: [...state.unlockedBadges, action.payload.id],
        recentAchievements: [
          action.payload,
          ...state.recentAchievements.slice(0, 4)
        ]
      };

    case ACTIONS.UPDATE_LEVEL:
      return {
        ...state,
        level: action.payload
      };

    case ACTIONS.ADD_POINTS:
      return {
        ...state,
        points: state.points + action.payload
      };

    case ACTIONS.MARK_DAILY_GOAL_REACHED:
      return {
        ...state,
        dailyGoalReached: state.dailyGoalReached + 1
      };

    case ACTIONS.RECORD_SESSION_TIME:
      const hour = new Date().getHours();
      const updates = {};
      
      if (hour < 8) {
        updates.earlyBirdSessions = state.earlyBirdSessions + 1;
      }
      if (hour >= 22) {
        updates.nightOwlSessions = state.nightOwlSessions + 1;
      }
      
      return {
        ...state,
        ...updates
      };

    default:
      return state;
  }
};

// Utility functions
const saveGamificationDataToLocalStorage = (data) => {
  try {
    localStorage.setItem('focusflow-gamification', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save gamification data to localStorage:', error);
  }
};

const loadGamificationDataFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('focusflow-gamification');
    return saved ? JSON.parse(saved) : initialState;
  } catch (error) {
    console.error('Failed to load gamification data from localStorage:', error);
    return initialState;
  }
};

const calculateLevel = (totalPomodoros) => {
  for (const level of Object.values(LEVELS)) {
    if (totalPomodoros >= level.min && totalPomodoros <= level.max) {
      return level;
    }
  }
  return LEVELS.LEGEND;
};

const checkBadgeRequirements = (badge, stats) => {
  const { requirement } = badge;
  
  switch (requirement.type) {
    case 'pomodoros_total':
      return stats.totalPomodoros >= requirement.value;
    case 'tasks_total':
      return stats.totalTasks >= requirement.value;
    case 'streak':
      return stats.currentStreak >= requirement.value;
    case 'daily_goal_reached':
      return stats.dailyGoalReached >= requirement.value;
    case 'early_session':
      return stats.earlyBirdSessions >= requirement.value;
    case 'late_session':
      return stats.nightOwlSessions >= requirement.value;
    case 'daily_pomodoros':
      return stats.dailyPomodoros >= requirement.value;
    default:
      return false;
  }
};

// Gamification Provider Component
export const GamificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load gamification data on mount and when authentication changes
  useEffect(() => {
    const loadGamificationData = async () => {
      if (isAuthenticated) {
        try {
          // Try to load from backend first
          const backendData = await gamificationAPI.getGamificationData();
          const formattedData = {
            unlockedBadges: backendData.badges?.map(b => b.id) || [],
            totalPomodoros: user?.statistics?.totalPomodoros || 0,
            totalTasks: 0, // Will be updated from task context
            currentStreak: user?.statistics?.streak?.current || 0,
            level: calculateLevel(user?.statistics?.totalPomodoros || 0),
            points: backendData.experience || 0,
            recentAchievements: backendData.badges?.slice(-5) || [],
            dailyGoalReached: 0,
            earlyBirdSessions: 0,
            nightOwlSessions: 0,
            perfectDays: 0
          };

          dispatch({ type: ACTIONS.LOAD_GAMIFICATION_DATA, payload: formattedData });
          console.log('✅ Loaded gamification data from backend');
        } catch (error) {
          console.error('❌ Failed to load gamification data from backend:', error);
          // Fallback to localStorage
          const savedData = loadGamificationDataFromLocalStorage();
          dispatch({ type: ACTIONS.LOAD_GAMIFICATION_DATA, payload: savedData });
        }
      } else {
        // Load from localStorage when not authenticated
        const savedData = loadGamificationDataFromLocalStorage();
        dispatch({ type: ACTIONS.LOAD_GAMIFICATION_DATA, payload: savedData });
      }
    };

    loadGamificationData();
  }, [isAuthenticated, user]);

  // Save gamification data to localStorage whenever it changes
  useEffect(() => {
    saveGamificationDataToLocalStorage(state);
  }, [state]);

  // Action creators
  const unlockBadge = useCallback((badge) => {
    dispatch({ type: ACTIONS.UNLOCK_BADGE, payload: badge });

    // Add points for unlocking badge
    const points = badge.requirement.value >= 100 ? 100 :
                   badge.requirement.value >= 50 ? 50 : 25;
    dispatch({ type: ACTIONS.ADD_POINTS, payload: points });

    // Show notification if enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🎉 Badge Unlocked: ${badge.name}!`, {
        body: badge.description,
        icon: '/favicon.ico'
      });
    }
  }, []);

  const updateStats = useCallback(async (newStats) => {
    dispatch({ type: ACTIONS.UPDATE_STATS, payload: newStats });

    // Update level if needed - use the new stats instead of current state
    const newLevel = calculateLevel(newStats.totalPomodoros);
    dispatch({ type: ACTIONS.UPDATE_LEVEL, payload: newLevel });

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await gamificationAPI.checkProgress({
          sessions: [], // Will be populated by timer context
          tasks: [] // Will be populated by task context
        });
        console.log('✅ Synced gamification progress with backend');
      } catch (error) {
        console.error('❌ Failed to sync gamification with backend:', error);
      }
    }
  }, [isAuthenticated]);

  // Check for new badges when stats change
  useEffect(() => {
    Object.values(BADGES).forEach(badge => {
      if (!state.unlockedBadges.includes(badge.id)) {
        if (checkBadgeRequirements(badge, state)) {
          unlockBadge(badge);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.totalPomodoros, state.totalTasks, state.currentStreak, state.dailyGoalReached, state.earlyBirdSessions, state.nightOwlSessions, state.unlockedBadges]);

  const addPoints = (points) => {
    dispatch({ type: ACTIONS.ADD_POINTS, payload: points });
  };

  const markDailyGoalReached = () => {
    dispatch({ type: ACTIONS.MARK_DAILY_GOAL_REACHED });
  };

  const recordSessionTime = () => {
    dispatch({ type: ACTIONS.RECORD_SESSION_TIME });
  };

  const getProgressToNextLevel = () => {
    const currentLevel = state.level;
    const nextLevelKey = Object.keys(LEVELS).find(key => 
      LEVELS[key].min > currentLevel.max
    );
    
    if (!nextLevelKey) {
      return { progress: 100, nextLevel: null, pomodorosNeeded: 0 };
    }
    
    const nextLevel = LEVELS[nextLevelKey];
    const progress = ((state.totalPomodoros - currentLevel.min) / 
                     (nextLevel.min - currentLevel.min)) * 100;
    const pomodorosNeeded = nextLevel.min - state.totalPomodoros;
    
    return { progress, nextLevel, pomodorosNeeded };
  };

  const getAvailableBadges = () => {
    return Object.values(BADGES).filter(badge => 
      !state.unlockedBadges.includes(badge.id)
    );
  };

  const getUnlockedBadges = () => {
    return Object.values(BADGES).filter(badge => 
      state.unlockedBadges.includes(badge.id)
    );
  };

  const value = {
    // State
    unlockedBadges: state.unlockedBadges,
    totalPomodoros: state.totalPomodoros,
    totalTasks: state.totalTasks,
    currentStreak: state.currentStreak,
    level: state.level,
    points: state.points,
    recentAchievements: state.recentAchievements,
    dailyGoalReached: state.dailyGoalReached,
    
    // Actions
    updateStats,
    unlockBadge,
    addPoints,
    markDailyGoalReached,
    recordSessionTime,
    
    // Computed
    getProgressToNextLevel,
    getAvailableBadges,
    getUnlockedBadges,
    
    // Constants
    BADGES,
    LEVELS
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
