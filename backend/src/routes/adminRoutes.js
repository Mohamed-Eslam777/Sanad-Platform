const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getStats, getAllRequestsAdmin, getAdminRequestMessages } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/requests', getAllRequestsAdmin);
router.get('/requests/:requestId/messages', getAdminRequestMessages);

module.exports = router;
