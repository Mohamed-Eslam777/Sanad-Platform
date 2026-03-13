const { Op } = require('sequelize');
const { User, BeneficiaryProfile, VolunteerProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc  List all users with optional name/role/status filters + search
 * @route GET /api/users?search=&role=&status=&page=&limit=
 * @access Private (admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        const {
            search = '',
            role,
            status,
            page = 1,
            limit = 20,
        } = req.query;

        const where = {};

        // Search by name or email
        if (search.trim()) {
            where[Op.or] = [
                { full_name: { [Op.like]: `%${search.trim()}%` } },
                { email: { [Op.like]: `%${search.trim()}%` } },
            ];
        }

        // Filter by role
        if (role && ['beneficiary', 'volunteer', 'admin'].includes(role)) {
            where.role = role;
        }

        // Filter by status
        if (status && ['active', 'flagged', 'suspended'].includes(status)) {
            where.status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expires'] },
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
        });

        return sendSuccess(res, 200, 'Users retrieved.', {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            users: rows,
        });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc  Update a user's account status (active / flagged / suspended)
 * @route PATCH /api/users/:id/status
 * @access Private (admin only)
 *
 * Body: { status: 'active' | 'flagged' | 'suspended' }
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ALLOWED = ['active', 'flagged', 'suspended'];
        if (!status || !ALLOWED.includes(status)) {
            return sendError(res, 400, `Invalid status. Must be one of: ${ALLOWED.join(', ')}.`);
        }

        const user = await User.findByPk(id);
        if (!user) return sendError(res, 404, 'User not found.');

        // Prevent admin from suspending themselves
        if (user.id === req.user.id) {
            return sendError(res, 400, 'Admins cannot change their own account status.');
        }

        // Prevent demoting another admin
        if (user.role === 'admin') {
            return sendError(res, 403, 'Cannot change status of another admin account.');
        }

        await user.update({ status });

        return sendSuccess(res, 200, `User status updated to "${status}".`, {
            id: user.id,
            name: user.full_name,
            email: user.email,
            status: user.status,
        });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc  Get platform-wide statistics for admin overview
 * @route GET /api/users/stats
 * @access Private (admin only)
 */
const getStats = async (req, res) => {
    try {
        // Use the same model imports already at the top
        const { Request, SOSAlert } = require('../models');

        // User counts by role
        const totalUsers = await User.count();
        const totalBeneficiary = await User.count({ where: { role: 'beneficiary' } });
        const totalVolunteer = await User.count({ where: { role: 'volunteer' } });
        const totalAdmins = await User.count({ where: { role: 'admin' } });

        // Request counts by status
        const totalRequests = await Request.count();
        const pendingReqs = await Request.count({ where: { status: 'pending' } });
        const acceptedReqs = await Request.count({ where: { status: 'accepted' } });
        const inProgressReqs = await Request.count({ where: { status: 'in_progress' } });
        const completedReqs = await Request.count({ where: { status: 'completed' } });
        const cancelledReqs = await Request.count({ where: { status: 'cancelled' } });

        // SOS counts
        let activeSOS = 0, resolvedSOS = 0;
        try {
            activeSOS = await SOSAlert.count({ where: { status: 'active' } });
            resolvedSOS = await SOSAlert.count({ where: { status: 'resolved' } });
        } catch { /* SOS table might not exist yet */ }

        // Recent users (last 5)
        const recentUsers = await User.findAll({
            attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        // Recent requests (last 5)
        const recentRequests = await Request.findAll({
            attributes: ['id', 'description', 'status', 'type', 'created_at'],
            include: [{ model: User, as: 'beneficiary', attributes: ['full_name'] }],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        return sendSuccess(res, 200, 'Platform stats.', {
            users: { total: totalUsers, beneficiary: totalBeneficiary, volunteer: totalVolunteer, admin: totalAdmins },
            requests: { total: totalRequests, pending: pendingReqs, accepted: acceptedReqs, in_progress: inProgressReqs, completed: completedReqs, cancelled: cancelledReqs },
            sos: { active: activeSOS, resolved: resolvedSOS },
            recentUsers,
            recentRequests,
        });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

module.exports = { getAllUsers, updateUserStatus, getStats };
