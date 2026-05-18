const mongoose = require('mongoose');

const incentiveSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent reference is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      // e.g. "2025-06"
    },
    month_label: {
      type: String,  // e.g. "June 2025" (display)
    },
    dispatched_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    per_dispatch_rate: {
      type: Number,
      default: 1000, // ₹1000 per dispatch
    },
    gross: {
      type: Number,
      default: 0,
    },
    tds_rate: {
      type: Number,
      default: 10, // 10%
    },
    tds: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paid_at: { type: Date },
    paid_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Auto-compute gross, tds, net before save
incentiveSchema.pre('save', function (next) {
  this.gross = this.dispatched_count * this.per_dispatch_rate;
  this.tds = Math.round(this.gross * (this.tds_rate / 100));
  this.net = this.gross - this.tds;
  next();
});

incentiveSchema.index({ agent: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Incentive', incentiveSchema);
