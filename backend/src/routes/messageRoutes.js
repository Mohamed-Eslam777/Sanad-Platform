const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, upload, uploadAttachment } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/messages/:requestId
router.get('/:requestId', protect, getMessages);

// POST /api/messages/:requestId
router.post('/:requestId', protect, sendMessage);

// POST /api/messages/upload/:requestId
router.post('/upload/:requestId', protect, upload.single('attachment'), uploadAttachment);

module.exports = router;
