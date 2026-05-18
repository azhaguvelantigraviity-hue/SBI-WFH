const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent reference is required'],
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'not_connected', 'busy', 'no_answer', 'wrong_number', 'follow_up', 'exception'],
      required: true,
    },
    duration: {
      type: String, // e.g. "5:24"
      default: '—',
    },
    duration_seconds: {
      type: Number,
      default: 0,
    },
    lead_status_after: {
      type: String,
      enum: ['new', 'assigned', 'in_progress', 'eligible', 'not_eligible', 'qd_submitted', 'dispatched', 'closed', 'rejected'],
    },
    notes: { type: String, trim: true },
    called_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

callSchema.index({ agent: 1, called_at: -1 });
callSchema.index({ lead: 1 });

module.exports = mongoose.model('Call', callSchema);
