import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { statsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';

// Statistics Context
const StatisticsContext = createContext();

// Custom hook to use statistics context
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};

// Time periods
export const TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Initial state
const initialState = {
  historicalData: [], // Array of daily records
  currentPeriod: TIME_PERIODS.WEEKLY,
  isLoading: false,
  lastSyncTime: null,
  insights: {
    streak: 0,
    bestDay: null,
    averagePomodoros: 0,
    totalFocusTime: 0,
    productivityTrend: 'stable'
  }
};

// Action types
const ACTIONS = {
  LOAD_HISTORICAL_DATA: 'LOAD_HISTORICAL_DATA',
  ADD_DAILY_RECORD: 'ADD_DAILY_RECORD',
  UPDATE_DAILY_RECORD: 'UPDATE_DAILY_RECORD',
  SET_CURRENT_PERIOD: 'SET_CURRENT_PERIOD',
  CALCULATE_INSIGHTS: 'CALCULATE_INSIGHTS',
  SYNC_WITH_BACKEND: 'SYNC_WITH_BACKEND',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const statisticsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_HISTORICAL_DATA:
      return {
        ...state,
        historicalData: action.payload
      };

    case ACTIONS.ADD_DAILY_RECORD:
      return {
        ...state,
        historicalData: [...state.historicalData, action.payload]
      };

    case ACTIONS.UPDATE_DAILY_RECORD:
      return {
        ...state,
        historicalData: state.historicalData.map(record =>
          record.date === action.payload.date
            ? { ...record, ...action.payload.data }
            : record
        )
      };

    case ACTIONS.SET_CURRENT_PERIOD:
      return {
        ...state,
        currentPeriod: action.payload
      };

    case ACTIONS.CALCULATE_INSIGHTS:
      return {
        ...state,
        insights: action.payload
      };

    case ACTIONS.SYNC_WITH_BACKEND:
      return {
        ...state,
        historicalData: action.payload.historicalData,
        lastSyncTime: new Date().toISOString()
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Utility functions
const saveHistoricalDataToLocalStorage = (data) => {
  try {
    localStorage.setItem('focusflow-historical-data', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save historical data to localStorage:', error);
  }
};

const loadHistoricalDataFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('focusflow-historical-data');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load historical data from localStorage:', error);
    return [];
  }
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getDateRange = (period, fromDate = new Date()) => {
  const dates = [];
  const today = new Date(fromDate);
  
  switch (period) {
    case TIME_PERIODS.DAILY:
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(formatDate(date));
      }
      break;
    case TIME_PERIODS.WEEKLY:
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        dates.push(formatDate(date));
      }
      break;
    case TIME_PERIODS.MONTHLY:
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        dates.push(formatDate(date));
      }
      break;
    default:
      break;
  }
  
  return dates;
};

