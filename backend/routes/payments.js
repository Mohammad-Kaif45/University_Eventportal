const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET api/payments
// @desc    Get all payments (with filters)
// @access  Private (Admin, Committee with permissions)
router.get('/', auth, async (req, res) => {
  try {
    // Check permissions for non-admin users
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const hasPermission = user.committeeDetails && 
                           user.committeeDetails.permissions && 
                           user.committeeDetails.permissions.includes('approve_payments');
      
      if (!hasPermission) {
        return res.status(403).json({ msg: 'Not authorized to view payments' });
      }
    }
    
    const { status, method, eventId, userId, startDate, endDate } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (eventId) filter.event = eventId;
    if (userId) filter.user = userId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(filter)
      .populate('event', 'title startDate')
      .populate('user', 'name email studentId')
      .populate('collectedBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/payments/event/:eventId
// @desc    Get payments for a specific event
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
                          user.committeeDetails.permissions.includes('approve_payments');
      
      if (!hasPermission) {
        return res.status(403).json({ msg: 'Not authorized to view payments for this event' });
      }
    }
    
    // Get payments with optional status filter
    const { status } = req.query;
    const filter = { event: req.params.eventId };
    if (status) filter.status = status;
    
    const payments = await Payment.find(filter)
      .populate('user', 'name email studentId department profilePicture')
      .populate('collectedBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    // Get payment statistics
    const stats = await Payment.getEventPaymentStats(req.params.eventId);
    
    res.json({ payments, stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/payments/user/:userId
// @desc    Get payments for a specific user
// @access  Private (Admin, User themselves)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - user can only see their own payments or admin can see all
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view these payments' });
    }
    
    const payments = await Payment.find({ user: userId })
      .populate('event', 'title startDate startTime venue.name registrationFee')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/payments/event/:eventId/user/:userId
// @desc    Create a payment record for an event
// @access  Private (Admin, Committee, User making their own payment)
router.post(
  '/event/:eventId/user/:userId',
  [
    auth,
    [
      check('amount', 'Amount is required').isNumeric(),
      check('method', 'Payment method is required').isIn([
        'cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'online_payment', 'waived'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { eventId, userId } = req.params;
      const { amount, method, transactionId, notes } = req.body;
      
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
      }
      
      // Check if user is registered for the event
      const isRegistered = event.participants.some(p => p.user.toString() === userId);
      if (!isRegistered) {
        return res.status(400).json({ msg: 'User is not registered for this event' });
      }
      
      // Check for existing payment
      const existingPayment = await Payment.findOne({ event: eventId, user: userId });
      if (existingPayment) {
        return res.status(400).json({ 
          msg: 'Payment record already exists for this user and event',
          payment: existingPayment 
        });
      }
      
      // Create a new payment record
      const newPayment = new Payment({
        event: eventId,
        user: userId,
        amount,
        method,
        transactionId,
        notes,
        status: method === 'waived' ? 'waived' : 'pending',
        collectedBy: req.user.id
      });
      
      if (method === 'waived') {
        newPayment.waivedBy = req.user.id;
        newPayment.waivedAt = Date.now();
        newPayment.waivedReason = notes || 'Fee waived by organizer';
        
        // Only committee members or admins can waive fees
        if (req.user.role !== 'admin') {
          const user = await User.findById(req.user.id);
          const hasPermission = user.committeeDetails && 
                              user.committeeDetails.permissions && 
                              user.committeeDetails.permissions.includes('approve_payments');
          
          if (!hasPermission) {
            return res.status(403).json({ msg: 'Not authorized to waive payment fees' });
          }
        }
      }
      
      const payment = await newPayment.save();
      
      // Update event participant payment status
      await Event.findOneAndUpdate(
        { 
          _id: eventId, 
          'participants.user': userId 
        },
        { 
          $set: { 
            'participants.$.paymentStatus': method === 'waived' ? 'waived' : 'pending',
            'participants.$.paymentMethod': method,
            'participants.$.paymentId': payment._id,
            'participants.$.paymentAmount': amount
          } 
        }
      );
      
      // Create notification for the user
      const notificationData = {
        title: `Payment ${method === 'waived' ? 'Waived' : 'Recorded'} for ${event.title}`,
        message: method === 'waived' 
          ? `Your payment has been waived for the event "${event.title}"`
          : `Your payment of ${amount} has been recorded for the event "${event.title}" and is pending verification`,
        type: 'payment',
        event: event._id,
        priority: 'medium'
      };
      
      await Notification.create({
        ...notificationData,
        recipients: [{ user: userId }],
        createdBy: req.user.id,
        sentAt: Date.now()
      });
      
      res.json(payment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/payments/:paymentId/verify
// @desc    Verify a payment (mark as completed)
// @access  Private (Admin, Committee with permissions)
router.put(
  '/:paymentId/verify',
  [auth],
  async (req, res) => {
    try {
      // Check permissions for non-admin users
      if (req.user.role !== 'admin') {
        const user = await User.findById(req.user.id);
        const hasPermission = user.committeeDetails && 
                             user.committeeDetails.permissions && 
                             user.committeeDetails.permissions.includes('approve_payments');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to verify payments' });
        }
      }
      
      const payment = await Payment.findById(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ msg: 'Payment not found' });
      }
      
      if (payment.status !== 'pending') {
        return res.status(400).json({ msg: `Payment already ${payment.status}` });
      }
      
      // Update payment status
      const updatedPayment = await Payment.updatePaymentStatus(
        req.params.paymentId, 
        'completed', 
        { userId: req.user.id }
      );
      
      // Update event participant payment status
      await Event.findOneAndUpdate(
        { 
          _id: payment.event, 
          'participants.user': payment.user 
        },
        { 
          $set: { 
            'participants.$.paymentStatus': 'completed',
            'participants.$.paymentDate': Date.now()
          } 
        }
      );
      
      // Get event details for notification
      const event = await Event.findById(payment.event);
      
      // Create notification for the user
      const notificationData = {
        title: `Payment Verified for ${event.title}`,
        message: `Your payment of ${payment.amount} for the event "${event.title}" has been verified`,
        type: 'payment',
        event: event._id,
        priority: 'medium'
      };
      
      await Notification.create({
        ...notificationData,
        recipients: [{ user: payment.user }],
        createdBy: req.user.id,
        sentAt: Date.now()
      });
      
      res.json(updatedPayment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/payments/:paymentId/refund
// @desc    Refund a payment
// @access  Private (Admin, Committee with permissions)
router.put(
  '/:paymentId/refund',
  [
    auth,
    [
      check('reason', 'Refund reason is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Check permissions for non-admin users
      if (req.user.role !== 'admin') {
        const user = await User.findById(req.user.id);
        const hasPermission = user.committeeDetails && 
                             user.committeeDetails.permissions && 
                             user.committeeDetails.permissions.includes('approve_payments');
        
        if (!hasPermission) {
          return res.status(403).json({ msg: 'Not authorized to refund payments' });
        }
      }
      
      const payment = await Payment.findById(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ msg: 'Payment not found' });
      }
      
      if (payment.status === 'refunded') {
        return res.status(400).json({ msg: 'Payment already refunded' });
      }
      
      // Update payment status
      const updatedPayment = await Payment.updatePaymentStatus(
        req.params.paymentId, 
        'refunded', 
        { userId: req.user.id, reason: req.body.reason }
      );
      
      // Update event participant payment status
      await Event.findOneAndUpdate(
        { 
          _id: payment.event, 
          'participants.user': payment.user 
        },
        { 
          $set: { 
            'participants.$.paymentStatus': 'refunded'
          } 
        }
      );
      
      // Get event details for notification
      const event = await Event.findById(payment.event);
      
      // Create notification for the user
      const notificationData = {
        title: `Payment Refunded for ${event.title}`,
        message: `Your payment of ${payment.amount} for the event "${event.title}" has been refunded. Reason: ${req.body.reason}`,
        type: 'payment',
        event: event._id,
        priority: 'high'
      };
      
      await Notification.create({
        ...notificationData,
        recipients: [{ user: payment.user }],
        createdBy: req.user.id,
        sentAt: Date.now()
      });
      
      res.json(updatedPayment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router; 