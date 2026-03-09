const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/messages/:requestId
router.get('/:requestId', protect, getMessages);

// POST /api/messages/:requestId
router.post('/:requestId', protect, sendMessage);

module.exports = router;
