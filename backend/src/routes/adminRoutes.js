const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const { getStats, getAllRequestsAdmin, getAdminRequestMessages } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

// Cache admin stats for 60 seconds (heavy aggregation query)
router.get('/stats', cacheMiddleware(60), getStats);
router.get('/requests', getAllRequestsAdmin);
router.get('/requests/:requestId/messages', getAdminRequestMessages);

module.exports = router;
