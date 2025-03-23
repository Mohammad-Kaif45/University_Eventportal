const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET api/certificates
// @desc    Get all certificates with filters
// @access  Private (Admin only)
router.get('/', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const { type, eventId, userId, verificationCode } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (eventId) filter.event = eventId;
    if (userId) filter.user = userId;
    if (verificationCode) filter.verificationCode = verificationCode;
    
    const certificates = await Certificate.find(filter)
      .populate('event', 'title startDate endDate category')
      .populate('user', 'name email studentId')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });
    
    res.json(certificates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/certificates/event/:eventId
// @desc    Get certificates for a specific event
// @access  Private (Admin, Committee, Event Organizer)
router.get('/event/:eventId', auth, async (req, res) => {
  try {
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
                           user.committeeDetails.permissions.includes('manage_results');
      
      if (!hasPermission) {
        return res.status(403).json({ msg: 'Not authorized to view certificates for this event' });
      }
    }
    
    // Get certificates with optional type filter
    const { type } = req.query;
    const filter = { event: req.params.eventId };
    if (type) filter.type = type;
    
    const certificates = await Certificate.find(filter)
      .populate('user', 'name email studentId department')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });
    
    // Group certificates by type for statistics
    const stats = await Certificate.aggregate([
      { $match: { event: { $eq: event._id } } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }},
      { $project: {
        type: '$_id',
        count: 1,
        _id: 0
      }}
    ]);
    
    res.json({ certificates, stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/certificates/user/:userId
// @desc    Get certificates for a specific user
// @access  Private (Admin, User themselves)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - user can only see their own certificates or admin can see all
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view these certificates' });
    }
    
    const certificates = await Certificate.find({ user: userId })
      .populate('event', 'title startDate endDate venue.name category')
      .sort({ issueDate: -1 });
    
    res.json(certificates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/certificates/verify/:code
// @desc    Verify a certificate by verification code
// @access  Public
router.get('/verify/:code', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ verificationCode: req.params.code })
      .populate('user', 'name department')
      .populate('event', 'title startDate endDate category')
      .populate('issuedBy', 'name');
    
    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found or invalid verification code' });
    }
    
    // Return certificate details for verification
    res.json({
      verified: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        title: certificate.title,
        type: certificate.type,
        position: certificate.position,
        issueDate: certificate.issueDate,
        user: certificate.user,
        event: certificate.event,
        issuedBy: certificate.issuedBy
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/certificates/event/:eventId/generate
// @desc    Generate certificates for an event
// @access  Private (Admin, Committee, Event Organizer)
router.post(
  '/event/:eventId/generate',
  [
    auth,
    [
      check('type', 'Certificate type is required').isIn(['participation', 'winner', 'appreciation', 'volunteer']),
      check('recipients', 'Recipients array is required').isArray(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { type, recipients, title, description } = req.body;
      
      // Check if event exists
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
                             user.committeeDetails.permissions.includes('manage_results');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to generate certificates for this event' });
        }
      }
      
      // Check if event is completed
      if (event.status !== 'completed') {
        return res.status(400).json({ msg: 'Certificates can only be generated for completed events' });
      }
      
      // Process each recipient
      const certificatePromises = recipients.map(async (recipient) => {
        // Check if user already has a certificate of this type for this event
        const existingCertificate = await Certificate.findOne({
          event: event._id,
          user: recipient.userId,
          type
        });
        
        if (existingCertificate) {
          return {
            status: 'duplicate',
            user: recipient.userId,
            certificate: existingCertificate
          };
        }
        
        // Generate certificate number and verification code
        const certificateNumber = await Certificate.generateCertificateNumber(event._id, type);
        const verificationCode = Certificate.generateVerificationCode();
        
        // Create certificate
        const certificateData = {
          event: event._id,
          user: recipient.userId,
          type,
          title: title || `Certificate of ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          certificateNumber,
          position: recipient.position || null,
          description: description || `This is to certify that the student has ${type === 'participation' ? 'participated in' : type === 'winner' ? 'won' : 'contributed to'} the event ${event.title}`,
          issueDate: new Date(),
          fileUrl: `/certificates/${certificateNumber}.pdf`, // Placeholder URL, will be replaced with actual URL
          issuedBy: req.user.id,
          verificationCode,
          verificationUrl: `/verify-certificate/${verificationCode}`,
          metadata: {
            points: recipient.points || 0,
            skills: recipient.skills || [],
            achievements: recipient.achievements || []
          }
        };
        
        const certificate = new Certificate(certificateData);
        await certificate.save();
        
        // Update user's participation history and achievements
        await User.findByIdAndUpdate(
          recipient.userId,
          {
            $set: {
              'participationHistory.$[elem].result.certificate': certificateNumber,
              'participationHistory.$[elem].result.points': recipient.points || 0,
              'participationHistory.$[elem].result.rank': recipient.position || null
            },
            $addToSet: {
              achievements: {
                title: certificateData.title,
                description: certificateData.description,
                date: certificateData.issueDate,
                event: event._id,
                certificate: certificateNumber
              }
            }
          },
          {
            arrayFilters: [{ 'elem.event': event._id }]
          }
        );
        
        // Create notification for the user
        await Notification.create({
          title: `Certificate Issued for ${event.title}`,
          message: `You have been issued a ${type} certificate for the event "${event.title}". You can download it from your profile.`,
          type: 'achievement',
          event: event._id,
          priority: 'medium',
          recipients: [{ user: recipient.userId }],
          createdBy: req.user.id,
          sentAt: Date.now()
        });
        
        return {
          status: 'created',
          user: recipient.userId,
          certificate
        };
      });
      
      const results = await Promise.all(certificatePromises);
      
      res.json({
        message: `Certificates generated for ${results.filter(r => r.status === 'created').length} recipients. ${results.filter(r => r.status === 'duplicate').length} duplicates skipped.`,
        results
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/certificates/event/:eventId/bulk-participate
// @desc    Generate participation certificates for all event participants
// @access  Private (Admin, Committee, Event Organizer)
router.post(
  '/event/:eventId/bulk-participate',
  [auth],
  async (req, res) => {
    try {
      // Check if event exists
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
                             user.committeeDetails.permissions.includes('manage_results');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to generate certificates for this event' });
        }
      }
      
      // Check if event is completed
      if (event.status !== 'completed') {
        return res.status(400).json({ msg: 'Certificates can only be generated for completed events' });
      }
      
      // Get all participants who attended the event
      const attendedParticipants = event.participants
        .filter(p => p.attendance === true)
        .map(p => p.user.toString());
      
      if (attendedParticipants.length === 0) {
        return res.status(400).json({ msg: 'No attended participants found for this event' });
      }
      
      // Generate certificates for all participants
      const certificates = await Certificate.bulkGenerateParticipationCertificates(
        event._id,
        attendedParticipants,
        req.user.id
      );
      
      // Update users' participation history
      const userUpdatePromises = attendedParticipants.map(userId => {
        return User.findByIdAndUpdate(
          userId,
          {
            $set: {
              'participationHistory.$[elem].result.certificate': 'Generated',
              'participationHistory.$[elem].result.points': 5 // Default participation points
            },
            $addToSet: {
              achievements: {
                title: 'Certificate of Participation',
                description: `Participated in ${event.title}`,
                date: new Date(),
                event: event._id,
                certificate: 'Generated'
              }
            }
          },
          {
            arrayFilters: [{ 'elem.event': event._id }]
          }
        );
      });
      
      await Promise.all(userUpdatePromises);
      
      // Send notifications to all participants
      const notificationPromises = attendedParticipants.map(userId => {
        return Notification.create({
          title: `Certificate Issued for ${event.title}`,
          message: `You have been issued a participation certificate for the event "${event.title}". You can download it from your profile.`,
          type: 'achievement',
          event: event._id,
          priority: 'medium',
          recipients: [{ user: userId }],
          createdBy: req.user.id,
          sentAt: Date.now()
        });
      });
      
      await Promise.all(notificationPromises);
      
      res.json({
        message: `Generated ${certificates.length} participation certificates`,
        certificates
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/certificates/download/:id
// @desc    Download a certificate
// @access  Private (Admin, User who owns the certificate)
router.get('/download/:id', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found' });
    }
    
    // Check permissions - user can only download their own certificates or admin can download all
    if (certificate.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to download this certificate' });
    }
    
    // Increment download count
    await certificate.incrementDownloadCount(req.ip);
    
    // In a real implementation, this would generate or retrieve the certificate file
    // For now, just return the certificate info
    res.json({
      message: 'Certificate download initiated',
      certificate
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 