const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'study', 'health', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedPomodoros: {
    type: Number,
    min: [1, 'Estimated pomodoros must be at least 1'],
    max: [20, 'Estimated pomodoros cannot exceed 20'],
    default: 1
  },
  completedPomodoros: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  pomodoroSessions: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['focus', 'break'],
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    }
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.estimatedPomodoros === 0) return 0;
  return Math.min(100, Math.round((this.completedPomodoros / this.estimatedPomodoros) * 100));
});

// Virtual for total focus time
taskSchema.virtual('totalFocusTime').get(function() {
  return this.pomodoroSessions
    .filter(session => session.type === 'focus' && session.completed)
    .reduce((total, session) => total + session.duration, 0);
});

// Ensure virtuals are included in JSON output
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
