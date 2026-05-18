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
} = require('../controllers/leads.controller');

router.use(protect);

router.get('/', getLeads);                                           // admin + sales
router.get('/:id', getLeadById);                                     // admin + sales
router.post('/', createLead);                                         // admin + sales
router.post('/bulk-import', requireRole('admin'), bulkImport);       // admin only
router.patch('/:id', updateLead);                                    // admin + sales
router.delete('/:id', requireRole('admin'), deleteLead);             // admin only

module.exports = router;
