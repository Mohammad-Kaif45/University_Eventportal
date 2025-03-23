const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Committee = require('../models/Committee');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @route   GET api/committees
// @desc    Get all committees
// @access  Public
router.get('/', async (req, res) => {
  try {
    const committees = await Committee.find()
      .populate('members.user', 'name email profilePicture department')
      .sort({ name: 1 });
    
    res.json(committees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/committees/:id
// @desc    Get committee by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id)
      .populate('members.user', 'name email profilePicture department')
      .populate('events', 'title startDate endDate venue status');
    
    if (!committee) {
      return res.status(404).json({ msg: 'Committee not found' });
    }
    
    res.json(committee);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Committee not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/committees
// @desc    Create a committee
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    roleCheck(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').isIn([
        'academic', 'sports', 'cultural', 'technical', 'social', 'other'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // Check if committee with same name already exists
      const existingCommittee = await Committee.findOne({ name: req.body.name });
      if (existingCommittee) {
        return res.status(400).json({ msg: 'Committee with this name already exists' });
      }
      
      // Create new committee
      const { name, description, category, members } = req.body;
      
      const newCommittee = new Committee({
        name,
        description,
        category,
        members: members || [] // Initialize with provided members or empty array
      });
      
      const committee = await newCommittee.save();
      
      // If members are provided, update their user profiles
      if (members && members.length > 0) {
        const userUpdates = members.map(member => {
          return User.findByIdAndUpdate(
            member.user,
            {
              $set: {
                role: 'committee_member',
                'committeeDetails.committee': committee._id,
                'committeeDetails.position': member.role,
                'committeeDetails.joinDate': Date.now()
              }
            }
          );
        });
        
        await Promise.all(userUpdates);
        
        // Send notifications to all members
        const notificationPromises = members.map(member => {
          return Notification.create({
            title: `Added to Committee: ${name}`,
            message: `You have been added to the ${name} committee as ${member.role}`,
            type: 'system',
            priority: 'high',
            recipients: [{ user: member.user }],
            createdBy: req.user.id,
            sentAt: Date.now()
          });
        });
        
        await Promise.all(notificationPromises);
      }
      
      res.json(committee);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/committees/:id
// @desc    Update a committee
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').isIn([
        'academic', 'sports', 'cultural', 'technical', 'social', 'other'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      let committee = await Committee.findById(req.params.id);
      
      if (!committee) {
        return res.status(404).json({ msg: 'Committee not found' });
      }
      
      // If name is being changed, check if new name is already taken
      if (req.body.name !== committee.name) {
        const existingCommittee = await Committee.findOne({ name: req.body.name });
        if (existingCommittee) {
          return res.status(400).json({ msg: 'Committee with this name already exists' });
        }
      }
      
      // Update basic info
      const { name, description, category } = req.body;
      
      committee = await Committee.findByIdAndUpdate(
        req.params.id,
        {
          name,
          description,
          category
        },
        { new: true }
      );
      
      res.json(committee);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Committee not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/committees/:id
// @desc    Delete a committee
// @access  Private (Admin only)
router.delete('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id);
    
    if (!committee) {
      return res.status(404).json({ msg: 'Committee not found' });
    }
    
    // Check if committee has associated events
    const events = await Event.find({ committee: req.params.id });
    if (events.length > 0) {
      return res.status(400).json({ 
        msg: 'Cannot delete committee with associated events. Please reassign events to another committee first.',
        events: events.map(e => ({ id: e._id, title: e.title }))
      });
    }
    
    // Update all committee members to remove committee association
    const memberUpdates = committee.members.map(member => {
      return User.findByIdAndUpdate(
        member.user,
        {
          $set: {
            role: 'student', // Reset to student role
            committeeDetails: {} // Clear committee details
          }
        }
      );
    });
    
    await Promise.all(memberUpdates);
    
    // Delete the committee
    await committee.remove();
    
    res.json({ msg: 'Committee removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Committee not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/committees/:id/members
// @desc    Add members to committee
// @access  Private (Admin only)
router.post(
  '/:id/members',
  [
    auth,
    roleCheck(['admin']),
    [
      check('members', 'Members array is required').isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const committee = await Committee.findById(req.params.id);
      
      if (!committee) {
        return res.status(404).json({ msg: 'Committee not found' });
      }
      
      const { members } = req.body;
      
      // Validate each member
      for (const member of members) {
        if (!member.user || !member.role) {
          return res.status(400).json({ 
            msg: 'Each member must have user ID and role specified'
          });
        }
        
        // Check if user exists
        const user = await User.findById(member.user);
        if (!user) {
          return res.status(404).json({ 
            msg: `User with ID ${member.user} not found`
          });
        }
        
        // Check if user is already in the committee
        const isExistingMember = committee.members.some(
          m => m.user.toString() === member.user
        );
        
        if (isExistingMember) {
          return res.status(400).json({ 
            msg: `User with ID ${member.user} is already a member of this committee`
          });
        }
      }
      
      // Add new members
      const newMembers = members.map(member => ({
        user: member.user,
        role: member.role,
        joinedAt: Date.now()
      }));
      
      committee.members.push(...newMembers);
      await committee.save();
      
      // Update user roles and committee details
      const userUpdates = members.map(member => {
        return User.findByIdAndUpdate(
          member.user,
          {
            $set: {
              role: 'committee_member',
              'committeeDetails.committee': committee._id,
              'committeeDetails.position': member.role,
              'committeeDetails.joinDate': Date.now()
            }
          }
        );
      });
      
      await Promise.all(userUpdates);
      
      // Send notifications to new members
      const notificationPromises = members.map(member => {
        return Notification.create({
          title: `Added to Committee: ${committee.name}`,
          message: `You have been added to the ${committee.name} committee as ${member.role}`,
          type: 'system',
          priority: 'high',
          recipients: [{ user: member.user }],
          createdBy: req.user.id,
          sentAt: Date.now()
        });
      });
      
      await Promise.all(notificationPromises);
      
      // Return updated committee with populated member details
      const updatedCommittee = await Committee.findById(req.params.id)
        .populate('members.user', 'name email profilePicture department');
      
      res.json(updatedCommittee);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/committees/:id/members/:userId
// @desc    Remove a member from committee
// @access  Private (Admin only)
router.delete(
  '/:id/members/:userId',
  [auth, roleCheck(['admin'])],
  async (req, res) => {
    try {
      const committee = await Committee.findById(req.params.id);
      
      if (!committee) {
        return res.status(404).json({ msg: 'Committee not found' });
      }
      
      // Check if user is a member
      const memberIndex = committee.members.findIndex(
        member => member.user.toString() === req.params.userId
      );
      
      if (memberIndex === -1) {
        return res.status(404).json({ msg: 'User is not a member of this committee' });
      }
      
      // Remove member from committee
      committee.members.splice(memberIndex, 1);
      await committee.save();
      
      // Update user role and committee details
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          $set: {
            role: 'student', // Reset to student role
            committeeDetails: {} // Clear committee details
          }
        }
      );
      
      // Send notification to removed member
      await Notification.create({
        title: `Removed from Committee: ${committee.name}`,
        message: `You have been removed from the ${committee.name} committee`,
        type: 'system',
        priority: 'high',
        recipients: [{ user: req.params.userId }],
        createdBy: req.user.id,
        sentAt: Date.now()
      });
      
      res.json({ msg: 'Member removed from committee' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/committees/:id/members/:userId/permissions
// @desc    Update committee member permissions
// @access  Private (Admin only)
router.put(
  '/:id/members/:userId/permissions',
  [
    auth,
    roleCheck(['admin']),
    [
      check('permissions', 'Permissions array is required').isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const committee = await Committee.findById(req.params.id);
      
      if (!committee) {
        return res.status(404).json({ msg: 'Committee not found' });
      }
      
      // Check if user is a member
      const isMember = committee.members.some(
        member => member.user.toString() === req.params.userId
      );
      
      if (!isMember) {
        return res.status(404).json({ msg: 'User is not a member of this committee' });
      }
      
      // Validate permissions
      const validPermissions = [
        'create_event', 'edit_event', 'delete_event', 'manage_participants', 
        'manage_attendance', 'manage_results', 'manage_sponsors', 'manage_venues',
        'approve_payments', 'create_announcements'
      ];
      
      const { permissions } = req.body;
      
      for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
          return res.status(400).json({ 
            msg: `Invalid permission: ${permission}`,
            validPermissions
          });
        }
      }
      
      // Update user permissions
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          $set: {
            'committeeDetails.permissions': permissions
          }
        }
      );
      
      // Send notification about permission update
      await Notification.create({
        title: `Committee Permissions Updated`,
        message: `Your permissions in the ${committee.name} committee have been updated`,
        type: 'system',
        priority: 'high',
        recipients: [{ user: req.params.userId }],
        createdBy: req.user.id,
        sentAt: Date.now()
      });
      
      res.json({ msg: 'Member permissions updated', permissions });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router; 