const calculateInsights = (historicalData) => {
  if (historicalData.length === 0) {
    return {
      streak: 0,
      bestDay: null,
      averagePomodoros: 0,
      totalFocusTime: 0,
      productivityTrend: 'stable'
    };
  }

  // Calculate current streak
  let streak = 0;
  const sortedData = [...historicalData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (const record of sortedData) {
    if (record.pomodorosCompleted > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Find best day
  const bestDay = historicalData.reduce((best, current) => {
    return current.pomodorosCompleted > (best?.pomodorosCompleted || 0) ? current : best;
  }, null);

  // Calculate averages
  const totalPomodoros = historicalData.reduce((sum, record) => sum + record.pomodorosCompleted, 0);
  const averagePomodoros = totalPomodoros / historicalData.length;
  const totalFocusTime = historicalData.reduce((sum, record) => sum + record.focusTime, 0);

  // Calculate productivity trend (last 7 days vs previous 7 days)
  const last7Days = historicalData.slice(-7);
  const previous7Days = historicalData.slice(-14, -7);
  
  const recentAvg = last7Days.reduce((sum, record) => sum + record.pomodorosCompleted, 0) / 7;
  const previousAvg = previous7Days.length > 0 
    ? previous7Days.reduce((sum, record) => sum + record.pomodorosCompleted, 0) / previous7Days.length 
    : 0;

  let productivityTrend = 'stable';
  if (recentAvg > previousAvg * 1.1) {
    productivityTrend = 'improving';
  } else if (recentAvg < previousAvg * 0.9) {
    productivityTrend = 'declining';
  }

  return {
    streak,
    bestDay,
    averagePomodoros: Math.round(averagePomodoros * 10) / 10,
    totalFocusTime,
    productivityTrend
  };
};

// Statistics Provider Component
export const StatisticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(statisticsReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { allTasks } = useTasks();

  // Load and sync data when authentication changes
  useEffect(() => {
    const loadStatisticsData = async () => {
      if (isAuthenticated) {
        try {
          dispatch({ type: ACTIONS.SET_LOADING, payload: true });

          // Get backend statistics
          const [, dailyData] = await Promise.all([
            statsAPI.getOverview(),
            statsAPI.getDailyStats()
          ]);

          // Convert backend data to frontend format
          const historicalData = dailyData.map(day => ({
            date: day._id,
            pomodorosCompleted: day.stats.find(s => s.type === 'focus')?.completedSessions || 0,
            focusTime: day.stats.find(s => s.type === 'focus')?.totalTime || 0,
            tasksCompleted: 0, // Will be calculated from tasks
            sessionsCompleted: day.stats.reduce((sum, s) => sum + s.completedSessions, 0)
          }));

          dispatch({ type: ACTIONS.SYNC_WITH_BACKEND, payload: { historicalData } });
          console.log('✅ Statistics synced with backend');
        } catch (error) {
          console.error('❌ Failed to sync statistics with backend:', error);
          // Fallback to localStorage
          const savedData = loadHistoricalDataFromLocalStorage();
          dispatch({ type: ACTIONS.LOAD_HISTORICAL_DATA, payload: savedData });
        } finally {
          dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        // Load from localStorage when not authenticated
        const savedData = loadHistoricalDataFromLocalStorage();
        dispatch({ type: ACTIONS.LOAD_HISTORICAL_DATA, payload: savedData });
      }
    };

    loadStatisticsData();
  }, [isAuthenticated]);

  // Save historical data to localStorage whenever it changes
  useEffect(() => {
    if (state.historicalData.length > 0) {
      saveHistoricalDataToLocalStorage(state.historicalData);
    }
  }, [state.historicalData]);

  // Action creators
  const addOrUpdateDailyRecord = useCallback((date, data) => {
    const dateString = typeof date === 'string' ? date : formatDate(date);
    const existingRecord = state.historicalData.find(record => record.date === dateString);

    if (existingRecord) {
      dispatch({
        type: ACTIONS.UPDATE_DAILY_RECORD,
        payload: { date: dateString, data }
      });
    } else {
      dispatch({
        type: ACTIONS.ADD_DAILY_RECORD,
        payload: { date: dateString, ...data }
      });
    }
  }, [state.historicalData]);

  // Update task completion data when tasks change
  useEffect(() => {
    if (allTasks && allTasks.length > 0) {
      const today = formatDate(new Date());
      const completedTasksToday = allTasks.filter(task =>
        task.completed &&
        task.completedAt &&
        formatDate(new Date(task.completedAt)) === today
      ).length;

      if (completedTasksToday > 0) {
        addOrUpdateDailyRecord(today, { tasksCompleted: completedTasksToday });
      }
    }
  }, [allTasks, addOrUpdateDailyRecord]);

  // Recalculate insights whenever historical data changes
  useEffect(() => {
    const insights = calculateInsights(state.historicalData);
    dispatch({ type: ACTIONS.CALCULATE_INSIGHTS, payload: insights });
  }, [state.historicalData]);

  const setCurrentPeriod = (period) => {
    dispatch({ type: ACTIONS.SET_CURRENT_PERIOD, payload: period });
  };

  // Data getters
  const getDataForPeriod = (period = state.currentPeriod) => {
    const dateRange = getDateRange(period);
    
    return dateRange.map(date => {
      const record = state.historicalData.find(r => r.date === date);
      return {
        date,
        pomodorosCompleted: record?.pomodorosCompleted || 0,
        focusTime: record?.focusTime || 0,
        tasksCompleted: record?.tasksCompleted || 0,
        sessionsCompleted: record?.sessionsCompleted || 0
      };
    });
  };

  const getChartData = (period = state.currentPeriod, metric = 'pomodorosCompleted') => {
    const data = getDataForPeriod(period);
    
    return {
      labels: data.map(item => {
        const date = new Date(item.date);
        switch (period) {
          case TIME_PERIODS.DAILY:
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          case TIME_PERIODS.WEEKLY:
            return `Week ${Math.ceil(date.getDate() / 7)}`;
          case TIME_PERIODS.MONTHLY:
            return date.toLocaleDateString('en-US', { month: 'short' });
          default:
            return date.toLocaleDateString();
        }
      }),
      datasets: [{
        label: metric === 'pomodorosCompleted' ? 'Pomodoros' : 
               metric === 'focusTime' ? 'Focus Time (hours)' : 
               metric === 'tasksCompleted' ? 'Tasks' : 'Sessions',
        data: data.map(item => 
          metric === 'focusTime' ? Math.round(item[metric] / 3600 * 10) / 10 : item[metric]
        ),
        borderColor: metric === 'pomodorosCompleted' ? '#ef4444' : 
                     metric === 'focusTime' ? '#3b82f6' : 
                     metric === 'tasksCompleted' ? '#10b981' : '#8b5cf6',
        backgroundColor: metric === 'pomodorosCompleted' ? '#ef444420' : 
                        metric === 'focusTime' ? '#3b82f620' : 
                        metric === 'tasksCompleted' ? '#10b98120' : '#8b5cf620',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getTodayStats = () => {
    const today = formatDate(new Date());
    const todayRecord = state.historicalData.find(record => record.date === today);
    
    return {
      pomodorosCompleted: todayRecord?.pomodorosCompleted || 0,
      focusTime: todayRecord?.focusTime || 0,
      tasksCompleted: todayRecord?.tasksCompleted || 0,
      sessionsCompleted: todayRecord?.sessionsCompleted || 0
    };
  };

  const value = {
    // State
    state, // Expose full state for reactivity
    historicalData: state.historicalData,
    currentPeriod: state.currentPeriod,
    insights: state.insights,

    // Actions
    addOrUpdateDailyRecord,
    setCurrentPeriod,

    // Computed
    getDataForPeriod,
    getChartData,
    getTodayStats,

    // Constants
    TIME_PERIODS
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};
