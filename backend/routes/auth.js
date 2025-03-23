const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { check, validationResult } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role').optional().isIn(['student', 'faculty', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role = 'student', studentId = '', department = '' } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      studentId,
      department,
      registrationDate: new Date(),
      isActive: true
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Send welcome notification
        Notification.create({
          title: 'Welcome to the University Event Portal',
          message: `Hello ${user.name}! Welcome to the University Event Portal. Start exploring events and build your campus experience.`,
          type: 'system',
          priority: 'medium',
          recipients: [{ user: user.id }],
          createdBy: user.id,
          sendToAll: false
        }).catch(err => console.error('Welcome notification error:', err));
        
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ msg: 'Your account has been deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        
        await user.save();
        return res.status(403).json({ 
          msg: 'Account locked due to multiple failed login attempts. Try again later.' 
        });
      }
      
      await user.save();
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(403).json({ 
          msg: 'Account is locked. Try again later.' 
        });
      } else {
        // Unlock account if lock duration has passed
        user.isLocked = false;
        user.lockUntil = null;
      }
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Get user from database with additional data
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('committeeId', 'name description')
      .populate('events', 'name date status')
      .populate('committees', 'name');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client side token removal)
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last activity timestamp
    await User.findByIdAndUpdate(req.user.id, { 
      lastActive: new Date() 
    });
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', [
  auth,
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save user
    await user.save();
    
    // Send notification
    Notification.create({
      title: 'Password Changed',
      message: 'Your password has been changed successfully.',
      type: 'security',
      priority: 'high',
      recipients: [{ user: user.id }],
      createdBy: user.id,
      sendToAll: false
    }).catch(err => console.error('Password change notification error:', err));
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/reset-password-request
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password-request', [
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set reset token and expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // In a real application, you would send an email with the reset token/link
    // For this example, we'll just return success message
    
    res.json({ 
      msg: 'Password reset email sent',
      // In development, we can return the token for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', [
  check('token', 'Reset token is required').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
    }
    
    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    // Send notification
    Notification.create({
      title: 'Password Reset',
      message: 'Your password has been reset successfully.',
      type: 'security',
      priority: 'high',
      recipients: [{ user: user.id }],
      createdBy: user.id,
      sendToAll: false
    }).catch(err => console.error('Password reset notification error:', err));
    
    res.json({ msg: 'Password has been reset' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 