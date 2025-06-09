const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  type: {
    type: String,
    enum: ['focus', 'short-break', 'long-break'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 minute']
  },
  plannedDuration: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  interrupted: {
    type: Boolean,
    default: false
  },
  interruptionReason: {
    type: String,
    maxlength: [200, 'Interruption reason cannot exceed 200 characters']
  },
  mode: {
    type: String,
    enum: ['25/5', '50/10'],
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  productivity: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      maxlength: [300, 'Feedback cannot exceed 300 characters']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, type: 1, createdAt: -1 });
sessionSchema.index({ taskId: 1, createdAt: -1 });

// Virtual for completion percentage
sessionSchema.virtual('completionPercentage').get(function() {
  if (this.plannedDuration === 0) return 0;
  return Math.min(100, Math.round((this.duration / this.plannedDuration) * 100));
});

// Ensure virtuals are included in JSON output
sessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Session', sessionSchema);
