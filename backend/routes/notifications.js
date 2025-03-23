const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth, checkRole } = require('../middleware/auth');
const Notification = require('../models/Notification');
const roleCheck = require('../middleware/roleCheck');
const committeePermissionCheck = require('../middleware/commiteePermissionCheck');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const readStatus = req.query.read === 'true' ? true : 
                      req.query.read === 'false' ? false : null;
    
    // Build query
    const query = { 
      $or: [
        { recipients: req.user.id },
        { targetRoles: req.user.role },
        { allUsers: true }
      ]
    };
    
    // Filter by read status if provided
    if (readStatus !== null) {
      query.readBy = readStatus 
        ? { $in: [req.user.id] } 
        : { $nin: [req.user.id] };
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate('event', 'name date')
      .lean();
    
    // Add isRead field to each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      return {
        ...notification,
        isRead: notification.readBy.some(id => id.toString() === req.user.id.toString())
      };
    });

    res.json({
      notifications: notificationsWithReadStatus,
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
 * @route   GET /api/notifications/unread/count
 * @desc    Get count of unread notifications for current user
 * @access  Private
 */
router.get('/unread/count', auth, async (req, res) => {
  try {
    const query = { 
      $or: [
        { recipients: req.user.id },
        { targetRoles: req.user.role },
        { allUsers: true }
      ],
      readBy: { $nin: [req.user.id] }
    };
    
    const count = await Notification.countDocuments(query);
    
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private (Admin, Committee with permission)
 */
router.post('/', 
  auth, 
  (req, res, next) => {
    // Allow admin or committee with notifications permission
    if (req.user.role === 'admin') return next();
    return committeePermissionCheck('manage_notifications')(req, res, next);
  }, 
  async (req, res) => {
    try {
      const {
        title,
        message,
        type,
        priority,
        event,
        recipients,
        targetRoles,
        targetInterests,
        targetDepartments,
        allUsers,
        expiresAt
      } = req.body;

      // Validate required fields
      if (!title || !message || !type) {
        return res.status(400).json({ msg: 'Title, message and type are required' });
      }

      // Check if at least one target is specified
      if (!recipients?.length && !targetRoles?.length && 
          !targetInterests?.length && !targetDepartments?.length && !allUsers) {
        return res.status(400).json({ 
          msg: 'At least one recipient or target group must be specified' 
        });
      }

      // Create notification
      const newNotification = new Notification({
        title,
        message,
        type,
        priority: priority || 'normal',
        createdBy: req.user.id,
        event,
        recipients,
        targetRoles,
        targetInterests,
        targetDepartments,
        allUsers: allUsers || false,
        expiresAt
      });

      await newNotification.save();

      res.status(201).json(newNotification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   POST /api/notifications/send-to-all
 * @desc    Send notification to all users
 * @access  Private (Admin only)
 */
router.post('/send-to-all', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ msg: 'Title, message and type are required' });
    }

    const notification = await Notification.sendToAllUsers({
      title,
      message,
      type,
      priority: priority || 'normal',
      createdBy: req.user.id
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Check if user is a recipient
    const isTargeted = 
      notification.recipients.some(id => id.toString() === req.user.id.toString()) ||
      notification.targetRoles.includes(req.user.role) || 
      notification.allUsers;
    
    if (!isTargeted) {
      return res.status(403).json({ msg: 'This notification is not addressed to you' });
    }

    // Mark as read if not already
    if (!notification.readBy.includes(req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read for current user
 * @access  Private
 */
router.put('/read-all', auth, async (req, res) => {
  try {
    const query = { 
      $or: [
        { recipients: req.user.id },
        { targetRoles: req.user.role },
        { allUsers: true }
      ],
      readBy: { $nin: [req.user.id] }
    };
    
    const result = await Notification.updateMany(
      query,
      { $addToSet: { readBy: req.user.id } }
    );
    
    res.json({ 
      success: true,
      count: result.modifiedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    await notification.remove();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/notifications/admin
 * @desc    Get all notifications (admin view)
 * @access  Private (Admin only)
 */
router.get('/admin', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;
    
    // Filter options
    const query = {};
    
    if (req.query.type) query.type = req.query.type;
    if (req.query.priority) query.priority = req.query.priority;
    
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate('createdBy', 'name email')
      .populate('event', 'name date')
      .lean();
    
    // Get read statistics for each notification
    const notificationsWithStats = await Promise.all(notifications.map(async (notification) => {
      // Calculate potential recipients
      let potentialRecipients = 0;
      
      if (notification.allUsers) {
        potentialRecipients = await User.countDocuments({});
      } else {
        // Count specific recipients
        const specificCount = notification.recipients.length;
        
        // Count role-based recipients
        let roleCount = 0;
        if (notification.targetRoles && notification.targetRoles.length > 0) {
          roleCount = await User.countDocuments({ 
            role: { $in: notification.targetRoles } 
          });
        }
        
        // Count interest-based recipients
        let interestCount = 0;
        if (notification.targetInterests && notification.targetInterests.length > 0) {
          interestCount = await User.countDocuments({ 
            interests: { $in: notification.targetInterests } 
          });
        }
        
        // Count department-based recipients
        let departmentCount = 0;
        if (notification.targetDepartments && notification.targetDepartments.length > 0) {
          departmentCount = await User.countDocuments({ 
            department: { $in: notification.targetDepartments } 
          });
        }
        
        potentialRecipients = specificCount + roleCount + interestCount + departmentCount;
      }
      
      return {
        ...notification,
        stats: {
          readCount: notification.readBy.length,
          potentialRecipients,
          readPercentage: potentialRecipients > 0 
            ? Math.round((notification.readBy.length / potentialRecipients) * 100) 
            : 0
        }
      };
    }));
    
    res.json({
      notifications: notificationsWithStats,
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

module.exports = router; 