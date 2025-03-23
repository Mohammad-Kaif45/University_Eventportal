const mongoose = require('mongoose');

const committeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'sports', 'cultural', 'technical', 'social', 'other']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['chairperson', 'coordinator', 'member'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Committee', committeeSchema); 