const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Badge and achievement definitions
const BADGES = {
  'first-pomodoro': {
    id: 'first-pomodoro',
    name: 'First Steps',
    description: 'Complete your first pomodoro session',
    icon: '🎯',
    condition: (stats) => stats.totalPomodoros >= 1
  },
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a pomodoro before 9 AM',
    icon: '🌅',
    condition: (stats, sessions) => {
      return sessions.some(session => {
        const hour = new Date(session.startTime).getHours();
        return hour < 9 && session.type === 'focus' && session.completed;
      });
    }
  },
  'night-owl': {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a pomodoro after 10 PM',
    icon: '🦉',
    condition: (stats, sessions) => {
      return sessions.some(session => {
        const hour = new Date(session.startTime).getHours();
        return hour >= 22 && session.type === 'focus' && session.completed;
      });
    }
  },
  'streak-3': {
    id: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    condition: (stats) => stats.streak.current >= 3
  },
  'streak-7': {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    condition: (stats) => stats.streak.current >= 7
  },
  'pomodoro-10': {
    id: 'pomodoro-10',
    name: 'Focused Mind',
    description: 'Complete 10 pomodoro sessions',
    icon: '🧠',
    condition: (stats) => stats.totalPomodoros >= 10
  },
  'pomodoro-50': {
    id: 'pomodoro-50',
    name: 'Productivity Master',
    description: 'Complete 50 pomodoro sessions',
    icon: '🏆',
    condition: (stats) => stats.totalPomodoros >= 50
  },
  'pomodoro-100': {
    id: 'pomodoro-100',
    name: 'Century Club',
    description: 'Complete 100 pomodoro sessions',
    icon: '💯',
    condition: (stats) => stats.totalPomodoros >= 100
  }
};

const ACHIEVEMENTS = {
  'daily-goal': {
    id: 'daily-goal',
    name: 'Daily Goal Achiever',
    description: 'Complete 4 pomodoros in a single day',
    progress: (stats, sessions) => {
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(session => 
        new Date(session.startTime).toDateString() === today &&
        session.type === 'focus' && 
        session.completed
      );
      return Math.min(todaySessions.length, 4);
    },
    target: 4
  },
  'focus-time': {
    id: 'focus-time',
    name: 'Deep Focus',
    description: 'Accumulate 25 hours of focus time',
    progress: (stats) => Math.min(Math.floor(stats.totalFocusTime / 60), 25 * 60),
    target: 25 * 60 // 25 hours in minutes
  },
  'task-completion': {
    id: 'task-completion',
    name: 'Task Master',
    description: 'Complete 20 tasks',
    progress: (stats, sessions, tasks) => {
      const completedTasks = tasks.filter(task => task.status === 'completed');
      return Math.min(completedTasks.length, 20);
    },
    target: 20
  }
};

// Calculate user level based on experience
const calculateLevel = (experience) => {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

// Calculate experience needed for next level
const experienceForNextLevel = (level) => {
  return (level * level) * 100;
};

// @route   GET /api/gamification
// @desc    Get user's gamification data
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      level: user.gamification.level,
      experience: user.gamification.experience,
      experienceForNext: experienceForNextLevel(user.gamification.level),
      badges: user.gamification.badges,
      achievements: user.gamification.achievements
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gamification/check-progress
// @desc    Check and update user's badges and achievements
// @access  Private
router.post('/check-progress', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { sessions = [], tasks = [] } = req.body;
    
    let newBadges = [];
    let updatedAchievements = [];
    let experienceGained = 0;
    
    // Check for new badges
    Object.values(BADGES).forEach(badge => {
      const alreadyHas = user.gamification.badges.some(userBadge => userBadge.id === badge.id);
      
      if (!alreadyHas && badge.condition(user.statistics, sessions)) {
        user.gamification.badges.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          unlockedAt: new Date()
        });
        newBadges.push(badge);
        experienceGained += 50; // Badge reward
      }
    });
    
    // Check and update achievements
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      let userAchievement = user.gamification.achievements.find(a => a.id === achievement.id);
      
      if (!userAchievement) {
        userAchievement = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          progress: 0,
          target: achievement.target,
          completed: false
        };
        user.gamification.achievements.push(userAchievement);
      }
      
      if (!userAchievement.completed) {
        const newProgress = achievement.progress(user.statistics, sessions, tasks);
        
        if (newProgress > userAchievement.progress) {
          userAchievement.progress = newProgress;
          experienceGained += (newProgress - userAchievement.progress) * 5; // Progress reward
          
          if (newProgress >= achievement.target) {
            userAchievement.completed = true;
            userAchievement.completedAt = new Date();
            experienceGained += 100; // Completion bonus
            updatedAchievements.push(userAchievement);
          }
        }
      }
    });
    
    // Update experience and level
    user.gamification.experience += experienceGained;
    const newLevel = calculateLevel(user.gamification.experience);
    const leveledUp = newLevel > user.gamification.level;
    user.gamification.level = newLevel;
    
    await user.save();
    
    res.json({
      newBadges,
      updatedAchievements,
      experienceGained,
      leveledUp,
      currentLevel: user.gamification.level,
      currentExperience: user.gamification.experience,
      experienceForNext: experienceForNextLevel(user.gamification.level)
    });
  } catch (error) {
    console.error('Check progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard data
// @access  Private
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all-time', limit = 10 } = req.query;
    
    let matchCondition = {};
    
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchCondition.updatedAt = { $gte: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchCondition.updatedAt = { $gte: monthAgo };
    }
    
    const leaderboard = await User.find(matchCondition)
      .select('username profile.firstName profile.lastName gamification.level gamification.experience statistics.totalPomodoros')
      .sort({ 'gamification.experience': -1 })
      .limit(parseInt(limit));
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      displayName: user.profile.firstName && user.profile.lastName 
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.username,
      level: user.gamification.level,
      experience: user.gamification.experience,
      totalPomodoros: user.statistics.totalPomodoros
    }));
    
    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/badges
// @desc    Get all available badges
// @access  Private
router.get('/badges', async (req, res) => {
  try {
    res.json(Object.values(BADGES));
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/achievements
// @desc    Get all available achievements
// @access  Private
router.get('/achievements', async (req, res) => {
  try {
    res.json(Object.values(ACHIEVEMENTS));
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
