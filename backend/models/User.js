const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'committee_member', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    required: false
  },
  studentId: {
    type: String,
    required: false
  },
  interests: [{
    type: String,
    enum: ['Chess', 'Basketball', 'Swimming', 'Athletics', 'Cricket', 
           'Badminton', 'Table Tennis', 'Hackathons', 'Cultural', 'Music', 
           'Dance', 'Technical', 'Academic', 'Other']
  }],
  profilePicture: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 5
  },
  bio: {
    type: String,
    maxlength: 500
  },
  participationHistory: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'won', 'cancelled'],
      default: 'registered'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attendanceDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'waived'],
      default: 'pending'
    },
    result: {
      rank: Number,
      points: Number,
      certificate: String
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: String,
    description: String,
    date: Date,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    certificate: String
  }],
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['event', 'announcement', 'reminder', 'achievement', 'system', 'payment']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  pushNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  committeeDetails: {
    committee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee'
    },
    position: String,
    joinDate: {
      type: Date,
      default: Date.now
    },
    permissions: [{
      type: String,
      enum: ['create_event', 'edit_event', 'delete_event', 'manage_participants', 
             'manage_attendance', 'manage_results', 'manage_sponsors', 'manage_venues',
             'approve_payments', 'create_announcements']
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 