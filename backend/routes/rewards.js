const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const committeePermissionCheck = require('../middleware/commiteePermissionCheck');
const Notification = require('../models/Notification');

// @route   GET api/rewards
// @desc    Get all available rewards
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find({ available: true });
    res.json(rewards);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rewards/:id
// @desc    Get reward by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    res.json(reward);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/rewards
// @desc    Create a new reward
// @access  Private (Admin only)
router.post('/', 
  auth,
  checkRole(['admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('image').notEmpty().withMessage('Image URL is required'),
    body('points').isInt({ min: 0 }).withMessage('Points must be a positive number'),
    body('category').isIn(['Merchandise', 'Privilege', 'Service', 'Other'])
      .withMessage('Invalid category'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reward = new Reward(req.body);
      await reward.save();
      res.status(201).json(reward);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/rewards/:id
// @desc    Update a reward
// @access  Private (Admin only)
router.put('/:id', 
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const reward = await Reward.findById(req.params.id);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }

      Object.assign(reward, req.body);
      await reward.save();
      res.json(reward);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/rewards/:id
// @desc    Delete a reward
// @access  Private (Admin only)
router.delete('/:id', 
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const reward = await Reward.findById(req.params.id);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }

      await reward.remove();
      res.json({ message: 'Reward removed' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/rewards/:id/redeem
// @desc    Redeem a reward
// @access  Private
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    if (!reward.available || reward.quantity <= 0) {
      return res.status(400).json({ message: 'Reward is not available' });
    }

    const user = await User.findById(req.user.userId);
    if (user.points < reward.points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Create redemption record
    const redemption = new RewardRedemption({
      user: req.user.userId,
      reward: reward._id,
      points: reward.points
    });
    await redemption.save();

    // Update user points and reward quantity
    user.points -= reward.points;
    reward.quantity -= 1;
    if (reward.quantity === 0) {
      reward.available = false;
    }

    await Promise.all([user.save(), reward.save()]);

    res.json({
      message: 'Reward redeemed successfully',
      redemption,
      remainingPoints: user.points
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rewards/user/redemptions
// @desc    Get user's reward redemptions
// @access  Private
router.get('/user/redemptions', auth, async (req, res) => {
  try {
    const redemptions = await RewardRedemption.find({ user: req.user.userId })
      .populate('reward', 'title description image points')
      .sort({ redeemedAt: -1 });

    res.json(redemptions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/rewards/redemptions/:id/status
// @desc    Update redemption status
// @access  Private (Admin only)
router.put('/redemptions/:id/status', 
  auth,
  checkRole(['admin']),
  [
    body('status').isIn(['pending', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const redemption = await RewardRedemption.findById(req.params.id);
      if (!redemption) {
        return res.status(404).json({ message: 'Redemption not found' });
      }

      const { status } = req.body;
      redemption.status = status;
      
      if (status === 'completed') {
        redemption.completedAt = Date.now();
      } else if (status === 'cancelled') {
        // Refund points to user
        const user = await User.findById(redemption.user);
        user.points += redemption.points;
        await user.save();

        // Restore reward quantity
        const reward = await Reward.findById(redemption.reward);
        reward.quantity += 1;
        reward.available = true;
        await reward.save();
      }

      await redemption.save();
      res.json(redemption);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   GET /api/rewards/user/:userId?
 * @desc    Get user's rewards (current user if no userId provided)
 * @access  Private
 */
router.get('/user/:userId?', auth, async (req, res) => {
  try {
    // Determine which user to fetch rewards for
    const userId = req.params.userId || req.user.id;
    
    // If trying to access another user's rewards, check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view other users\' rewards' });
    }
    
    // Find user's rewards
    let userRewards = await Reward.findOne({ user: userId });
    
    // If no rewards record exists yet, create one
    if (!userRewards) {
      userRewards = new Reward({ user: userId });
      await userRewards.save();
    }
    
    // Populate user basic info
    const userInfo = await User.findById(userId).select('name email department profilePicture');
    
    res.json({
      userInfo,
      rewards: userRewards
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/rewards/leaderboard
 * @desc    Get rewards leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const category = req.query.category || null; // Optional skill category
    
    // Get leaderboard data
    const leaderboard = await Reward.getLeaderboard({
      limit,
      skip,
      category
    });
    
    // Get total count for pagination
    const total = await Reward.countDocuments(
      category ? { [`skillPoints.${category}`]: { $exists: true, $gt: 0 } } : {}
    );
    
    res.json({
      leaderboard,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/rewards/points
 * @desc    Add points to a user
 * @access  Private (Admin, Committee with permission)
 */
router.post('/points', 
  auth, 
  (req, res, next) => {
    // Allow admin or committee with rewards permission
    if (req.user.role === 'admin') return next();
    return committeePermissionCheck('manage_rewards')(req, res, next);
  }, 
  async (req, res) => {
    try {
      const {
        userId,
        amount,
        reason,
        source,
        sourceId,
        sourceModel,
        skills,
        expiresAt
      } = req.body;
      
      // Validate required fields
      if (!userId || !amount || !reason || !source) {
        return res.status(400).json({ 
          msg: 'User ID, amount, reason, and source are required' 
        });
      }
      
      // Validate amount is a number
      if (isNaN(amount) || amount === 0) {
        return res.status(400).json({ msg: 'Points amount must be a non-zero number' });
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Find or create user's rewards record
      let userRewards = await Reward.findOne({ user: userId });
      if (!userRewards) {
        userRewards = new Reward({ user: userId });
      }
      
      // Add points with full data
      await userRewards.addPoints({
        amount: Number(amount),
        reason,
        source,
        sourceId,
        sourceModel,
        skills,
        timestamp: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        addedBy: req.user.id
      });
      
      // Send notification to user
      await Notification.create({
        title: `Points ${amount > 0 ? 'Added' : 'Deducted'}`,
        message: `${Math.abs(amount)} points have been ${amount > 0 ? 'added to' : 'deducted from'} your account. Reason: ${reason}`,
        type: 'achievement',
        priority: 'normal',
        recipients: [userId],
        createdBy: req.user.id
      });
      
      res.json({
        success: true,
        points: userRewards.points.total,
        message: `${Math.abs(amount)} points ${amount > 0 ? 'added to' : 'deducted from'} user's account`
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   POST /api/rewards/badges/:userId
 * @desc    Award a badge to a user
 * @access  Private (Admin only)
 */
router.post('/badges/:userId', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      level,
      imageUrl,
      requirements
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !level) {
      return res.status(400).json({ 
        msg: 'Name, description, category, and level are required' 
      });
    }
    
    // Find user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find or create user's rewards record
    let userRewards = await Reward.findOne({ user: req.params.userId });
    if (!userRewards) {
      userRewards = new Reward({ user: req.params.userId });
      await userRewards.save();
    }
    
    // Check if user already has this badge
    const existingBadge = userRewards.badges.find(badge => badge.name === name);
    if (existingBadge) {
      return res.status(400).json({ msg: 'User already has this badge' });
    }
    
    // Award badge
    const badgeAdded = await userRewards.addBadge({
      name,
      description,
      category,
      level,
      imageUrl,
      unlockedAt: new Date(),
      requirements
    });
    
    if (!badgeAdded) {
      return res.status(400).json({ msg: 'Failed to award badge' });
    }
    
    // Send notification to user
    await Notification.create({
      title: 'New Badge Earned',
      message: `You have earned the ${level} badge: ${name}. ${description}`,
      type: 'achievement',
      priority: 'high',
      recipients: [req.params.userId],
      createdBy: req.user.id
    });
    
    res.json({
      success: true,
      message: `Badge "${name}" awarded to user`,
      badge: userRewards.badges.find(badge => badge.name === name)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/rewards/achievements/:userId
 * @desc    Add an achievement for a user
 * @access  Private (Admin only)
 */
router.post('/achievements/:userId', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      target,
      pointsAwarded
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !target) {
      return res.status(400).json({ 
        msg: 'Title, description, category, and target are required' 
      });
    }
    
    // Find user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find or create user's rewards record
    let userRewards = await Reward.findOne({ user: req.params.userId });
    if (!userRewards) {
      userRewards = new Reward({ user: req.params.userId });
      await userRewards.save();
    }
    
    // Check if achievement already exists
    const existingAchievement = userRewards.achievements.find(a => a.title === title);
    if (existingAchievement) {
      return res.status(400).json({ msg: 'Achievement already exists for this user' });
    }
    
    // Add achievement
    userRewards.achievements.push({
      title,
      description,
      category,
      progress: {
        current: 0,
        target: Number(target),
        percentage: 0
      },
      isCompleted: false,
      pointsAwarded: Number(pointsAwarded) || 0
    });
    
    await userRewards.save();
    
    res.json({
      success: true,
      message: `Achievement "${title}" added for user`,
      achievement: userRewards.achievements.find(a => a.title === title)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/rewards/achievements/:userId/:achievementTitle
 * @desc    Update achievement progress for a user
 * @access  Private (Admin, Committee with permission)
 */
router.put('/achievements/:userId/:achievementTitle', 
  auth, 
  (req, res, next) => {
    // Allow admin or committee with rewards permission
    if (req.user.role === 'admin') return next();
    return committeePermissionCheck('manage_rewards')(req, res, next);
  }, 
  async (req, res) => {
    try {
      const { progress } = req.body;
      const { userId, achievementTitle } = req.params;
      
      // Validate progress increment
      if (progress === undefined || isNaN(progress)) {
        return res.status(400).json({ msg: 'Valid progress increment is required' });
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Find user's rewards
      const userRewards = await Reward.findOne({ user: userId });
      if (!userRewards) {
        return res.status(404).json({ msg: 'User rewards not found' });
      }
      
      // Find achievement
      const achievement = userRewards.achievements.find(
        a => a.title === achievementTitle
      );
      
      if (!achievement) {
        return res.status(404).json({ msg: 'Achievement not found' });
      }
      
      // Update achievement progress
      const updated = await userRewards.updateAchievement(
        achievementTitle, 
        Number(progress)
      );
      
      if (!updated) {
        return res.status(400).json({ 
          msg: 'Failed to update achievement or achievement already completed' 
        });
      }
      
      // Get updated achievement
      const updatedAchievement = userRewards.achievements.find(
        a => a.title === achievementTitle
      );
      
      // If achievement was just completed, send notification
      if (updatedAchievement.isCompleted && 
          updatedAchievement.completedAt > new Date(Date.now() - 5000)) {
        await Notification.create({
          title: 'Achievement Completed',
          message: `You have completed the achievement: ${achievementTitle}. ${updatedAchievement.description}`,
          type: 'achievement',
          priority: 'high',
          recipients: [userId],
          createdBy: req.user.id
        });
      }
      
      res.json({
        success: true,
        achievement: updatedAchievement
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   GET /api/rewards/points/history/:userId
 * @desc    Get points history for a user
 * @access  Private (User can see own history, Admin can see all)
 */
router.get('/points/history/:userId', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view this user\'s point history' });
    }
    
    // Find user's rewards
    const userRewards = await Reward.findOne({ user: req.params.userId });
    if (!userRewards) {
      return res.status(404).json({ msg: 'No rewards record found for this user' });
    }
    
    // Get points history with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Extract and sort history
    const history = [...userRewards.points.history].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Apply pagination
    const paginatedHistory = history.slice((page - 1) * limit, page * limit);
    
    // Populate references where available
    const populatedHistory = await Promise.all(paginatedHistory.map(async (entry) => {
      const result = { ...entry.toObject() };
      
      // Populate source references where possible
      if (entry.sourceId && entry.sourceModel) {
        try {
          const Model = require(`../models/${entry.sourceModel}`);
          const sourceData = await Model.findById(entry.sourceId)
            .select('name title date');
          
          result.sourceData = sourceData;
        } catch (err) {
          console.log(`Could not populate source data for ${entry.sourceModel}`);
        }
      }
      
      // Populate added by user
      if (entry.addedBy) {
        const addedByUser = await User.findById(entry.addedBy)
          .select('name role');
        result.addedByUser = addedByUser;
      }
      
      return result;
    }));
    
    res.json({
      history: populatedHistory,
      pagination: {
        total: history.length,
        page,
        limit,
        pages: Math.ceil(history.length / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/rewards/user-stats
 * @desc    Get aggregated reward statistics for users
 * @access  Private (Admin only)
 */
router.get('/user-stats', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Get general stats
    const totalUsers = await User.estimatedDocumentCount();
    const usersWithRewards = await Reward.countDocuments();
    
    // Get top level users
    const topLevelUsers = await Reward.aggregate([
      { $sort: { 'levelInfo.currentLevel': -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          userId: '$user',
          userName: '$userDetails.name',
          level: '$levelInfo.currentLevel',
          points: '$points.total'
        }
      }
    ]);
    
    // Get point distribution
    const pointDistribution = await Reward.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points.total' },
          avgPoints: { $avg: '$points.total' },
          maxPoints: { $max: '$points.total' },
          minPoints: { $min: '$points.total' }
        }
      }
    ]);
    
    // Get badge stats
    const badgeStats = await Reward.aggregate([
      { $unwind: '$badges' },
      {
        $group: {
          _id: '$badges.level',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get achievement stats
    const achievementStats = await Reward.aggregate([
      { $unwind: '$achievements' },
      {
        $group: {
          _id: '$achievements.category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$achievements.isCompleted', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      userCoverage: {
        totalUsers,
        usersWithRewards,
        percentage: Math.round((usersWithRewards / totalUsers) * 100)
      },
      topLevelUsers,
      pointDistribution: pointDistribution[0] || {
        totalPoints: 0,
        avgPoints: 0,
        maxPoints: 0,
        minPoints: 0
      },
      badgeStats,
      achievementStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/rewards/maintenance/update-expired
 * @desc    Update expired points
 * @access  Private (Admin only)
 */
router.post('/maintenance/update-expired', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const updatesPerformed = await Reward.updateExpiredPoints();
    
    res.json({
      success: true,
      updatesPerformed,
      message: `Updated expired points for ${updatesPerformed} users`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 