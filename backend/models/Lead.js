const mongoose = require('mongoose');

const LEAD_STATUSES = [
  'new',
  'assigned',
  'in_progress',
  'eligible',
  'not_eligible',
  'qd_submitted',
  'dispatched',
  'closed',
  'rejected',
];

const leadSchema = new mongoose.Schema(
  {
    lead_number: {
      type: String,
      unique: true,
      // auto-generated in pre-save hook
    },
    customer_name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile is required'],
      match: [/^\d{10}$/, 'Mobile must be a 10-digit number'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Pincode must be 6 digits'],
    },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    address: { type: String, trim: true },
    pan: { type: String, trim: true },
    father_name: { type: String, trim: true },
    mother_name: { type: String, trim: true },
    verification_status: { type: String, trim: true },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
    },
    call_status: {
      type: String,
      enum: ['pending', 'connected', 'not_connected', 'busy', 'switched_off', 'follow_up', 'exception', 'no_answer', 'wrong_number'],
      default: 'pending',
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    source: {
      type: String,
      enum: ['upload', 'manual', 'bulk_import'],
      default: 'manual',
    },
    notes: { type: String },
    status_history: [
      {
        status: { type: String, enum: LEAD_STATUSES },
        changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changed_at: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Auto-generate lead_number before first save
leadSchema.pre('save', async function (next) {
  if (this.isNew && !this.lead_number) {
    const lastLead = await mongoose.model('Lead').findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextNum = 10001;
    
    if (lastLead && lastLead.lead_number) {
      const lastNum = parseInt(lastLead.lead_number.replace(/\D/g, ''), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    
    this.lead_number = `SBI${nextNum}`;
  }
  next();
});

// Index for search performance
leadSchema.index({ customer_name: 'text', mobile: 'text', lead_number: 'text' });
leadSchema.index({ status: 1, assigned_to: 1 });

module.exports = mongoose.model('Lead', leadSchema);
