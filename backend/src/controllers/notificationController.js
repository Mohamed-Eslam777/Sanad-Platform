'use strict';

const { Notification } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const LIMIT = 50; // Max notifications returned — no pagination needed for MVP

/**
 * @desc    Get the current user's notification history (newest first)
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
            limit: LIMIT,
        });
        return sendSuccess(res, 200, 'Notifications fetched.', notifications);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!notif) return sendError(res, 404, 'Notification not found.');

        await notif.update({ is_read: true });
        return sendSuccess(res, 200, 'Marked as read.', { id: notif.id });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Mark all of the current user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );
        return sendSuccess(res, 200, 'All notifications marked as read.');
    } catch (error) {
        return sendError(res, 500, error);
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
