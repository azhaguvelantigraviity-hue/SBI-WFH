const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getIncentives, generateIncentives, markPaid } = require('../controllers/incentives.controller');

router.use(protect);

router.get('/', getIncentives);
router.post('/generate', requireRole('admin'), generateIncentives);
router.patch('/:id/pay', requireRole('admin'), markPaid);

module.exports = router;
