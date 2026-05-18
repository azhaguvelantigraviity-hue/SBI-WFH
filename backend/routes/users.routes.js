const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller');

router.use(protect);

router.get('/', requireRole('admin'), getUsers);
router.get('/:id', requireRole('admin'), getUserById);
router.patch('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
