import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Task Context
const TaskContext = createContext();

// Custom hook to use task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

// Task priorities and categories
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_CATEGORIES = {
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  LEARNING: 'learning',
  OTHER: 'other'
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [TASK_PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [TASK_PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [TASK_PRIORITIES.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const CATEGORY_COLORS = {
  [TASK_CATEGORIES.WORK]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  [TASK_CATEGORIES.PERSONAL]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [TASK_CATEGORIES.HEALTH]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  [TASK_CATEGORIES.LEARNING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [TASK_CATEGORIES.OTHER]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

// Initial state
const initialState = {
  tasks: [],
  filter: 'all', // all, active, completed
  sortBy: 'created', // created, priority, dueDate, name
  searchQuery: '',
  isLoading: false,
  error: null,
  syncWithBackend: true
};

// Action types
const ACTIONS = {
  LOAD_TASKS_START: 'LOAD_TASKS_START',
  LOAD_TASKS_SUCCESS: 'LOAD_TASKS_SUCCESS',
  LOAD_TASKS_ERROR: 'LOAD_TASKS_ERROR',
  ADD_TASK_START: 'ADD_TASK_START',
  ADD_TASK_SUCCESS: 'ADD_TASK_SUCCESS',
  ADD_TASK_ERROR: 'ADD_TASK_ERROR',
  UPDATE_TASK_START: 'UPDATE_TASK_START',
  UPDATE_TASK_SUCCESS: 'UPDATE_TASK_SUCCESS',
  UPDATE_TASK_ERROR: 'UPDATE_TASK_ERROR',
  DELETE_TASK_START: 'DELETE_TASK_START',
  DELETE_TASK_SUCCESS: 'DELETE_TASK_SUCCESS',
  DELETE_TASK_ERROR: 'DELETE_TASK_ERROR',
  TOGGLE_TASK: 'TOGGLE_TASK',
  REORDER_TASKS: 'REORDER_TASKS',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
  SET_SEARCH: 'SET_SEARCH',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED',
  SET_SYNC_MODE: 'SET_SYNC_MODE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_TASKS_START:
    case ACTIONS.ADD_TASK_START:
    case ACTIONS.UPDATE_TASK_START:
    case ACTIONS.DELETE_TASK_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case ACTIONS.LOAD_TASKS_SUCCESS:
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null
      };

    case ACTIONS.ADD_TASK_SUCCESS:
      return {
        ...state,
        tasks: [...(Array.isArray(state.tasks) ? state.tasks : []), action.payload],
        isLoading: false,
        error: null
      };

    case ACTIONS.UPDATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: Array.isArray(state.tasks) ? state.tasks.map(task =>
          task && (task.id === action.payload.id || task._id === action.payload._id)
            ? { ...task, ...action.payload } : task
        ) : [],
        isLoading: false,
        error: null
      };

    case ACTIONS.DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: Array.isArray(state.tasks) ? state.tasks.filter(task =>
          task && task.id !== action.payload && task._id !== action.payload
        ) : [],
        isLoading: false,
        error: null
      };

    case ACTIONS.LOAD_TASKS_ERROR:
    case ACTIONS.ADD_TASK_ERROR:
    case ACTIONS.UPDATE_TASK_ERROR:
    case ACTIONS.DELETE_TASK_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case ACTIONS.TOGGLE_TASK:
      return {
        ...state,
        tasks: Array.isArray(state.tasks) ? state.tasks.map(task => {
          if (task && (task.id === action.payload || task._id === action.payload)) {
            const willBeCompleted = task.status !== 'completed';
            return {
              ...task,
              status: willBeCompleted ? 'completed' : 'pending',
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : null,
              completedPomodoros: willBeCompleted && task.completedPomodoros === 0 ? 1 : task.completedPomodoros
            };
          }
          return task;
        }) : []
      };

    case ACTIONS.REORDER_TASKS:
      return {
        ...state,
        tasks: action.payload
      };

    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };

    case ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload
      };

    case ACTIONS.SET_SEARCH:
      return {
        ...state,
        searchQuery: action.payload
      };

    case ACTIONS.CLEAR_COMPLETED:
      return {
        ...state,
        tasks: Array.isArray(state.tasks) ? state.tasks.filter(task => task && !task.completed) : []
      };

    case ACTIONS.SET_SYNC_MODE:
      return {
        ...state,
        syncWithBackend: action.payload
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Utility functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const saveToLocalStorage = (tasks) => {
  try {
    localStorage.setItem('focusflow-tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('focusflow-tasks');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
};

// Task Provider Component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load tasks on mount and when authentication changes
  useEffect(() => {
    const loadTasks = async () => {
      if (isAuthenticated && state.syncWithBackend) {
        try {
          dispatch({ type: ACTIONS.LOAD_TASKS_START });
          const response = await tasksAPI.getTasks();

          // Map backend task fields to frontend format
          const mappedTasks = (response.tasks || []).map(task => ({
            ...task,
            id: task._id,
            name: task.title,
            completed: task.status === 'completed',
            pomodorosEstimated: task.estimatedPomodoros,
            pomodorosCompleted: task.completedPomodoros
          }));

          dispatch({ type: ACTIONS.LOAD_TASKS_SUCCESS, payload: mappedTasks });
        } catch (error) {
          console.error('Failed to load tasks from backend:', error);
          dispatch({ type: ACTIONS.LOAD_TASKS_ERROR, payload: error.message });

          // Fallback to localStorage
          const savedTasks = loadFromLocalStorage();
          dispatch({ type: ACTIONS.LOAD_TASKS_SUCCESS, payload: savedTasks });
        }
      } else {
        // Load from localStorage when not authenticated or sync disabled
        const savedTasks = loadFromLocalStorage();
        dispatch({ type: ACTIONS.LOAD_TASKS_SUCCESS, payload: savedTasks });
      }
    };

    loadTasks();
  }, [isAuthenticated, state.syncWithBackend]);

  // Save tasks to localStorage whenever tasks change (backup)
  useEffect(() => {
    if (state.tasks.length > 0 || loadFromLocalStorage().length > 0) {
      saveToLocalStorage(state.tasks);
    }
  }, [state.tasks]);

  // Action creators
  const addTask = async (taskData) => {
    if (isAuthenticated && state.syncWithBackend) {
      try {
        dispatch({ type: ACTIONS.ADD_TASK_START });

        const backendTaskData = {
          title: taskData.name,
          description: taskData.description || '',
          category: taskData.category || TASK_CATEGORIES.OTHER,
          priority: taskData.priority || TASK_PRIORITIES.MEDIUM,
          dueDate: taskData.dueDate || null,
          estimatedPomodoros: taskData.pomodorosEstimated || 1,
          tags: taskData.tags || []
        };

        const response = await tasksAPI.createTask(backendTaskData);
        const newTask = {
          ...response.task,
          id: response.task._id,
          name: response.task.title,
          completed: response.task.status === 'completed',
          pomodorosEstimated: response.task.estimatedPomodoros,
          pomodorosCompleted: response.task.completedPomodoros
        };

        dispatch({ type: ACTIONS.ADD_TASK_SUCCESS, payload: newTask });
        return newTask;
      } catch (error) {
        console.error('Failed to add task to backend:', error);
        dispatch({ type: ACTIONS.ADD_TASK_ERROR, payload: error.message });

        // Fallback to local storage
        const localTask = {
          id: generateId(),
          name: taskData.name,
          description: taskData.description || '',
          category: taskData.category || TASK_CATEGORIES.OTHER,
          priority: taskData.priority || TASK_PRIORITIES.MEDIUM,
          dueDate: taskData.dueDate || null,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          pomodorosEstimated: taskData.pomodorosEstimated || 1,
          pomodorosCompleted: 0
        };

        dispatch({ type: ACTIONS.ADD_TASK_SUCCESS, payload: localTask });
        return localTask;
      }
    } else {
      // Local-only mode
      const newTask = {
        id: generateId(),
        name: taskData.name,
        description: taskData.description || '',
        category: taskData.category || TASK_CATEGORIES.OTHER,
        priority: taskData.priority || TASK_PRIORITIES.MEDIUM,
        dueDate: taskData.dueDate || null,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        pomodorosEstimated: taskData.pomodorosEstimated || 1,
        pomodorosCompleted: 0
      };

      dispatch({ type: ACTIONS.ADD_TASK_SUCCESS, payload: newTask });
      return newTask;
    }
  };

  const updateTask = async (id, updates) => {
    if (isAuthenticated && state.syncWithBackend) {
      try {
        dispatch({ type: ACTIONS.UPDATE_TASK_START });

        const backendUpdates = {
          title: updates.name,
          description: updates.description,
          category: updates.category,
          priority: updates.priority,
          status: updates.completed ? 'completed' : 'pending',
          dueDate: updates.dueDate,
          estimatedPomodoros: updates.pomodorosEstimated,
          tags: updates.tags
        };

        const response = await tasksAPI.updateTask(id, backendUpdates);
        const updatedTask = {
          ...response.task,
          id: response.task._id,
          name: response.task.title,
          completed: response.task.status === 'completed',
          pomodorosEstimated: response.task.estimatedPomodoros,
          pomodorosCompleted: response.task.completedPomodoros
        };

        dispatch({ type: ACTIONS.UPDATE_TASK_SUCCESS, payload: updatedTask });
      } catch (error) {
        console.error('Failed to update task on backend:', error);
        dispatch({ type: ACTIONS.UPDATE_TASK_ERROR, payload: error.message });

        // Fallback to local update
        dispatch({ type: ACTIONS.UPDATE_TASK_SUCCESS, payload: { id, ...updates } });
      }
    } else {
      // Local-only mode
      dispatch({ type: ACTIONS.UPDATE_TASK_SUCCESS, payload: { id, ...updates } });
    }
  };

  const deleteTask = async (id) => {
    if (isAuthenticated && state.syncWithBackend) {
      try {
        dispatch({ type: ACTIONS.DELETE_TASK_START });
        await tasksAPI.deleteTask(id);
        dispatch({ type: ACTIONS.DELETE_TASK_SUCCESS, payload: id });
      } catch (error) {
        console.error('Failed to delete task from backend:', error);
        dispatch({ type: ACTIONS.DELETE_TASK_ERROR, payload: error.message });

        // Fallback to local delete
        dispatch({ type: ACTIONS.DELETE_TASK_SUCCESS, payload: id });
      }
    } else {
      // Local-only mode
      dispatch({ type: ACTIONS.DELETE_TASK_SUCCESS, payload: id });
    }
  };

  const toggleTask = async (id) => {
    const task = state.tasks.find(t => t && (t.id === id || t._id === id));
    if (!task) return;

    const willBeCompleted = !task.completed;
    console.log('🎯 Task toggled:', { id, wasCompleted: task.completed, willBeCompleted });

    if (isAuthenticated && state.syncWithBackend) {
      try {
        // Update task status on backend
        const backendUpdates = {
          status: willBeCompleted ? 'completed' : 'pending'
        };

        const response = await tasksAPI.updateTask(id, backendUpdates);
        const updatedTask = {
          ...response.task,
          id: response.task._id,
          name: response.task.title,
          completed: response.task.status === 'completed',
          pomodorosEstimated: response.task.estimatedPomodoros,
          pomodorosCompleted: response.task.completedPomodoros
        };

        dispatch({ type: ACTIONS.UPDATE_TASK_SUCCESS, payload: updatedTask });
      } catch (error) {
        console.error('Failed to toggle task on backend:', error);
        // Fallback to local toggle
        dispatch({ type: ACTIONS.TOGGLE_TASK, payload: id });
      }
    } else {
      // Local-only mode
      dispatch({ type: ACTIONS.TOGGLE_TASK, payload: id });
    }
  };

  const reorderTasks = (newOrder) => {
    dispatch({ type: ACTIONS.REORDER_TASKS, payload: newOrder });
  };

  const setFilter = (filter) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter });
  };

  const setSortBy = (sortBy) => {
    dispatch({ type: ACTIONS.SET_SORT, payload: sortBy });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: ACTIONS.SET_SEARCH, payload: query });
  };

  const clearCompleted = () => {
    dispatch({ type: ACTIONS.CLEAR_COMPLETED });
  };

  const setSyncMode = (enabled) => {
    dispatch({ type: ACTIONS.SET_SYNC_MODE, payload: enabled });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Computed values
  const getFilteredAndSortedTasks = () => {
    // Ensure state.tasks is an array
    if (!Array.isArray(state.tasks)) {
      return [];
    }

    let filtered = state.tasks;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        (task && task.name && task.name.toLowerCase().includes(query)) ||
        (task && task.description && task.description.toLowerCase().includes(query)) ||
        (task && task.category && task.category.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (state.filter) {
      case 'active':
        filtered = filtered.filter(task => task && !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task && task.completed);
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const getTaskStats = () => {
    // Ensure state.tasks is an array
    if (!Array.isArray(state.tasks)) {
      return { total: 0, completed: 0, active: 0, overdue: 0 };
    }

    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task && task.completed).length;
    const active = total - completed;
    const overdue = state.tasks.filter(task =>
      task && !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
    ).length;

    return { total, completed, active, overdue };
  };

  const value = {
    // State
    tasks: getFilteredAndSortedTasks(),
    allTasks: Array.isArray(state.tasks) ? state.tasks : [],
    filter: state.filter,
    sortBy: state.sortBy,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    error: state.error,
    syncWithBackend: state.syncWithBackend,

    // Actions
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    setFilter,
    setSortBy,
    setSearchQuery,
    clearCompleted,
    setSyncMode,
    clearError,

    // Computed
    stats: getTaskStats(),

    // Constants
    TASK_PRIORITIES,
    TASK_CATEGORIES,
    PRIORITY_COLORS,
    CATEGORY_COLORS
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
