const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHelper');
const { User } = require('../models');

/**
 * Verifies the JWT token from the Authorization header.
 * Attaches the decoded user payload to `req.user`.
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Not authorized. No token provided.');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data and check status
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] },
        });

        if (!user) {
            return sendError(res, 401, 'User no longer exists.');
        }

        if (user.status === 'flagged' || user.status === 'suspended') {
            return sendError(res, 403, 'Your account has been flagged or suspended.');
        }

        req.user = user;
        next();
    } catch (error) {
        return sendError(res, 401, 'Invalid or expired token.');
    }
};

module.exports = { protect };
