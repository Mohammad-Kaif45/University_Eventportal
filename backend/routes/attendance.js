const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET api/attendance/event/:eventId
// @desc    Get attendance for an event
// @access  Private (Admin, Committee, Event Organizer)
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check permissions - allow if admin, committee member with permissions, or event organizer
    const isOrganizer = event.organizer.toString() === req.user.id.toString();
    const isCoOrganizer = event.coOrganizers.some(id => id.toString() === req.user.id.toString());
    
    if (!isOrganizer && !isCoOrganizer && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const hasPermission = user.committeeDetails && 
                           user.committeeDetails.permissions && 
                           user.committeeDetails.permissions.includes('manage_attendance');
      
      if (!hasPermission) {
        return res.status(403).json({ msg: 'Not authorized to view attendance for this event' });
      }
    }
    
    // Get attendance records
    const attendance = await Attendance.find({ event: req.params.eventId })
      .populate('user', 'name email studentId department profilePicture')
      .populate('markedBy', 'name');

    // Get event statistics
    const stats = await Attendance.getEventStatistics(req.params.eventId);
    
    res.json({ attendance, stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/attendance/event/:eventId
// @desc    Mark attendance for an event
// @access  Private (Admin, Committee, Event Organizer)
router.post(
  '/event/:eventId',
  [
    auth,
    [
      check('userId', 'User ID is required').not().isEmpty(),
      check('status', 'Status is required').isIn(['present', 'absent', 'late', 'excused'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, status, notes } = req.body;
      
      // Find the event
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
      }

      // Check if user is registered for the event
      const isRegistered = event.participants.some(p => p.user.toString() === userId);
      if (!isRegistered) {
        return res.status(400).json({ msg: 'User is not registered for this event' });
      }

      // Check permissions
      const isOrganizer = event.organizer.toString() === req.user.id.toString();
      const isCoOrganizer = event.coOrganizers.some(id => id.toString() === req.user.id.toString());
      
      if (!isOrganizer && !isCoOrganizer && req.user.role !== 'admin') {
        const user = await User.findById(req.user.id);
        const hasPermission = user.committeeDetails && 
                             user.committeeDetails.permissions && 
                             user.committeeDetails.permissions.includes('manage_attendance');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to mark attendance for this event' });
        }
      }

      // Create or update attendance record
      let attendance = await Attendance.findOne({ event: req.params.eventId, user: userId });

      if (attendance) {
        // Update existing attendance
        attendance.status = status;
        attendance.notes = notes;
        attendance.markedBy = req.user.id;
        attendance.markedAt = Date.now();
        
        if (status === 'present' && attendance.checkInTime === null) {
          attendance.checkInTime = Date.now();
        }
      } else {
        // Create new attendance record
        attendance = new Attendance({
          event: req.params.eventId,
          user: userId,
          status,
          notes,
          markedBy: req.user.id,
          checkInTime: status === 'present' ? Date.now() : null
        });
      }

      await attendance.save();

      // Update event participant status
      await Event.findOneAndUpdate(
        { 
          _id: req.params.eventId, 
          'participants.user': userId 
        },
        { 
          $set: { 
            'participants.$.attendance': status === 'present',
            'participants.$.attendanceMarkedBy': req.user.id,
            'participants.$.attendanceMarkedAt': Date.now()
          } 
        }
      );

      // Create notification for the user
      const user = await User.findById(userId);
      if (user) {
        const notificationData = {
          title: `Attendance marked for ${event.title}`,
          message: `Your attendance has been marked as "${status}" for the event "${event.title}"`,
          type: 'event',
          event: event._id,
          priority: 'medium'
        };

        // Create a notification specifically for this user
        await Notification.create({
          ...notificationData,
          recipients: [{ user: userId }],
          createdBy: req.user.id,
          sentAt: Date.now()
        });
      }

      res.json(attendance);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/attendance/event/:eventId/bulk
// @desc    Mark bulk attendance for an event
// @access  Private (Admin, Committee, Event Organizer)
router.post(
  '/event/:eventId/bulk',
  [
    auth,
    [
      check('userIds', 'User IDs array is required').isArray(),
      check('status', 'Status is required').isIn(['present', 'absent', 'late', 'excused'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userIds, status } = req.body;
      
      // Validate event and check permissions
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
      }

      // Check permissions
      const isOrganizer = event.organizer.toString() === req.user.id.toString();
      const isCoOrganizer = event.coOrganizers.some(id => id.toString() === req.user.id.toString());
      
      if (!isOrganizer && !isCoOrganizer && req.user.role !== 'admin') {
        const user = await User.findById(req.user.id);
        const hasPermission = user.committeeDetails && 
                             user.committeeDetails.permissions && 
                             user.committeeDetails.permissions.includes('manage_attendance');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to mark attendance for this event' });
        }
      }

      // Mark bulk attendance
      await Attendance.markBulkAttendance(req.params.eventId, userIds, status, req.user.id);

      // Update event participants
      const updateOperations = userIds.map(userId => ({
        updateOne: {
          filter: { 
            _id: req.params.eventId, 
            'participants.user': userId 
          },
          update: { 
            $set: { 
              'participants.$.attendance': status === 'present',
              'participants.$.attendanceMarkedBy': req.user.id,
              'participants.$.attendanceMarkedAt': Date.now()
            } 
          }
        }
      }));

      await Event.bulkWrite(updateOperations);

      // Create notifications for users
      const notificationPromises = userIds.map(userId => {
        return Notification.create({
          title: `Attendance marked for ${event.title}`,
          message: `Your attendance has been marked as "${status}" for the event "${event.title}"`,
          type: 'event',
          event: event._id,
          priority: 'medium',
          recipients: [{ user: userId }],
          createdBy: req.user.id,
          sentAt: Date.now()
        });
      });

      await Promise.all(notificationPromises);

      res.json({ msg: `Attendance marked for ${userIds.length} users`, status });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/attendance/user/:userId
// @desc    Get user's attendance history
// @access  Private (Admin, User themselves)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - user can only see their own attendance or admin can see all
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view this attendance history' });
    }
    
    const attendance = await Attendance.find({ user: userId })
      .populate('event', 'title startDate startTime venue.name category')
      .populate('markedBy', 'name')
      .sort({ 'event.startDate': -1 });
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/attendance/stats
// @desc    Get attendance statistics
// @access  Private (Admin)
router.get('/stats', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    // Overall attendance stats
    const overallStats = await Attendance.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }},
      { $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }}
    ]);
    
    // Attendance by event type/category
    const attendanceByCategory = await Attendance.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      { $group: {
        _id: {
          category: '$eventDetails.category',
          status: '$status'
        },
        count: { $sum: 1 }
      }},
      { $project: {
        category: '$_id.category',
        status: '$_id.status',
        count: 1,
        _id: 0
      }}
    ]);
    
    res.json({
      overallStats,
      attendanceByCategory
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 