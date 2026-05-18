const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  register,
  getMe,
  changePassword,
  loginValidation,
  registerValidation,
} = require('../controllers/auth.controller');

router.post('/login', loginValidation, login);
router.post('/register', protect, registerValidation, register); // admin only — checked in controller
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
