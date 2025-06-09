const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Session = require('../models/Session');

const router = express.Router();

// @route   GET /api/stats/overview
// @desc    Get user statistics overview
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPomodoros: { $sum: '$completedPomodoros' },
          totalEstimated: { $sum: '$estimatedPomodoros' }
        }
      }
    ]);
    
    // Get recent sessions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = await Session.find({
      userId: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });
    
    // Calculate daily statistics for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Session.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: sevenDaysAgo },
          type: 'focus',
          completed: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          sessions: { $sum: 1 },
          totalTime: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      user: {
        statistics: user.statistics,
        gamification: user.gamification
      },
      tasks: taskStats,
      recentSessions: recentSessions.slice(0, 10), // Last 10 sessions
      dailyStats
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stats/daily
// @desc    Get daily statistics for a date range
// @access  Private
router.get('/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const dailyStats = await Session.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          sessions: { $sum: 1 },
          totalTime: { $sum: '$duration' },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          stats: {
            $push: {
              type: '$_id.type',
              sessions: '$sessions',
              totalTime: '$totalTime',
              completedSessions: '$completedSessions'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(dailyStats);
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stats/session
// @desc    Record a new session
// @access  Private
router.post('/session', async (req, res) => {
  try {
    const {
      taskId,
      type,
      duration,
      plannedDuration,
      startTime,
      endTime,
      completed,
      interrupted,
      interruptionReason,
      mode,
      notes,
      productivity
    } = req.body;
    
    // Create session
    const session = new Session({
      userId: req.user.id,
      taskId: taskId || null,
      type,
      duration,
      plannedDuration,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      completed,
      interrupted,
      interruptionReason,
      mode,
      notes,
      productivity
    });
    
    await session.save();
    
    // Update user statistics
    const user = await User.findById(req.user.id);
    
    if (type === 'focus' && completed) {
      user.statistics.totalPomodoros += 1;
      user.statistics.totalFocusTime += duration;
      
      // Update streak
      const today = new Date().toDateString();
      const lastActiveDate = user.statistics.streak.lastActiveDate;
      
      if (!lastActiveDate || lastActiveDate.toDateString() !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActiveDate && lastActiveDate.toDateString() === yesterday.toDateString()) {
          user.statistics.streak.current += 1;
        } else {
          user.statistics.streak.current = 1;
        }
        
        user.statistics.streak.lastActiveDate = new Date();
        
        if (user.statistics.streak.current > user.statistics.streak.longest) {
          user.statistics.streak.longest = user.statistics.streak.current;
        }
      }
    } else if (type.includes('break') && completed) {
      user.statistics.totalBreakTime += duration;
    }
    
    await user.save();
    
    res.status(201).json({
      message: 'Session recorded successfully',
      session
    });
  } catch (error) {
    console.error('Record session error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stats/productivity
// @desc    Get productivity analytics
// @access  Private
router.get('/productivity', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const productivityStats = await Session.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate },
          type: 'focus',
          'productivity.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$productivity.rating' },
          totalSessions: { $sum: 1 },
          ratingDistribution: {
            $push: '$productivity.rating'
          }
        }
      }
    ]);
    
    // Calculate completion rate
    const completionStats = await Session.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: startDate },
          type: 'focus'
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          },
          averageCompletion: {
            $avg: { $multiply: [{ $divide: ['$duration', '$plannedDuration'] }, 100] }
          }
        }
      }
    ]);
    
    res.json({
      productivity: productivityStats[0] || null,
      completion: completionStats[0] || null
    });
  } catch (error) {
    console.error('Get productivity stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
