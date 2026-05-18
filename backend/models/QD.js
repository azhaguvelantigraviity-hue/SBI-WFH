const mongoose = require('mongoose');

const qdSchema = new mongoose.Schema(
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
    employment_type: {
      type: String,
      enum: ['salaried', 'self_employed', 'business', 'retired', 'other'],
      required: [true, 'Employment type is required'],
    },
    // Income details
    monthly_income: { type: Number },
    annual_income: { type: Number },
    employer_name: { type: String, trim: true },

    // Status flow: pending → dispatched (or rejected)
    status: {
      type: String,
      enum: ['pending', 'under_review', 'dispatched', 'rejected'],
      default: 'pending',
    },

    // Uploaded documents (paths stored from Multer)
    documents: [
      {
        filename: String,
        originalname: String,
        path: String,
        mimetype: String,
        size: Number,
        uploaded_at: { type: Date, default: Date.now },
      },
    ],

    submitted_at: {
      type: Date,
      default: Date.now,
    },
    dispatched_at: {
      type: Date,
    },
    rejection_reason: { type: String },
    notes: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

qdSchema.index({ agent: 1, status: 1 });
qdSchema.index({ lead: 1 });

module.exports = mongoose.model('QD', qdSchema);
