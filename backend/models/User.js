const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    timerMode: {
      type: String,
      enum: ['25/5', '50/10'],
      default: '25/5'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    autoStartBreaks: {
      type: Boolean,
      default: false
    },
    autoStartPomodoros: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalPomodoros: {
      type: Number,
      default: 0
    },
    totalFocusTime: {
      type: Number,
      default: 0
    },
    totalBreakTime: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActiveDate: {
        type: Date,
        default: null
      }
    }
  },
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    },
    badges: [{
      id: String,
      name: String,
      description: String,
      icon: String,
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }],
    achievements: [{
      id: String,
      name: String,
      description: String,
      progress: {
        type: Number,
        default: 0
      },
      target: Number,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
