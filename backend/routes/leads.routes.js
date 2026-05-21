const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  bulkImport,
  bulkAssign,
  requestLeads,
} = require('../controllers/leads.controller');

router.use(protect);

router.get('/', getLeads);                                           // admin + sales
router.post('/request', requireRole('sales_person'), requestLeads);  // sales only — MUST be before /:id routes
router.post('/bulk-import', requireRole('admin'), bulkImport);       // admin only
router.post('/bulk-assign', requireRole('admin'), bulkAssign);       // admin only
router.get('/:id', getLeadById);                                     // admin + sales
router.post('/', createLead);                                        // admin + sales
router.patch('/:id', updateLead);                                    // admin + sales
router.delete('/:id', requireRole('admin'), deleteLead);             // admin only

module.exports = router;
