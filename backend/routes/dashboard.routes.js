const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getStats, getAgentStats } = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/stats', requireRole('admin'), getStats);
router.get('/agent-stats', requireRole('sales_person'), getAgentStats);

module.exports = router;
