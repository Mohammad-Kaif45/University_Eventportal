const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['participation', 'winner', 'appreciation', 'volunteer'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  position: {
    type: String
  },
  description: {
    type: String
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiryDate: {
    type: Date
  },
  templateUsed: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  downloadHistory: [{
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ip: String
  }],
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  verificationUrl: {
    type: String,
    required: true
  },
  metadata: {
    points: Number,
    skills: [String],
    achievements: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'revoked'],
    default: 'issued'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
certificateSchema.index({ event: 1, user: 1, type: 1 });
certificateSchema.index({ certificateNumber: 1 }, { unique: true });
certificateSchema.index({ verificationCode: 1 }, { unique: true });

// Static method to generate certificate number
certificateSchema.statics.generateCertificateNumber = async function(eventId, type) {
  const event = await mongoose.model('Event').findById(eventId, 'title');
  const eventCode = event.title.substring(0, 3).toUpperCase();
  const typeCode = type.substring(0, 1).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${eventCode}-${typeCode}-${timestamp}-${random}`;
};

// Static method to generate verification code
certificateSchema.statics.generateVerificationCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Static method to bulk generate participation certificates
certificateSchema.statics.bulkGenerateParticipationCertificates = async function(eventId, participantIds, issuedBy) {
  const certificatePromises = participantIds.map(async (userId) => {
    const certificateNumber = await this.generateCertificateNumber(eventId, 'participation');
    const verificationCode = this.generateVerificationCode();
    
    return {
      event: eventId,
      user: userId,
      type: 'participation',
      title: 'Certificate of Participation',
      certificateNumber,
      issueDate: new Date(),
      fileUrl: `/certificates/${certificateNumber}.pdf`, // This will be replaced with actual generated URL
      issuedBy,
      verificationCode,
      verificationUrl: `/verify-certificate/${verificationCode}`,
      status: 'issued'
    };
  });
  
  const certificates = await Promise.all(certificatePromises);
  return this.insertMany(certificates);
};

// Method to increment download count
certificateSchema.methods.incrementDownloadCount = function(ip) {
  this.downloadCount += 1;
  this.downloadHistory.push({ downloadedAt: new Date(), ip });
  return this.save();
};

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate; 