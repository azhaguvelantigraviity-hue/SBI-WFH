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
    if (assigned_to) {
      if (assigned_to === 'null' || assigned_to === 'unassigned') {
        filter.assigned_to = null;
      } else {
        filter.assigned_to = assigned_to;
      }
    }
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
  const { customer_name, mobile, pincode, state, district, address, landmark, assigned_to, notes, pan, father_name, mother_name, verification_status } = req.body;

  const lead = await Lead.create({
    customer_name,
    mobile,
    pincode,
    state,
    district,
    address,
    landmark,
    pan,
    father_name,
    mother_name,
    verification_status,
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

  const { status, assigned_to, notes, address, landmark, pincode, state, district, pan, father_name, mother_name, verification_status } = req.body;

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
  if (landmark !== undefined) lead.landmark = landmark;
  if (pincode !== undefined) lead.pincode = pincode;
  if (state !== undefined) lead.state = state;
  if (district !== undefined) lead.district = district;
  if (pan !== undefined) lead.pan = pan;
  if (father_name !== undefined) lead.father_name = father_name;
  if (mother_name !== undefined) lead.mother_name = mother_name;
  if (verification_status !== undefined) {
    lead.verification_status = verification_status;
    if (verification_status === 'Follow Up') {
      lead.call_status = 'follow_up';
      const Call = require('../models/Call');
      await Call.create({
        lead: lead._id,
        agent: req.user._id,
        customer_name: lead.customer_name,
        mobile: lead.mobile,
        status: 'follow_up',
        duration: '—',
        notes: notes || 'Logged from Leads update',
        lead_status_after: lead.status,
      });
    } else if (verification_status === 'Exception') {
      lead.call_status = 'exception';
      const Call = require('../models/Call');
      await Call.create({
        lead: lead._id,
        agent: req.user._id,
        customer_name: lead.customer_name,
        mobile: lead.mobile,
        status: 'exception',
        duration: '—',
        notes: notes || 'Logged from Leads update',
        lead_status_after: lead.status,
      });
    }
  }

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
  const autoAssign = req.body.autoAssign !== false && req.body.autoAssign !== 'false';

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

// ─── @POST /api/leads/bulk-assign ───────────────────────────────────────────
exports.bulkAssign = async (req, res) => {
  const { leadIds, assigned_to } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ success: false, message: 'leadIds must be a non-empty array' });
  }

  if (!assigned_to) {
    return res.status(400).json({ success: false, message: 'assigned_to is required' });
  }

  // Update leads in bulk
  await Lead.updateMany(
    { _id: { $in: leadIds } },
    { 
      assigned_to, 
      status: 'assigned',
      $push: { 
        status_history: { 
          status: 'assigned', 
          changed_by: req.user._id 
        } 
      }
    }
  );

  // Trigger notifications
  const leads = await Lead.find({ _id: { $in: leadIds } });
  for (const lead of leads) {
    await Notification.create({
      user: assigned_to,
      title: 'New Lead Assigned',
      message: `Lead ${lead.lead_number} (${lead.customer_name}) has been assigned to you.`,
      type: 'lead_assigned',
    });
  }

  res.json({ success: true, message: `Successfully assigned ${leadIds.length} leads.` });
};
