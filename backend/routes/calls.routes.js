const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCalls, logCall, getCallStats } = require('../controllers/calls.controller');

router.use(protect);

router.get('/', getCalls);
router.get('/stats', getCallStats);
router.post('/', logCall);

module.exports = router;
