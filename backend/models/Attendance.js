const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  verificationMethod: {
    type: String,
    enum: ['manual', 'qr_code', 'rfid', 'other'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Create a compound index for event and user to ensure uniqueness
attendanceSchema.index({ event: 1, user: 1 }, { unique: true });

// Method to mark attendance for multiple users
attendanceSchema.statics.markBulkAttendance = async function(eventId, userIds, status, markedBy) {
  const operations = userIds.map(userId => ({
    updateOne: {
      filter: { event: eventId, user: userId },
      update: {
        $set: {
          status,
          markedBy,
          markedAt: new Date(),
          checkInTime: status === 'present' ? new Date() : null
        }
      },
      upsert: true
    }
  }));

  return this.bulkWrite(operations);
};

// Method to get attendance statistics for an event
attendanceSchema.statics.getEventStatistics = async function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }},
    { $project: {
      status: '$_id',
      count: 1,
      _id: 0
    }}
  ]);
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 