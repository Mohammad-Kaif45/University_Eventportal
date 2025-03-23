const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST api/events
// @desc    Create an event
// @access  Private (Committee members and admins only)
router.post('/', 
  auth,
  checkRole(['committee_member', 'admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['Chess', 'Basketball', 'Swimming', 'Athletics', 'Cricket', 
                          'Badminton', 'Table Tennis', 'Hackathons', 'Other'])
      .withMessage('Invalid category'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('time').notEmpty().withMessage('Time is required'),
    body('venue.name').notEmpty().withMessage('Venue name is required'),
    body('venue.capacity').isInt({ min: 1 }).withMessage('Venue capacity must be at least 1'),
    body('participantLimit').isInt({ min: 1 }).withMessage('Participant limit must be at least 1'),
    body('registrationFee').isFloat({ min: 0 }).withMessage('Registration fee cannot be negative'),
    body('rules').isArray().withMessage('Rules must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = new Event({
        ...req.body,
        organizer: req.user.userId
      });

      await event.save();
      res.status(201).json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, date } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('participants.user', 'name email studentId')
      .populate('waitlist.user', 'name email studentId');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Committee members and admins only)
router.put('/:id', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Update event
      Object.assign(event, req.body);
      await event.save();

      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Committee members and admins only)
router.delete('/:id', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await event.remove();
      res.json({ message: 'Event removed' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.participants.length >= event.participantLimit) {
      // Add to waitlist
      event.waitlist.push({ user: req.user.userId });
      await event.save();
      return res.json({ message: 'Added to waitlist' });
    }

    // Check if already registered
    if (event.participants.some(p => p.user.toString() === req.user.userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    // Add to participants
    event.participants.push({ user: req.user.userId });
    await event.save();

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events/:id/attendance
// @desc    Mark attendance for an event
// @access  Private (Committee members and admins only)
router.post('/:id/attendance', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const { userId, attended } = req.body;
      const participant = event.participants.find(p => p.user.toString() === userId);

      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }

      participant.attendance = attended;
      if (attended) {
        participant.attendanceDate = new Date();
      }

      await event.save();
      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/events/:id/results
// @desc    Add results for an event
// @access  Private (Committee members and admins only)
router.post('/:id/results', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const { results } = req.body;
      
      // Update participant results
      results.forEach(result => {
        const participant = event.participants.find(p => p.user.toString() === result.userId);
        if (participant) {
          participant.result = {
            rank: result.rank,
            points: result.points,
            certificate: result.certificate
          };
        }
      });

      // Update event status
      event.status = 'completed';
      await event.save();

      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router; 