const Lead = require('../models/Lead');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── @GET /api/leads ──────────────────────────────────────────────────────────
exports.getLeads = async (req, res) => {
  const { status, assigned_to, search, page = 1, limit = 50, sort = 'desc' } = req.query;

  const filter = {};

  // Sales persons only see their own leads
  if (req.user.role === 'sales_person') {
    filter.assigned_to = req.user._id;
  } else {
    if (assigned_to) filter.assigned_to = assigned_to;
  }

  if (status && status !== 'all') filter.status = status;

  if (search) {
    filter.$or = [
      { customer_name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { lead_number: { $regex: search, $options: 'i' } },
      { pincode: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Lead.countDocuments(filter);

  const sortDirection = sort === 'asc' ? 1 : -1;

  const leads = await Lead.find(filter)
    .populate('assigned_to', 'name employee_id')
    .sort({ createdAt: sortDirection })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: leads.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: leads,
  });
};

// ─── @GET /api/leads/:id ──────────────────────────────────────────────────────
exports.getLeadById = async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assigned_to', 'name employee_id email mobile')
    .populate('status_history.changed_by', 'name');

  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  res.json({ success: true, data: lead });
};

// ─── @POST /api/leads ─────────────────────────────────────────────────────────
exports.createLead = async (req, res) => {
  const { customer_name, mobile, pincode, state, district, address, assigned_to, notes } = req.body;

  const lead = await Lead.create({
    customer_name,
    mobile,
    pincode,
    state,
    district,
    address,
    assigned_to: assigned_to || null,
    status: assigned_to ? 'assigned' : 'new',
    source: 'manual',
    notes,
    status_history: [{ status: 'new', changed_by: req.user._id }],
  });

  if (assigned_to) {
    await Notification.create({
      user: assigned_to,
      title: 'New Lead Assigned',
      message: `Lead ${lead.lead_number} (${customer_name}) has been assigned to you.`,
      type: 'lead_assigned',
    });
  }

  await lead.populate('assigned_to', 'name employee_id');

  res.status(201).json({ success: true, data: lead });
};

// ─── @PATCH /api/leads/:id ───────────────────────────────────────────────────
exports.updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  const { status, assigned_to, notes, address, pincode, state, district } = req.body;

  // Track status changes in history
  if (status && status !== lead.status) {
    lead.status_history.push({
      status,
      changed_by: req.user._id,
      note: req.body.note,
    });
    lead.status = status;
  }

  if (assigned_to !== undefined) {
    const oldAssignedTo = lead.assigned_to ? lead.assigned_to.toString() : null;
    lead.assigned_to = assigned_to || null;
    if (assigned_to && lead.status === 'new') {
      lead.status = 'assigned';
      lead.status_history.push({ status: 'assigned', changed_by: req.user._id });
    }
    
    // Trigger notification if assigned_to changed and is not null
    if (assigned_to && assigned_to !== oldAssignedTo) {
      await Notification.create({
        user: assigned_to,
        title: 'New Lead Assigned',
        message: `Lead ${lead.lead_number} (${lead.customer_name}) has been assigned to you.`,
        type: 'lead_assigned',
      });
    }
  }

  if (notes !== undefined) lead.notes = notes;
  if (address !== undefined) lead.address = address;
  if (pincode !== undefined) lead.pincode = pincode;
  if (state !== undefined) lead.state = state;
  if (district !== undefined) lead.district = district;

  await lead.save();
  await lead.populate('assigned_to', 'name employee_id');

  res.json({ success: true, data: lead });
};

// ─── @DELETE /api/leads/:id ──────────────────────────────────────────────────
exports.deleteLead = async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, message: 'Lead deleted' });
};

// ─── @POST /api/leads/bulk-import ────────────────────────────────────────────
exports.bulkImport = async (req, res) => {
  const { leads } = req.body;
  const autoAssign = req.body.autoAssign === true || req.body.autoAssign === 'true';

  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ success: false, message: 'leads must be a non-empty array' });
  }

  const results = { created: 0, failed: 0, errors: [] };
  
  let agents = [];
  if (autoAssign) {
    agents = await User.find({ role: 'sales_person', status: 'active' });
  }

  let currentAgentIndex = 0;
  let assignedCountForCurrent = 0;

  for (const leadData of leads) {
    try {
      let assigned_to = leadData.assigned_to || null;
      
      // Auto-assignment logic (10 leads per employee)
      if (autoAssign && agents.length > 0) {
        assigned_to = agents[currentAgentIndex]._id;
        assignedCountForCurrent++;
        
        if (assignedCountForCurrent >= 10) {
          assignedCountForCurrent = 0;
          currentAgentIndex = (currentAgentIndex + 1) % agents.length;
        }
      }

      const lead = await Lead.create({
        ...leadData,
        assigned_to,
        source: 'bulk_import',
        status: assigned_to ? 'assigned' : 'new',
        status_history: [{ status: 'new', changed_by: req.user._id }],
      });
      results.created++;

      if (assigned_to) {
        await Notification.create({
          user: assigned_to,
          title: 'New Lead Assigned',
          message: `Lead ${lead.lead_number} (${lead.customer_name}) has been assigned to you.`,
          type: 'lead_assigned',
        });
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ data: leadData, error: err.message });
    }
  }

  res.status(201).json({ success: true, results });
};
