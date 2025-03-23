const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'announcement', 'reminder', 'achievement', 'system', 'payment', 'result'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  sendToAll: {
    type: Boolean,
    default: false
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  targetRoles: [{
    type: String,
    enum: ['student', 'committee_member', 'admin']
  }],
  targetInterests: [{
    type: String
  }],
  targetDepartments: [{
    type: String
  }],
  sentViaEmail: {
    type: Boolean,
    default: false
  },
  sentViaPush: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ 'recipients.user': 1, 'recipients.read': 1 });
notificationSchema.index({ scheduledFor: 1 });

// Static method to create and send a notification to all users
notificationSchema.statics.sendToAll = async function(notificationData, createdBy) {
  const User = mongoose.model('User');
  const users = await User.find({}, '_id');
  
  const notification = new this({
    ...notificationData,
    sendToAll: true,
    recipients: users.map(user => ({ user: user._id })),
    createdBy,
    sentAt: new Date()
  });
  
  return notification.save();
};

// Static method to send notification to users with specific interests
notificationSchema.statics.sendToUsersWithInterests = async function(notificationData, interests, createdBy) {
  const User = mongoose.model('User');
  const users = await User.find({ interests: { $in: interests } }, '_id');
  
  const notification = new this({
    ...notificationData,
    targetInterests: interests,
    recipients: users.map(user => ({ user: user._id })),
    createdBy,
    sentAt: new Date()
  });
  
  return notification.save();
};

// Method to mark notification as read for a user
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, 'recipients.user': userId },
    {
      $set: {
        'recipients.$.read': true,
        'recipients.$.readAt': new Date()
      }
    },
    { new: true }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 