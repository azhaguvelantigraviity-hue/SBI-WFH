const Call = require('../models/Call');
const Lead = require('../models/Lead');

// ─── @GET /api/calls ─────────────────────────────────────────────────────────
exports.getCalls = async (req, res) => {
  const { agent, status, date, page = 1, limit = 50 } = req.query;

  const filter = {};

  // Sales persons only see their own calls
  if (req.user.role === 'sales_person') {
    filter.agent = req.user._id;
  } else if (agent) {
    filter.agent = agent;
  }

  if (status) filter.status = status;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.called_at = { $gte: start, $lte: end };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Call.countDocuments(filter);

  const calls = await Call.find(filter)
    .populate('lead', 'lead_number status assigned_to call_status')
    .populate('agent', 'name employee_id')
    .sort({ called_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, count: calls.length, total, data: calls });
};

// ─── @POST /api/calls ────────────────────────────────────────────────────────
exports.logCall = async (req, res) => {
  const { lead_id, status, duration, duration_seconds, lead_status_after, notes } = req.body;

  const lead = await Lead.findById(lead_id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  const call = await Call.create({
    lead: lead_id,
    agent: req.user._id,
    customer_name: lead.customer_name,
    mobile: lead.mobile,
    status,
    duration: duration || '—',
    duration_seconds: duration_seconds || 0,
    lead_status_after,
    notes,
  });

  // Optionally update lead status after call
  if (lead_status_after && lead_status_after !== lead.status) {
    lead.status = lead_status_after;
    lead.status_history.push({ status: lead_status_after, changed_by: req.user._id, note: `After call: ${status}` });
  }

  // Always update the lead's call outcome status
  lead.call_status = status;
  await lead.save();

  await call.populate('lead', 'lead_number');
  await call.populate('agent', 'name');

  res.status(201).json({ success: true, data: call });
};

// ─── @GET /api/calls/stats ───────────────────────────────────────────────────
exports.getCallStats = async (req, res) => {
  const { agent } = req.query;
  const filter = {};
  if (req.user.role === 'sales_person') filter.agent = req.user._id;
  else if (agent) filter.agent = agent;

  const stats = await Call.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total_seconds: { $sum: '$duration_seconds' },
      },
    },
  ]);

  res.json({ success: true, data: stats });
};
