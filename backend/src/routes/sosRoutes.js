const express = require('express');
const router = express.Router();
const { triggerSOS, getSOSAlerts, resolveSOSAlert } = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// POST /api/sos — any authenticated user can trigger
router.post('/', protect, triggerSOS);

// GET /api/sos — admin only
router.get('/', protect, authorize('admin'), getSOSAlerts);

// PATCH /api/sos/:id/resolve — admin only
router.patch('/:id/resolve', protect, authorize('admin'), resolveSOSAlert);

module.exports = router;
