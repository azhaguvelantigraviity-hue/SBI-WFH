const Incentive = require('../models/Incentive');
const User = require('../models/User');
const Lead = require('../models/Lead');

// ─── @GET /api/incentives ─────────────────────────────────────────────────────
exports.getIncentives = async (req, res) => {
  const { month, agent, status } = req.query;

  const filter = {};
  if (req.user.role === 'sales_person') filter.agent = req.user._id;
  else if (agent) filter.agent = agent;
  if (month) filter.month = month;
  if (status) filter.status = status;

  const incentives = await Incentive.find(filter)
    .populate('agent', 'name employee_id')
    .populate('paid_by', 'name')
    .sort({ month: -1, createdAt: -1 });

  res.json({ success: true, count: incentives.length, data: incentives });
};

// ─── @POST /api/incentives/generate ──────────────────────────────────────────
// Admin generates incentives for a given month based on dispatched leads
exports.generateIncentives = async (req, res) => {
  const { month, month_label, per_dispatch_rate = 1000, tds_rate = 10 } = req.body;

  if (!month) return res.status(400).json({ success: false, message: 'month is required (e.g. 2025-06)' });

  const [year, mon] = month.split('-');
  const start = new Date(parseInt(year), parseInt(mon) - 1, 1);
  const end = new Date(parseInt(year), parseInt(mon), 0, 23, 59, 59);

  // Count dispatched leads per agent in the month
  const dispatches = await Lead.aggregate([
    {
      $match: {
        status: 'dispatched',
        updatedAt: { $gte: start, $lte: end },
        assigned_to: { $ne: null },
      },
    },
    { $group: { _id: '$assigned_to', count: { $sum: 1 } } },
  ]);

  const results = [];

  for (const d of dispatches) {
    try {
      const inc = await Incentive.findOneAndUpdate(
        { agent: d._id, month },
        {
          agent: d._id,
          month,
          month_label: month_label || month,
          dispatched_count: d.count,
          per_dispatch_rate,
          tds_rate,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
      results.push(inc);
    } catch (err) {
      // skip duplicates
    }
  }

  res.status(201).json({ success: true, generated: results.length, data: results });
};

// ─── @PATCH /api/incentives/:id/pay ──────────────────────────────────────────
exports.markPaid = async (req, res) => {
  const incentive = await Incentive.findById(req.params.id);
  if (!incentive) return res.status(404).json({ success: false, message: 'Incentive not found' });

  incentive.status = 'paid';
  incentive.paid_at = new Date();
  incentive.paid_by = req.user._id;
  if (req.body.remarks) incentive.remarks = req.body.remarks;

  await incentive.save();

  res.json({ success: true, data: incentive });
};
