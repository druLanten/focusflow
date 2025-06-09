const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = { userId: req.user.id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get tasks with pagination
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Task.countDocuments(filter);
    
    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      estimatedPomodoros,
      dueDate,
      tags,
      notes
    } = req.body;
    
    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const task = new Task({
      userId: req.user.id,
      title,
      description,
      category,
      priority,
      estimatedPomodoros,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags,
      notes
    });
    
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      estimatedPomodoros,
      dueDate,
      tags,
      notes
    } = req.body;
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (estimatedPomodoros !== undefined) task.estimatedPomodoros = estimatedPomodoros;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = tags;
    if (notes !== undefined) task.notes = notes;
    
    await task.save();
    
    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/pomodoro
// @desc    Add a pomodoro session to a task
// @access  Private
router.post('/:id/pomodoro', async (req, res) => {
  try {
    const { startTime, endTime, duration, type, completed = true } = req.body;
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add pomodoro session
    task.pomodoroSessions.push({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      type,
      completed
    });
    
    // Update completed pomodoros count if it's a focus session
    if (type === 'focus' && completed) {
      task.completedPomodoros += 1;
      
      // Update status if task is completed
      if (task.completedPomodoros >= task.estimatedPomodoros && task.status !== 'completed') {
        task.status = 'completed';
      } else if (task.status === 'pending') {
        task.status = 'in-progress';
      }
    }
    
    await task.save();
    
    res.json({
      message: 'Pomodoro session added successfully',
      task
    });
  } catch (error) {
    console.error('Add pomodoro error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
