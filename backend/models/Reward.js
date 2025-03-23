const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Rewards Schema
 * Used for tracking reward points, badges, achievements and leaderboards
 */
const RewardSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    total: {
      type: Number,
      default: 0
    },
    history: [{
      amount: {
        type: Number,
        required: true
      },
      reason: {
        type: String,
        required: true
      },
      source: {
        type: String,
        enum: ['event_participation', 'event_organization', 'achievement', 'committee_work', 'feedback', 'special_award', 'admin_grant', 'other'],
        required: true
      },
      sourceId: {
        type: Schema.Types.ObjectId,
        refPath: 'history.sourceModel'
      },
      sourceModel: {
        type: String,
        enum: ['Event', 'Committee', 'Certificate', null]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      expiresAt: {
        type: Date,
        default: null
      },
      isExpired: {
        type: Boolean,
        default: false
      },
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['participation', 'organization', 'achievement', 'special'],
      required: true
    },
    level: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'special'],
      required: true
    },
    imageUrl: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    requirements: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    progress: {
      current: {
        type: Number,
        default: 0
      },
      target: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    pointsAwarded: {
      type: Number,
      default: 0
    }
  }],
  skillPoints: {
    type: Map,
    of: Number,
    default: {}
  },
  rank: {
    current: {
      type: Number
    },
    previous: {
      type: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  levelInfo: {
    currentLevel: {
      type: Number,
      default: 1
    },
    pointsToNextLevel: {
      type: Number,
      default: 100
    },
    levelProgress: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
RewardSchema.index({ user: 1 }, { unique: true });
RewardSchema.index({ 'points.total': -1 });
RewardSchema.index({ 'rank.current': 1 });
RewardSchema.index({ 'levelInfo.currentLevel': 1 });

/**
 * Add points to user and update total
 */
RewardSchema.methods.addPoints = async function(pointData) {
  this.points.history.push(pointData);
  this.points.total += pointData.amount;
  
  // Update skill points if applicable
  if (pointData.skills) {
    for (const [skill, points] of Object.entries(pointData.skills)) {
      const currentPoints = this.skillPoints.get(skill) || 0;
      this.skillPoints.set(skill, currentPoints + points);
    }
  }

  // Update level info
  this.updateLevelInfo();
  
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Update user's level information based on total points
 */
RewardSchema.methods.updateLevelInfo = function() {
  // Basic level calculation - can be adjusted as needed
  const basePointsPerLevel = 100;
  const pointsScalingFactor = 1.5;
  
  const totalPoints = this.points.total;
  let level = 1;
  let accumulatedPoints = 0;
  let pointsForNextLevel = basePointsPerLevel;
  
  // Calculate level based on points
  while (accumulatedPoints + pointsForNextLevel <= totalPoints) {
    accumulatedPoints += pointsForNextLevel;
    level++;
    pointsForNextLevel = Math.round(basePointsPerLevel * Math.pow(pointsScalingFactor, level - 1));
  }
  
  // Calculate progress to next level
  const pointsInCurrentLevel = totalPoints - accumulatedPoints;
  const levelProgress = Math.min(Math.round((pointsInCurrentLevel / pointsForNextLevel) * 100), 99);
  
  this.levelInfo = {
    currentLevel: level,
    pointsToNextLevel: pointsForNextLevel,
    levelProgress: levelProgress
  };
};

/**
 * Add a badge to user
 */
RewardSchema.methods.addBadge = function(badgeData) {
  // Check if user already has this badge
  const existingBadge = this.badges.find(badge => badge.name === badgeData.name);
  
  if (existingBadge) {
    return false;
  }
  
  this.badges.push(badgeData);
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Update achievement progress
 */
RewardSchema.methods.updateAchievement = async function(achievementTitle, progressIncrement = 1) {
  // Find the achievement
  const achievement = this.achievements.find(a => a.title === achievementTitle);
  
  if (!achievement) {
    return false;
  }
  
  // If already completed, don't update
  if (achievement.isCompleted) {
    return false;
  }
  
  // Update progress
  achievement.progress.current = Math.min(
    achievement.progress.current + progressIncrement,
    achievement.progress.target
  );
  
  achievement.progress.percentage = Math.round(
    (achievement.progress.current / achievement.progress.target) * 100
  );
  
  // Check if completed
  if (achievement.progress.current >= achievement.progress.target) {
    achievement.isCompleted = true;
    achievement.completedAt = new Date();
    
    // Award points if achievement was completed
    if (achievement.pointsAwarded > 0) {
      await this.addPoints({
        amount: achievement.pointsAwarded,
        reason: `Completed achievement: ${achievement.title}`,
        source: 'achievement'
      });
    }
  }
  
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Static method to get leaderboard
 */
RewardSchema.statics.getLeaderboard = async function(options = {}) {
  const { limit = 10, skip = 0, category = null } = options;
  
  let aggregation = [];
  
  // Match stage for filtering
  if (category) {
    // For skill-specific leaderboards
    aggregation.push({
      $match: {
        [`skillPoints.${category}`]: { $exists: true, $gt: 0 }
      }
    });
  }
  
  // Sort by appropriate field
  if (category) {
    aggregation.push({
      $sort: {
        [`skillPoints.${category}`]: -1,
        'points.total': -1
      }
    });
  } else {
    aggregation.push({
      $sort: { 'points.total': -1 }
    });
  }
  
  // Pagination
  aggregation.push({ $skip: skip });
  aggregation.push({ $limit: limit });
  
  // Join with user collection to get user details
  aggregation.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userDetails'
    }
  });
  
  // Unwind the userDetails array
  aggregation.push({ $unwind: '$userDetails' });
  
  // Project only needed fields
  aggregation.push({
    $project: {
      _id: 1,
      user: 1,
      userName: '$userDetails.name',
      userDepartment: '$userDetails.department',
      userProfile: '$userDetails.profilePicture',
      points: category ? `$skillPoints.${category}` : '$points.total',
      level: '$levelInfo.currentLevel',
      badgeCount: { $size: '$badges' },
      achievements: {
        total: { $size: '$achievements' },
        completed: {
          $size: {
            $filter: {
              input: '$achievements',
              as: 'achievement',
              cond: { $eq: ['$$achievement.isCompleted', true] }
            }
          }
        }
      }
    }
  });
  
  return this.aggregate(aggregation);
};

/**
 * Update expired points
 */
RewardSchema.statics.updateExpiredPoints = async function() {
  const now = new Date();
  
  // Find all users with expirable points
  const usersWithExpiringPoints = await this.find({
    'points.history': {
      $elemMatch: {
        expiresAt: { $lte: now },
        isExpired: false
      }
    }
  });
  
  let updatesPerformed = 0;
  
  // Process each user
  for (const userReward of usersWithExpiringPoints) {
    let totalPointsToDeduct = 0;
    
    // Mark expired point entries and calculate deduction
    userReward.points.history.forEach(entry => {
      if (entry.expiresAt && entry.expiresAt <= now && !entry.isExpired) {
        entry.isExpired = true;
        totalPointsToDeduct += entry.amount;
      }
    });
    
    // Deduct from total
    if (totalPointsToDeduct > 0) {
      userReward.points.total -= totalPointsToDeduct;
      userReward.updatedAt = now;
      
      // Update level info
      userReward.updateLevelInfo();
      
      await userReward.save();
      updatesPerformed++;
    }
  }
  
  return updatesPerformed;
};

// Pre-save middleware to update timestamps
RewardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Reward', RewardSchema); 