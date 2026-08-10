const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: { 
    type: String, 
    required: true 
  },
  description: { type: String, required: true, maxlength: 1000 },
  photo: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String, required: true }
  },
  priority: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed', 'Pending'], 
    default: 'Submitted' 
  },
  assignedDept: { type: String },
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deadline: { type: Date },
  isSLABreached: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
  upvotes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  upvoteCount: { type: Number, default: 0 },
  resolvedPhoto: { type: String, default: null },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date }
  },
  aiConfidence: { type: Number }
}, { timestamps: true });

// Setup 2dsphere index for geospatial lookup
ComplaintSchema.index({ location: '2dsphere' });
ComplaintSchema.index({ 'location.coordinates': '2dsphere' });

const Complaint = mongoose.model('Complaint', ComplaintSchema);

// Auto-create indexes on DB connection
Complaint.createIndexes().catch(err => {
  console.warn('[MONGOOSE] Index creation warning:', err.message);
});

module.exports = Complaint;
