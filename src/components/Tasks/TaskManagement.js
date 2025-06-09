import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const TaskManagement = () => {
  const { stats } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-slide-in-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
              <span className="animate-bounce-gentle">📝</span>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Task Management
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Organize your tasks and boost productivity with the Pomodoro technique!
            </p>
          </div>

          <div className="mt-4 sm:mt-0 animate-slide-in-right">
            <button
              onClick={toggleAddForm}
              className="btn-primary inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl"
            >
              <span className="mr-2 text-lg">+</span>
              Add New Task
            </button>
          </div>
        </div>

        {/* Quick overview */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 animate-scale-in">
              {stats.total}
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
              Total Tasks
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-scale-in">
              {stats.active}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Active
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 animate-scale-in">
              {stats.completed}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">
              Completed
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 animate-scale-in">
              {stats.overdue}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 font-medium">
              Overdue
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="animate-fade-in-up">
          <TaskForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Task List */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <TaskList />
      </div>

      {/* Tips and shortcuts */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <span className="animate-float">💡</span>
          <span>Productivity Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Break large tasks into smaller, manageable chunks</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Set realistic Pomodoro estimates for better planning</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Use categories to organize tasks by context</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Set due dates to maintain accountability</span>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="card-gradient p-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">
            <span className="flex items-center space-x-2">
              <span className="animate-wiggle">⌨️</span>
              <span>Keyboard Shortcuts</span>
            </span>
            <span className="transform transition-transform duration-300 group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Add new task</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Search tasks</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + F</kbd>
            </div>
            <div className="flex justify-between">
              <span>Toggle task</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Delete task</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Del</kbd>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TaskManagement;
