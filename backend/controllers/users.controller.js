const User = require('../models/User');
const Lead = require('../models/Lead');

// ─── @GET /api/users ─────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const { status, role, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employee_id: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  // Attach lead counts
  const userIds = users.map(u => u._id);
  const leadCounts = await Lead.aggregate([
    { $match: { assigned_to: { $in: userIds } } },
    { $group: { _id: '$assigned_to', total: { $sum: 1 }, dispatched: { $sum: { $cond: [{ $eq: ['$status', 'dispatched'] }, 1, 0] } } } },
  ]);

  const countMap = {};
  leadCounts.forEach(lc => {
    countMap[lc._id.toString()] = { total: lc.total, dispatched: lc.dispatched };
  });

  const result = users.map(u => ({
    ...u.toObject(),
    leads: countMap[u._id.toString()]?.total || 0,
    dispatched: countMap[u._id.toString()]?.dispatched || 0,
  }));

  res.json({ success: true, count: result.length, data: result });
};

// ─── @GET /api/users/:id ─────────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
};

// ─── @PATCH /api/users/:id ───────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const allowedFields = ['name', 'mobile', 'status', 'avatar', 'employee_id', 'email', 'role', 'password'];
  
  allowedFields.forEach(f => {
    if (req.body[f] !== undefined) {
      user[f] = req.body[f];
    }
  });

  await user.save();

  res.json({ success: true, data: user });
};

// ─── @DELETE /api/users/:id ──────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Unassign all leads
  await Lead.updateMany(
    { assigned_to: req.params.id },
    { $set: { assigned_to: null, status: 'new' } }
  );

  await user.deleteOne();

  res.json({ success: true, message: 'User deleted and leads unassigned' });
};
