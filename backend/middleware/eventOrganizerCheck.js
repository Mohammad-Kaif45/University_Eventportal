const Event = require('../models/Event');

/**
 * Middleware to check if user is an organizer of the requested event
 * @returns {Function} - Express middleware function
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    // Admin always has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Get event ID from params or body
    const eventId = req.params.eventId || req.params.id || req.body.eventId;
    
    if (!eventId) {
      return res.status(400).json({ msg: 'Event ID is required' });
    }

    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user is an organizer of the event
    const isOrganizer = event.organizers.some(organizer => 
      organizer.toString() === req.user.id.toString()
    );

    // Check if the user belongs to the committee organizing the event
    const isCommitteeMember = req.user.committeeId && 
      event.committee && 
      event.committee.toString() === req.user.committeeId.toString();

    if (!isOrganizer && !isCommitteeMember) {
      return res.status(403).json({ 
        msg: 'Forbidden - You are not an organizer of this event',
        event: event.name,
        eventId: event._id
      });
    }

    // Add event to request for later use
    req.event = event;
    next();
  } catch (err) {
    console.error('Event organizer check error:', err);
    return res.status(500).json({ msg: 'Server error in organizer check' });
  }
}; 