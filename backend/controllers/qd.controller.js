const QD = require('../models/QD');
const Lead = require('../models/Lead');
const path = require('path');
const fs = require('fs');

// ─── @GET /api/qd ─────────────────────────────────────────────────────────────
exports.getQDs = async (req, res) => {
  const { status, agent, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (req.user.role === 'sales_person') filter.agent = req.user._id;
  else if (agent) filter.agent = agent;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await QD.countDocuments(filter);

  const qds = await QD.find(filter)
    .populate('lead', 'lead_number customer_name mobile')
    .populate('agent', 'name employee_id')
    .sort({ submitted_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, count: qds.length, total, data: qds });
};

// ─── @GET /api/qd/:id ────────────────────────────────────────────────────────
exports.getQDById = async (req, res) => {
  const qd = await QD.findById(req.params.id)
    .populate('lead', 'lead_number customer_name mobile pincode status')
    .populate('agent', 'name employee_id email');

  if (!qd) return res.status(404).json({ success: false, message: 'QD not found' });
  res.json({ success: true, data: qd });
};

// ─── @POST /api/qd ───────────────────────────────────────────────────────────
exports.submitQD = async (req, res) => {
  const { lead_id, employment_type, monthly_income, annual_income, employer_name, notes } = req.body;

  const lead = await Lead.findById(lead_id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  // Prevent duplicate QD for same lead
  const existing = await QD.findOne({ lead: lead_id });
  if (existing) {
    return res.status(409).json({ success: false, message: 'QD already submitted for this lead' });
  }

  const qd = await QD.create({
    lead: lead_id,
    agent: req.user._id,
    customer_name: lead.customer_name,
    mobile: lead.mobile,
    employment_type,
    monthly_income,
    annual_income,
    employer_name,
    notes,
  });

  // Update lead status
  lead.status = 'qd_submitted';
  lead.status_history.push({ status: 'qd_submitted', changed_by: req.user._id });
  await lead.save();

  await qd.populate('lead', 'lead_number customer_name');
  await qd.populate('agent', 'name');

  res.status(201).json({ success: true, data: qd });
};

// ─── @PATCH /api/qd/:id ──────────────────────────────────────────────────────
exports.updateQD = async (req, res) => {
  const { status, rejection_reason, remarks } = req.body;

  const qd = await QD.findById(req.params.id);
  if (!qd) return res.status(404).json({ success: false, message: 'QD not found' });

  if (status) {
    qd.status = status;
    const Notification = require('../models/Notification');
    if (status === 'dispatched') {
      qd.dispatched_at = new Date();
      // Update lead status to dispatched
      await Lead.findByIdAndUpdate(qd.lead, {
        status: 'dispatched',
        $push: { status_history: { status: 'dispatched', changed_by: req.user._id } },
      });
      // Notification for agent
      await Notification.create({
        user: qd.agent,
        title: 'Application Approved',
        message: `Application for customer ${qd.customer_name} has been approved.`,
        type: 'qd_dispatched',
      });
    } else if (status === 'rejected') {
      // Update lead status to rejected
      await Lead.findByIdAndUpdate(qd.lead, {
        status: 'rejected',
        $push: { status_history: { status: 'rejected', changed_by: req.user._id, note: rejection_reason || 'QD Rejected' } },
      });
      // Notification for agent
      await Notification.create({
        user: qd.agent,
        title: 'Application Rejected',
        message: `Application for customer ${qd.customer_name} has been rejected. Reason: ${rejection_reason || 'QD Rejected'}`,
        type: 'system',
      });
    }
  }

  if (rejection_reason) qd.rejection_reason = rejection_reason;
  if (remarks) qd.remarks = remarks;

  await qd.save();

  res.json({ success: true, data: qd });
};

// ─── @POST /api/qd/:id/docs ──────────────────────────────────────────────────
exports.uploadDocs = async (req, res) => {
  const qd = await QD.findById(req.params.id);
  if (!qd) return res.status(404).json({ success: false, message: 'QD not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const newDocs = req.files.map(f => ({
    filename: f.filename,
    originalname: f.originalname,
    path: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size,
  }));

  qd.documents.push(...newDocs);
  await qd.save();

  res.json({ success: true, message: `${req.files.length} document(s) uploaded`, data: qd.documents });
};

// ─── @GET /api/qd/:id/docs/:docIndex/download ─────────────────────────────────
exports.downloadDoc = async (req, res) => {
  const qd = await QD.findById(req.params.id);
  if (!qd) return res.status(404).json({ success: false, message: 'QD not found' });

  const docIndex = parseInt(req.params.docIndex);
  const doc = qd.documents?.[docIndex];
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  // Build absolute path to the file on disk
  const filePath = path.join(__dirname, '..', 'uploads', doc.filename);

  if (!fs.existsSync(filePath)) {
    // File not on this server instance — send doc metadata so frontend
    // can fall back to opening the /uploads static URL directly
    return res.status(200).json({
      success: false,
      fallback: true,
      staticUrl: doc.path,           // e.g. /uploads/1779343527784-Agent_ID_Card.pdf
      originalname: doc.originalname,
    });
  }

  // File exists on disk — stream it with correct Content-Disposition header
  res.download(filePath, doc.originalname, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ success: false, message: 'Download failed' });
    }
  });
};
