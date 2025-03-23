const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  facilities: [{
    type: String
  }],
  description: {
    type: String
  },
  images: [{
    url: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['available', 'maintenance', 'reserved'],
    default: 'available'
  },
  type: {
    type: String,
    enum: ['indoor', 'outdoor', 'classroom', 'lab', 'auditorium', 'stadium', 'court', 'other'],
    required: true
  },
  bookingRequirements: [{
    type: String
  }],
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to check if venue is available for specific date and time
venueSchema.statics.checkAvailability = async function(venueId, startDate, endDate, startTime, endTime, excludeEventId = null) {
  const Event = mongoose.model('Event');
  return await Event.checkVenueConflict(venueId, startDate, endDate, startTime, endTime, excludeEventId);
};

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue; 