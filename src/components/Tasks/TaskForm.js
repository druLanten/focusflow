import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext';

const TaskForm = ({ onClose }) => {
  const { addTask, TASK_CATEGORIES, TASK_PRIORITIES } = useTasks();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: TASK_CATEGORIES.OTHER,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: '',
    pomodorosEstimated: 1
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (formData.pomodorosEstimated < 1 || formData.pomodorosEstimated > 20) {
      newErrors.pomodorosEstimated = 'Pomodoros must be between 1 and 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    addTask({
      ...formData,
      dueDate: formData.dueDate || null
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      category: TASK_CATEGORIES.OTHER,
      priority: TASK_PRIORITIES.MEDIUM,
      dueDate: '',
      pomodorosEstimated: 1
    });

    if (onClose) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Task</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-ring rounded p-1"
          >
            <span className="text-xl">×</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Name *
          </label>
          <input
            id="taskName"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring ${
              errors.name 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter task name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="taskDescription"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            placeholder="Add a description (optional)"
            rows="3"
          />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="taskCategory"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              <option value={TASK_CATEGORIES.WORK}>🏢 Work</option>
              <option value={TASK_CATEGORIES.PERSONAL}>👤 Personal</option>
              <option value={TASK_CATEGORIES.HEALTH}>💪 Health</option>
              <option value={TASK_CATEGORIES.LEARNING}>📚 Learning</option>
              <option value={TASK_CATEGORIES.OTHER}>📋 Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="taskPriority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              <option value={TASK_PRIORITIES.LOW}>🟢 Low</option>
              <option value={TASK_PRIORITIES.MEDIUM}>🟡 Medium</option>
              <option value={TASK_PRIORITIES.HIGH}>🟠 High</option>
              <option value={TASK_PRIORITIES.URGENT}>🔴 Urgent</option>
            </select>
          </div>
        </div>

        {/* Due Date and Pomodoros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              id="taskDueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            />
          </div>

          <div>
            <label htmlFor="taskPomodoros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Pomodoros
            </label>
            <input
              id="taskPomodoros"
              type="number"
              min="1"
              max="20"
              value={formData.pomodorosEstimated}
              onChange={(e) => handleChange('pomodorosEstimated', parseInt(e.target.value) || 1)}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring ${
                errors.pomodorosEstimated 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.pomodorosEstimated && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pomodorosEstimated}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus-ring"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors focus-ring"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
