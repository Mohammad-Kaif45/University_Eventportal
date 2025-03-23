const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'waived'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'online_payment', 'waived'],
    required: true
  },
  transactionId: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  receiptNumber: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  notes: {
    type: String
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  refundReason: {
    type: String
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundedAt: {
    type: Date
  },
  waivedReason: {
    type: String
  },
  waivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  waivedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create a compound index for event and user to ensure uniqueness
paymentSchema.index({ event: 1, user: 1 }, { unique: true });

// Method to update payment status
paymentSchema.statics.updatePaymentStatus = async function(paymentId, newStatus, userData) {
  const update = { status: newStatus };
  
  if (newStatus === 'completed') {
    update.paymentDate = new Date();
    update.verifiedBy = userData.userId;
    update.verifiedAt = new Date();
  } else if (newStatus === 'refunded') {
    update.refundReason = userData.reason || 'Refund requested';
    update.refundedBy = userData.userId;
    update.refundedAt = new Date();
  } else if (newStatus === 'waived') {
    update.waivedReason = userData.reason || 'Fee waived';
    update.waivedBy = userData.userId;
    update.waivedAt = new Date();
  }
  
  return this.findByIdAndUpdate(paymentId, update, { new: true });
};

// Static method to generate payment statistics for an event
paymentSchema.statics.getEventPaymentStats = async function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }},
    { $project: {
      status: '$_id',
      count: 1,
      totalAmount: 1,
      _id: 0
    }}
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 