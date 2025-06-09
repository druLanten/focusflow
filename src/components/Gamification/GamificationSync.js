import { useEffect, useCallback } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { useTasks } from '../../contexts/TaskContext';
import { useStatistics } from '../../contexts/StatisticsContext';
import { useGamification } from '../../contexts/GamificationContext';

const GamificationSync = () => {
  const { dailyStats, pomodoroCount, sessionType, status, TIMER_STATUS } = useTimer();
  const { allTasks } = useTasks();
  const { insights, addOrUpdateDailyRecord } = useStatistics();
  const { updateStats, recordSessionTime, markDailyGoalReached } = useGamification();

  // Debounced sync function to prevent excessive updates
  const syncAllStats = useCallback(() => {
    if (!allTasks || !dailyStats) return;

    const today = new Date().toDateString();
    const completedTasks = allTasks.filter(task => task.completed).length;
    const todayCompletedTasks = allTasks.filter(task =>
      task.completed &&
      task.completedAt &&
      new Date(task.completedAt).toDateString() === today
    ).length;

    // Update Statistics Context
    addOrUpdateDailyRecord(today, {
      pomodorosCompleted: dailyStats.pomodorosCompleted,
      focusTime: dailyStats.focusTime,
      tasksCompleted: todayCompletedTasks,
      sessionsCompleted: pomodoroCount
    });

    // Update Gamification Context
    updateStats({
      totalPomodoros: dailyStats.pomodorosCompleted,
      totalTasks: completedTasks,
      currentStreak: insights?.streak || 0,
      dailyPomodoros: dailyStats.pomodorosCompleted
    });

    console.log('📊 Stats synced:', {
      dailyStats,
      completedTasks,
      todayCompletedTasks,
      pomodoroCount,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [allTasks, dailyStats, pomodoroCount, insights, addOrUpdateDailyRecord, updateStats]);

  // Sync stats when any relevant data changes
  useEffect(() => {
    const timeoutId = setTimeout(syncAllStats, 100); // Debounce updates
    return () => clearTimeout(timeoutId);
  }, [syncAllStats]);

  // Record session time for early bird/night owl badges
  useEffect(() => {
    if (status === TIMER_STATUS.COMPLETED && sessionType === 'focus') {
      recordSessionTime();
    }
  }, [status, sessionType, recordSessionTime, TIMER_STATUS]);

  // Check daily goal achievement
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('focusflow-settings') || '{}');
    const dailyGoal = settings.dailyPomodoroGoal || 8;
    
    if (dailyStats.pomodorosCompleted >= dailyGoal) {
      markDailyGoalReached();
    }
  }, [dailyStats.pomodorosCompleted, markDailyGoalReached]);

  return null; // This component doesn't render anything
};

export default GamificationSync;
