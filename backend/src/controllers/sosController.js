const nodemailer = require('nodemailer');
const { SOSAlert, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── SOS alert mail transport (lazy singleton) ─────────────────────────────────
let sosMailTransport = null;

const getSOSMailTransport = () => {
    if (sosMailTransport) return sosMailTransport;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMTP configuration is missing for SOS alerts.');
        }
        return null;
    }

    sosMailTransport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    return sosMailTransport;
};

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

        // Notify admins via email if SMTP + ADMIN_ALERT_EMAIL are configured
        try {
            const transport = getSOSMailTransport();
            const to = process.env.ADMIN_ALERT_EMAIL;

            if (transport && to) {
                await transport.sendMail({
                    from: process.env.SMTP_FROM || '"Sanad Alerts" <no-reply@sanad.app>',
                    to,
                    subject: '🚨 SOS Alert Triggered - Sanad',
                    html: `
                        <p>تم إطلاق نداء استغاثة (SOS) جديد في منصة <strong>سَنَد</strong>.</p>
                        <p><strong>المستخدم:</strong> ${req.user.full_name} (${req.user.email})</p>
                        <p><strong>الرسالة:</strong> ${message || 'بدون رسالة إضافية'}</p>
                        ${
                            latitude && longitude
                                ? `<p><strong>الموقع التقريبي:</strong> <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" rel="noopener noreferrer">عرض على الخرائط</a></p>`
                                : '<p><strong>الموقع:</strong> غير متوفر (لم تتم الموافقة على مشاركة الموقع)</p>'
                        }
                        <p>يمكنك عرض جميع نداءات الاستغاثة من خلال لوحة تحكم المشرف في سَنَد.</p>
                    `,
                });
            }
        } catch (mailError) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.error('[Sanad] Failed to send SOS email:', mailError.message);
            }
        }

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
