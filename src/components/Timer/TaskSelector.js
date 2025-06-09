import React, { useState, useEffect } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';

const TaskSelector = () => {
  const { currentTask, setCurrentTask, sessionType, status, SESSION_TYPES, TIMER_STATUS } = useTimer();
  const { allTasks, updateTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [lastCompletedSession, setLastCompletedSession] = useState(null);

  // Auto-increment task Pomodoros when focus session completes
  useEffect(() => {
    if (
      status === TIMER_STATUS.COMPLETED &&
      sessionType === SESSION_TYPES.FOCUS &&
      currentTask &&
      lastCompletedSession !== status
    ) {
      incrementTaskPomodoro();
      setLastCompletedSession(status);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionType, currentTask, lastCompletedSession]);

  // Only show active (incomplete) tasks
  const safeTasks = Array.isArray(allTasks) ? allTasks : [];
  const activeTasks = safeTasks.filter(task => task && !task.completed);

  const handleTaskSelect = (task) => {
    setCurrentTask(task);
    setIsOpen(false);
  };

  const handleClearTask = () => {
    setCurrentTask(null);
    setIsOpen(false);
  };

  const incrementTaskPomodoro = () => {
    if (currentTask) {
      updateTask(currentTask.id, {
        pomodorosCompleted: currentTask.pomodorosCompleted + 1
      });
      // Update the current task state to reflect the change
      setCurrentTask({
        ...currentTask,
        pomodorosCompleted: currentTask.pomodorosCompleted + 1
      });
    }
  };

  // Only show task selector during focus sessions
  if (sessionType !== SESSION_TYPES.FOCUS) {
    return null;
  }

  return (
    <div className="card-gradient p-4 animate-fade-in-up">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
        <span className="animate-bounce-gentle">🎯</span>
        <span>Focus Task</span>
      </h3>

      {currentTask ? (
        <div className="space-y-3">
          {/* Selected Task Display */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                  {currentTask.name}
                </h4>
                {currentTask.description && (
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                    {currentTask.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    🍅 {currentTask.pomodorosCompleted}/{currentTask.pomodorosEstimated}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    {currentTask.category}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClearTask}
                className="ml-2 p-1 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus-ring rounded"
                title="Clear task"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          </div>

          {/* Pomodoro Progress */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTask.pomodorosCompleted} of {currentTask.pomodorosEstimated} Pomodoros
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((currentTask.pomodorosCompleted / currentTask.pomodorosEstimated) * 100, 100)}%`
                }}
              />
            </div>
            {currentTask.pomodorosCompleted >= currentTask.pomodorosEstimated && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                🎉 Task completed! Great job!
              </p>
            )}
          </div>

          {/* Manual Pomodoro Increment */}
          <button
            onClick={incrementTaskPomodoro}
            className="btn-success w-full py-2 px-4 rounded-xl text-sm font-medium"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>+</span>
              <span>Add Completed Pomodoro</span>
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* No Task Selected */}
          <div className="text-center py-4">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📝</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select a task to focus on during this Pomodoro session
            </p>
          </div>

          {/* Task Selection Button */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-primary w-full py-2 px-4 rounded-xl font-medium"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>📋</span>
                <span>Choose Task</span>
              </span>
            </button>

            {/* Task Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto animate-fade-in-up backdrop-blur-sm">
                {activeTasks.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No active tasks available.
                    <br />
                    <span className="text-sm">Create some tasks first!</span>
                  </div>
                ) : (
                  <div className="py-1">
                    {activeTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskSelect(task)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                🍅 {task.pomodorosCompleted}/{task.pomodorosEstimated}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {task.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TaskSelector;
