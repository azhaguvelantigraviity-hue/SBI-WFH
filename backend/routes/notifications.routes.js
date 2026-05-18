const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
} = require('../controllers/notifications.controller');

router.use(protect);

router.get('/', getNotifications);
router.patch('/mark-read', markAsRead);

module.exports = router;
