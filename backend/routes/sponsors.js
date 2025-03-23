const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST api/sponsors/event/:eventId
// @desc    Add a sponsor to an event
// @access  Private (Committee members and admins only)
router.post('/event/:eventId', 
  auth,
  checkRole(['committee_member', 'admin']),
  [
    body('name').notEmpty().withMessage('Sponsor name is required'),
    body('tier').isIn(['platinum', 'gold', 'silver', 'bronze'])
      .withMessage('Invalid sponsor tier'),
    body('contribution').isFloat({ min: 0 }).withMessage('Contribution must be positive'),
    body('benefits').isArray().withMessage('Benefits must be an array'),
    body('logo').optional().isURL().withMessage('Invalid logo URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const { name, tier, contribution, benefits, logo } = req.body;

      event.sponsors.push({
        name,
        tier,
        contribution,
        benefits,
        logo
      });

      await event.save();
      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/sponsors/event/:eventId/:sponsorId
// @desc    Update a sponsor's details
// @access  Private (Committee members and admins only)
router.put('/event/:eventId/:sponsorId', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const sponsor = event.sponsors.id(req.params.sponsorId);
      if (!sponsor) {
        return res.status(404).json({ message: 'Sponsor not found' });
      }

      Object.assign(sponsor, req.body);
      await event.save();

      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/sponsors/event/:eventId/:sponsorId
// @desc    Remove a sponsor from an event
// @access  Private (Committee members and admins only)
router.delete('/event/:eventId/:sponsorId', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      event.sponsors = event.sponsors.filter(
        sponsor => sponsor._id.toString() !== req.params.sponsorId
      );

      await event.save();
      res.json(event);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/sponsors/event/:eventId
// @desc    Get all sponsors for an event
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .select('sponsors');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.sponsors);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sponsors/analytics
// @desc    Get sponsorship analytics
// @access  Private (Committee members and admins only)
router.get('/analytics', 
  auth,
  checkRole(['committee_member', 'admin']),
  async (req, res) => {
    try {
      const events = await Event.find()
        .select('title date sponsors');

      const analytics = {
        totalSponsors: 0,
        totalContribution: 0,
        tierBreakdown: {
          platinum: 0,
          gold: 0,
          silver: 0,
          bronze: 0
        },
        eventsWithSponsors: 0,
        monthlyContributions: {}
      };

      events.forEach(event => {
        if (event.sponsors.length > 0) {
          analytics.eventsWithSponsors++;
          event.sponsors.forEach(sponsor => {
            analytics.totalSponsors++;
            analytics.totalContribution += sponsor.contribution;
            analytics.tierBreakdown[sponsor.tier]++;

            // Group contributions by month
            const month = event.date.toISOString().slice(0, 7); // YYYY-MM format
            if (!analytics.monthlyContributions[month]) {
              analytics.monthlyContributions[month] = 0;
            }
            analytics.monthlyContributions[month] += sponsor.contribution;
          });
        }
      });

      res.json(analytics);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router; 