const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Chess', 'Basketball', 'Swimming', 'Athletics', 'Cricket', 
           'Badminton', 'Table Tennis', 'Hackathons', 'Cultural', 'Music', 
           'Dance', 'Technical', 'Academic', 'Other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  venue: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    location: String
  },
  committee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Committee',
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  participantLimit: {
    type: Number,
    required: true
  },
  registrationFee: {
    type: Number,
    required: true,
    default: 0
  },
  registrationStartDate: {
    type: Date,
    required: true
  },
  registrationEndDate: {
    type: Date,
    required: true
  },
  rules: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'cancelled', 'completed'],
    default: 'draft'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'waived'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'waived'],
    },
    paymentId: String,
    paymentAmount: Number,
    paymentDate: Date,
    attendance: {
      type: Boolean,
      default: false
    },
    attendanceMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attendanceMarkedAt: Date,
    result: {
      rank: Number,
      points: Number,
      certificate: String,
      certificateUrl: String,
      awardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      awardedAt: Date
    }
  }],
  waitlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sponsors: [{
    name: String,
    logo: String,
    tier: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze']
    },
    contribution: Number,
    benefits: [String]
  }],
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    value: Number,
    type: {
      type: String,
      enum: ['cash', 'voucher', 'trophy', 'certificate', 'other'],
      default: 'certificate'
    }
  }],
  schedule: [{
    title: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    description: String,
    venue: String,
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  requirements: [{
    type: String,
    required: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['update', 'reminder', 'cancellation', 'result']
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  feedbacks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resultsPublished: {
    type: Boolean,
    default: false
  },
  resultsPublishedAt: Date,
  resultsPublishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ startDate: 1, category: 1 });
eventSchema.index({ 'venue.id': 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ committee: 1 });
eventSchema.index({ organizer: 1 });

// Method to check for venue scheduling conflicts
eventSchema.statics.checkVenueConflict = async function(venueId, startDate, endDate, startTime, endTime, excludeEventId = null) {
  const query = {
    'venue.id': venueId,
    status: { $nin: ['draft', 'cancelled'] },
    $or: [
      // Event starts during another event
      {
        startDate: { $lte: startDate },
        endDate: { $gte: startDate }
      },
      // Event ends during another event
      {
        startDate: { $lte: endDate },
        endDate: { $gte: endDate }
      },
      // Event contains another event
      {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }
    ]
  };

  // Exclude the current event when updating
  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  const conflictingEvents = await this.find(query);
  
  // Further check time overlap for events on the same day
  return conflictingEvents.filter(event => {
    const eventStartTime = timeToMinutes(event.startTime);
    const eventEndTime = timeToMinutes(event.endTime);
    const newStartTime = timeToMinutes(startTime);
    const newEndTime = timeToMinutes(endTime);
    
    return (
      (newStartTime >= eventStartTime && newStartTime < eventEndTime) ||
      (newEndTime > eventStartTime && newEndTime <= eventEndTime) ||
      (newStartTime <= eventStartTime && newEndTime >= eventEndTime)
    );
  });
};

// Helper function to convert time strings to minutes for comparison
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 