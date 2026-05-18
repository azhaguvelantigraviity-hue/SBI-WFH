const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// ─── Validation Rules ─────────────────────────────────────────────────────────
exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.registerValidation = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
  body('role').optional().isIn(['admin', 'sales_person']).withMessage('Invalid role'),
];

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ success: false, message, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Account suspended. Contact administrator.' });
  }

  // Update last login
  user.last_login = new Date();
  await user.save();

  const token = user.generateToken();

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
      mobile: user.mobile,
      status: user.status,
    },
  });
};

// ─── @POST /api/auth/register (admin only) ───────────────────────────────────
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ success: false, message, errors: errors.array() });
  }

  const { employee_id, name, email, password, mobile, role } = req.body;

  const user = await User.create({ employee_id, name, email, password, mobile, role });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
    },
  });
};

// ─── @GET /api/auth/me ───────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── @PUT /api/auth/change-password ─────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
};
