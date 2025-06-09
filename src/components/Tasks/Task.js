import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext';

const Task = ({ task, isDragging = false }) => {
  const { updateTask, deleteTask, toggleTask, PRIORITY_COLORS, CATEGORY_COLORS } = useTasks();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: task.name || task.title || '',
    description: task.description || '',
    category: task.category || 'other',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    pomodorosEstimated: task.pomodorosEstimated || task.estimatedPomodoros || 1
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const taskId = task.id || task._id;
    updateTask(taskId, {
      ...editForm,
      dueDate: editForm.dueDate || null
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: task.name || task.title || '',
      description: task.description || '',
      category: task.category || 'other',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      pomodorosEstimated: task.pomodorosEstimated || task.estimatedPomodoros || 1
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskId = task.id || task._id;
      deleteTask(taskId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="space-y-4">
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            placeholder="Task name"
          />
          
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            placeholder="Description (optional)"
            rows="2"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>

            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            />

            <input
              type="number"
              min="1"
              max="20"
              value={editForm.pomodorosEstimated}
              onChange={(e) => setEditForm({ ...editForm, pomodorosEstimated: parseInt(e.target.value) || 1 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
              placeholder="Pomodoros"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors focus-ring"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
      isDragging ? 'opacity-50 transform rotate-2' : ''
    } ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id || task._id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors focus-ring ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          }`}
        >
          {task.completed && <span className="text-xs">✓</span>}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium text-gray-900 dark:text-white ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
              }`}>
                {task.name || task.title || 'Untitled Task'}
              </h3>

              {task.description && (
                <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 ${
                  task.completed ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}

              {/* Tags and metadata */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[task.category]}`}>
                  {task.category}
                </span>

                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isOverdue
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    📅 {formatDate(task.dueDate)}
                  </span>
                )}

                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  🍅 {task.pomodorosCompleted || task.completedPomodoros || 0}/{task.pomodorosEstimated || task.estimatedPomodoros || 1}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-ring rounded"
                title="Edit task"
              >
                <span className="text-sm">✏️</span>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus-ring rounded"
                title="Delete task"
              >
                <span className="text-sm">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
