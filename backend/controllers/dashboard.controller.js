const Lead = require('../models/Lead');
const User = require('../models/User');
const Call = require('../models/Call');
const QD = require('../models/QD');
const Incentive = require('../models/Incentive');

// ─── @GET /api/dashboard/stats ────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const [
    totalLeads,
    eligibleLeads,
    dispatchedLeads,
    activeAgents,
    pendingQDs,
    totalCalls,
    connectedCalls,
    totalIncentivePaid,
    statusBreakdown,
    topPerformers,
    recentLeads,
    recentCalls,
    followUps,
    exceptions,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'eligible' }),
    Lead.countDocuments({ status: 'dispatched' }),
    User.countDocuments({ role: 'sales_person', status: 'active' }),
    QD.countDocuments({ status: 'pending' }),
    Call.countDocuments(),
    Call.countDocuments({ status: 'connected' }),
    Incentive.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$net' } } },
    ]),
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { status: 'dispatched', assigned_to: { $ne: null } } },
      { $group: { _id: '$assigned_to', dispatched: { $sum: 1 } } },
      { $sort: { dispatched: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          name: '$agent.name',
          employee_id: '$agent.employee_id',
          dispatched: 1,
        },
      },
    ]),
    Lead.find().sort({ createdAt: -1 }).limit(5).populate('assigned_to', 'name'),
    Call.find().sort({ called_at: -1 }).limit(5).populate('agent', 'name'),
    Lead.countDocuments({ call_status: 'follow_up' }),
    Lead.countDocuments({ call_status: 'exception' }),
  ]);

  const totalPaid = totalIncentivePaid[0]?.total || 0;

  const statusMap = {};
  statusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      stats: {
        total_leads: totalLeads,
        eligible: eligibleLeads,
        dispatched: dispatchedLeads,
        active_agents: activeAgents,
        pending_qds: pendingQDs,
        total_calls: totalCalls,
        connected_calls: connectedCalls,
        total_incentive_paid: totalPaid,
        connection_rate: totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0,
        follow_ups: followUps,
        exceptions: exceptions,
      },
      status_breakdown: statusMap,
      top_performers: topPerformers,
      recent_leads: recentLeads,
      recent_calls: recentCalls,
    },
  });
};

// ─── @GET /api/dashboard/agent-stats (for sales_person) ──────────────────────
exports.getAgentStats = async (req, res) => {
  const agentId = req.user._id;

  const [myLeads, myDispatched, myCalls, myPendingQDs, myIncentives] = await Promise.all([
    Lead.countDocuments({ assigned_to: agentId }),
    Lead.countDocuments({ assigned_to: agentId, status: 'dispatched' }),
    Call.countDocuments({ agent: agentId }),
    QD.countDocuments({ agent: agentId, status: 'pending' }),
    Incentive.aggregate([
      { $match: { agent: agentId } },
      { $group: { _id: null, total_net: { $sum: '$net' }, total_gross: { $sum: '$gross' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      my_leads: myLeads,
      my_dispatched: myDispatched,
      my_calls: myCalls,
      pending_qds: myPendingQDs,
      total_earnings: myIncentives[0]?.total_net || 0,
    },
  });
};
