const { sendError } = require('../utils/responseHelper');

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin', 'volunteer')
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 403, `Access denied. Required role(s): ${roles.join(', ')}.`);
        }
        next();
    };
};

module.exports = { authorize };
