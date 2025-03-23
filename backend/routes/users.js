const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const User = require('../models/User');
const Reward = require('../models/Reward');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination and filtering)
 * @access  Private (Admin only)
 */
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;
    
    // Build query based on filters
    const query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count
    const total = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or same user)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // Check permissions
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view this user' });
    }
    
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('committeeId', 'name description')
      .populate('committees', 'name');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get reward info
    const rewards = await Reward.findOne({ user: req.params.id });
    
    // Get event participation
    const events = await Event.find({
      'participants.user': req.params.id
    }).select('name description date status category');
    
    // Get certificates
    const certificates = await Certificate.find({
      user: req.params.id
    }).select('title event type issueDate fileUrl');
    
    res.json({
      user,
      stats: {
        events: events.length,
        certificates: certificates.length,
        rewards: rewards ? {
          points: rewards.points.total,
          level: rewards.levelInfo.currentLevel,
          badges: rewards.badges.length
        } : null
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or same user)
 */
router.put('/:id', [
  auth,
  [
    check('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
    check('email').optional().isEmail().withMessage('Please include a valid email'),
    check('department').optional().not().isEmpty(),
    check('interests').optional().isArray(),
    check('bio').optional().isString(),
    check('phoneNumber').optional().isString(),
    check('year').optional().isNumeric(),
    check('role').optional().isIn(['student', 'faculty', 'committee', 'admin'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isSameUser = req.user.id === req.params.id;
    
    if (!isAdmin && !isSameUser) {
      return res.status(403).json({ msg: 'Not authorized to update this user' });
    }
    
    const {
      name,
      email,
      department,
      interests,
      bio,
      phoneNumber,
      profilePicture,
      year,
      role,
      isActive
    } = req.body;
    
    // Get user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update fields that are provided
    if (name) user.name = name;
    if (email && isAdmin) user.email = email; // Only admin can change email
    if (department) user.department = department;
    if (interests) user.interests = interests;
    if (bio !== undefined) user.bio = bio;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profilePicture) user.profilePicture = profilePicture;
    if (year) user.year = year;
    
    // These fields can only be updated by admin
    if (isAdmin) {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }
    
    await user.save();
    
    res.json({
      msg: 'User updated successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private (Admin only)
 */
router.post('/', [
  auth,
  roleCheck(['admin']),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role').isIn(['student', 'faculty', 'committee', 'admin']),
    check('department').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    name,
    email,
    password,
    role,
    department,
    studentId,
    interests,
    year
  } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Create user
    user = new User({
      name,
      email,
      password,
      role: role || 'student',
      department,
      studentId,
      interests: interests || [],
      year,
      isActive: true,
      registrationDate: new Date()
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
    // Send welcome notification
    Notification.create({
      title: 'Welcome to the University Event Portal',
      message: `Hello ${user.name}! Your account has been created by an administrator. Welcome to the University Event Portal.`,
      type: 'system',
      priority: 'normal',
      recipients: [user.id],
      allUsers: false
    }).catch(err => console.error('Welcome notification error:', err));
    
    res.status(201).json({
      msg: 'User created successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Don't allow admins to delete themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check dependencies before deletion
    const events = await Event.find({
      $or: [
        { 'participants.user': req.params.id },
        { organizers: req.params.id }
      ]
    });
    
    if (events.length > 0) {
      // Soft delete instead of hard delete if user has dependencies
      user.isActive = false;
      await user.save();
      
      return res.json({
        msg: 'User has been deactivated instead of deleted due to existing event associations',
        deactivated: true
      });
    }
    
    // Delete user and associated data
    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Reward.findOneAndDelete({ user: req.params.id }),
      Certificate.deleteMany({ user: req.params.id }),
      Notification.deleteMany({ recipients: req.params.id })
    ]);
    
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put('/:id/role', [
  auth,
  roleCheck(['admin']),
  check('role').isIn(['student', 'faculty', 'committee', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update role
    user.role = role;
    
    // If changing to committee, add optional committee permissions
    if (role === 'committee' && req.body.committeePermissions) {
      user.committeePermissions = req.body.committeePermissions;
    }
    
    // If changing from committee role, clear committee permissions
    if (user.role !== 'committee' && user.committeePermissions) {
      user.committeePermissions = [];
    }
    
    await user.save();
    
    // Send notification
    Notification.create({
      title: 'Role Updated',
      message: `Your account role has been updated to "${role}".`,
      type: 'system',
      priority: 'high',
      recipients: [user.id],
      allUsers: false
    }).catch(err => console.error('Role update notification error:', err));
    
    res.json({
      msg: 'User role updated successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id/status
 * @desc    Activate or deactivate user
 * @access  Private (Admin only)
 */
router.put('/:id/status', [
  auth,
  roleCheck(['admin']),
  check('isActive').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { isActive } = req.body;
    
    // Don't allow admins to deactivate themselves
    if (req.user.id === req.params.id && !isActive) {
      return res.status(400).json({ msg: 'Cannot deactivate your own account' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update status
    user.isActive = isActive;
    
    await user.save();
    
    // Send notification
    Notification.create({
      title: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
      message: `Your account has been ${isActive ? 'activated' : 'deactivated'}.`,
      type: 'system',
      priority: 'high',
      recipients: [user.id],
      allUsers: false
    }).catch(err => console.error('Status update notification error:', err));
    
    res.json({
      msg: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/users/stats/summary
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats/summary', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Get counts by role
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Format role counts
    const roleStats = {};
    roleCounts.forEach(role => {
      roleStats[role._id] = role.count;
    });
    
    // Get counts by department
    const departmentCounts = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get active vs inactive stats
    const activeStats = await User.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);
    
    // Format active stats
    const activeCount = activeStats.find(stat => stat._id === true)?.count || 0;
    const inactiveCount = activeStats.find(stat => stat._id === false)?.count || 0;
    
    // Get new user stats by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const newUserStats = await User.aggregate([
      { 
        $match: { 
          registrationDate: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$registrationDate' }, 
            year: { $year: '$registrationDate' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      total: await User.countDocuments(),
      roleStats,
      departmentStats: departmentCounts,
      activeStats: {
        active: activeCount,
        inactive: inactiveCount,
        percentage: Math.round((activeCount / (activeCount + inactiveCount)) * 100)
      },
      newUserStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id/committee-permissions
 * @desc    Update committee permissions for a user
 * @access  Private (Admin only)
 */
router.put('/:id/committee-permissions', [
  auth,
  roleCheck(['admin']),
  check('permissions').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { permissions } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is a committee member
    if (user.role !== 'committee') {
      return res.status(400).json({ 
        msg: 'Cannot set committee permissions for non-committee users' 
      });
    }
    
    // Update permissions
    user.committeePermissions = permissions;
    
    await user.save();
    
    // Send notification
    Notification.create({
      title: 'Permissions Updated',
      message: 'Your committee permissions have been updated.',
      type: 'system',
      priority: 'normal',
      recipients: [user.id],
      allUsers: false
    }).catch(err => console.error('Permissions update notification error:', err));
    
    res.json({
      msg: 'Committee permissions updated successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 