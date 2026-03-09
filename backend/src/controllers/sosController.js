const { SOSAlert, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc    Trigger an SOS alert
 * @route   POST /api/sos
 * @access  Private
 */
const triggerSOS = async (req, res) => {
    try {
        const { latitude, longitude, message } = req.body;

        const alert = await SOSAlert.create({
            user_id: req.user.id,
            latitude,
            longitude,
            message,
        });

        // TODO: Notify admins/emergency contacts via email/SMS/push notification service

        return sendSuccess(res, 201, '🚨 SOS alert has been triggered. Help is on the way.', alert);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get all active SOS alerts (admin only)
 * @route   GET /api/sos
 * @access  Private (admin)
 */
const getSOSAlerts = async (req, res) => {
    try {
        const alerts = await SOSAlert.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'profile_picture'],
            }],
            order: [['created_at', 'DESC']],
        });
        return sendSuccess(res, 200, 'All SOS alerts.', alerts);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Resolve an SOS alert (admin only)
 * @route   PATCH /api/sos/:id/resolve
 * @access  Private (admin)
 */
const resolveSOSAlert = async (req, res) => {
    try {
        const alert = await SOSAlert.findByPk(req.params.id);
        if (!alert) return sendError(res, 404, 'SOS alert not found.');
        if (alert.status === 'resolved') return sendError(res, 400, 'Alert is already resolved.');

        await alert.update({ status: 'resolved', resolved_at: new Date() });
        return sendSuccess(res, 200, 'SOS alert resolved.', alert);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { triggerSOS, getSOSAlerts, resolveSOSAlert };
