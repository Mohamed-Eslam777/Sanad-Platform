const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAllUsers, updateUserStatus, getStats } = require('../controllers/adminController');
const { getUserProfile, getMyProfile, updateProfile } = require('../controllers/userController');

// ════════════════════════════════════════════════════════════════════════════════
//  IMPORTANT: ALL named/static routes MUST come BEFORE the dynamic /:id route.
//  Express matches routes top-to-bottom. If /:id is listed first, requests like
//  /me, /stats will be caught by /:id with id="me" or id="stats".
// ════════════════════════════════════════════════════════════════════════════════

// ─── Static named routes (no /:id conflicts) ────────────────────────────────

// GET  /api/users/me      → authenticated user's own profile
router.get('/me', protect, getMyProfile);

// PUT  /api/users/me      → update own profile
router.put('/me', protect, updateProfile);

// GET  /api/users/stats   → admin analytics dashboard data
router.get('/stats', protect, authorize('admin'), getStats);

// GET  /api/users         → admin: list all users (search/filter/pagination)
router.get('/', protect, authorize('admin'), getAllUsers);

// ─── Dynamic parameterised routes (MUST be last) ────────────────────────────

// PATCH /api/users/:id/status  → admin: change user status
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

// GET   /api/users/:id         → view any user's profile
router.get('/:id', protect, getUserProfile);

module.exports = router;
