const mongoose = require('mongoose');

const rewardRedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);

module.exports = RewardRedemption; 