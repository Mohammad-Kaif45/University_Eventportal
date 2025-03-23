const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Venue = require('../models/Venue');
const Event = require('../models/Event');

// @route   GET api/venues
// @desc    Get all venues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, capacity, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const venues = await Venue.find(filter).sort({ name: 1 });
    res.json(venues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    
    res.json(venue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/venues
// @desc    Create a venue
// @access  Private (Admin, Committee)
router.post(
  '/',
  [
    auth,
    roleCheck(['admin', 'committee_member']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('capacity', 'Capacity must be a positive number').isInt({ min: 1 }),
      check('type', 'Type is required').isIn([
        'indoor', 'outdoor', 'classroom', 'lab', 'auditorium', 'stadium', 'court', 'other'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Check if venue with same name already exists
      const existingVenue = await Venue.findOne({ name: req.body.name });
      if (existingVenue) {
        return res.status(400).json({ msg: 'Venue with this name already exists' });
      }
      
      const newVenue = new Venue({
        ...req.body,
        createdBy: req.user.id
      });
      
      const venue = await newVenue.save();
      res.json(venue);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/venues/:id
// @desc    Update a venue
// @access  Private (Admin, Committee)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['admin', 'committee_member']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('capacity', 'Capacity must be a positive number').isInt({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      let venue = await Venue.findById(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ msg: 'Venue not found' });
      }
      
      // If name is being changed, check if new name is already taken
      if (req.body.name !== venue.name) {
        const existingVenue = await Venue.findOne({ name: req.body.name });
        if (existingVenue) {
          return res.status(400).json({ msg: 'Venue with this name already exists' });
        }
      }
      
      // Update the venue
      venue = await Venue.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.id
        },
        { new: true }
      );
      
      res.json(venue);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Venue not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/venues/:id
// @desc    Delete a venue
// @access  Private (Admin only)
router.delete('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    // Check if venue is being used in any active events
    const events = await Event.find({ 
      'venue.id': req.params.id,
      status: { $nin: ['completed', 'cancelled'] }
    });
    
    if (events.length > 0) {
      return res.status(400).json({ 
        msg: 'Cannot delete venue as it is being used in active events',
        events: events.map(e => ({ id: e._id, title: e.title }))
      });
    }
    
    // Delete the venue
    const venue = await Venue.findByIdAndRemove(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    
    res.json({ msg: 'Venue removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/venues/:id/availability
// @desc    Check venue availability for a date range
// @access  Private
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { startDate, endDate, startTime, endTime, eventId } = req.query;
    
    if (!startDate || !endDate || !startTime || !endTime) {
      return res.status(400).json({ msg: 'All date and time parameters are required' });
    }
    
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    
    const conflicts = await Venue.checkAvailability(
      req.params.id,
      new Date(startDate),
      new Date(endDate),
      startTime,
      endTime,
      eventId
    );
    
    if (conflicts.length > 0) {
      return res.json({
        available: false,
        conflicts: conflicts.map(e => ({
          id: e._id,
          title: e.title,
          startDate: e.startDate,
          endDate: e.endDate,
          startTime: e.startTime,
          endTime: e.endTime
        }))
      });
    } else {
      return res.json({ available: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 