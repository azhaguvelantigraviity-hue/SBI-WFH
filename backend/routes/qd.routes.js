const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getQDs, getQDById, submitQD, updateQD, uploadDocs, downloadDoc } = require('../controllers/qd.controller');

router.use(protect);

router.get('/', getQDs);
router.get('/:id', getQDById);
router.post('/', submitQD);
router.patch('/:id', requireRole('admin'), updateQD);                          // admin dispatches/rejects
router.post('/:id/docs', upload.array('documents', 5), uploadDocs);           // sales uploads docs
router.get('/:id/docs/:docIndex/download', downloadDoc);                       // download a specific doc

module.exports = router;
