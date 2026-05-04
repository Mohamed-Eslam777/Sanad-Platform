'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(protect);

// GET  /api/notifications          — fetch history (last 50, newest first)
router.get('/', getNotifications);

// PATCH /api/notifications/read-all — must be BEFORE /:id/read to avoid route conflict
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch('/:id/read', markAsRead);

module.exports = router;
