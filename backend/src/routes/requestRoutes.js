const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createRequestValidators, validate } = require('../utils/validators');
const {
    createRequest,
    getMyRequests,
    getRequests,
    getNearbyRequests,
    getRequestById,
    acceptRequest,
    requestCompletion,
    confirmCompletion,
    getMyAcceptedRequests,
    cancelRequest,
} = require('../controllers/requestController');

// ════════════════════════════════════════════════════════════════════════════════
//  IMPORTANT: ALL named/static routes MUST come BEFORE the dynamic /:id route.
//  Express matches routes top-to-bottom. If /:id is listed first, requests like
//  /nearby, /mine, /my-accepted will be caught by /:id.
// ════════════════════════════════════════════════════════════════════════════════

// ─── Static named routes (no /:id conflicts) ────────────────────────────────

// GET  /api/requests             → all pending requests
router.get('/', protect, getRequests);

// GET  /api/requests/nearby      → pending requests for volunteer (geo disabled for dev)
router.get('/nearby', protect, authorize('volunteer'), getNearbyRequests);

// GET  /api/requests/mine        → beneficiary's own requests
router.get('/mine', protect, authorize('beneficiary'), getMyRequests);

// GET  /api/requests/my-accepted → volunteer's active requests (accepted + in_progress)
router.get('/my-accepted', protect, authorize('volunteer'), getMyAcceptedRequests);

// POST /api/requests             → beneficiary creates a new request
router.post('/', protect, authorize('beneficiary'), createRequestValidators, validate, createRequest);

// ─── Dynamic parameterised routes (MUST be last) ────────────────────────────

// GET   /api/requests/:id          → single request details
router.get('/:id', protect, getRequestById);

// PATCH /api/requests/:id/accept   → volunteer accepts a pending request
router.patch('/:id/accept', protect, authorize('volunteer'), acceptRequest);

// Volunteer marks request as 'completion_requested'
router.patch('/:id/request-completion', protect, authorize('volunteer', 'admin'), requestCompletion);

// Beneficiary confirms completion and leaves a rating/review
router.post('/:id/confirm-completion', protect, authorize('beneficiary', 'admin'), confirmCompletion);

// PATCH /api/requests/:id/cancel   → beneficiary cancels a pending request
router.patch('/:id/cancel', protect, authorize('beneficiary'), cancelRequest);

module.exports = router;
