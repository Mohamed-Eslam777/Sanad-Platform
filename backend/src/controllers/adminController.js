const { Op } = require('sequelize');
const { User, BeneficiaryProfile, VolunteerProfile, Request, SOSAlert, Message } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { getIo } = require('../socketHandler');

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
            verification_status,
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

        // Filter by verification status
        if (verification_status && ['unverified', 'pending', 'verified', 'rejected'].includes(verification_status)) {
            where.verification_status = verification_status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expires'] },
            include: [
                { model: BeneficiaryProfile, as: 'beneficiaryProfile' },
                { model: VolunteerProfile, as: 'volunteerProfile', attributes: { exclude: ['national_id'] } }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            distinct: true, // Required when pagination is used with include
        });

        const { Request, Review } = require('../models');
        const usersWithCounts = await Promise.all(rows.map(async (u) => {
            const userJson = u.toJSON();
            if (userJson.role === 'volunteer' && userJson.volunteerProfile) {
                const [completedCount, activeCount, totalReviews] = await Promise.all([
                    Request.count({ where: { volunteer_id: userJson.id, status: 'completed' } }),
                    Request.count({ where: { volunteer_id: userJson.id, status: ['accepted', 'in_progress', 'completion_requested'] } }),
                    Review.count({ where: { reviewed_id: userJson.id } })
                ]);
                userJson.volunteerProfile.completed_requests = completedCount;
                userJson.volunteerProfile.active_tasks = activeCount;
                userJson.volunteerProfile.total_reviews = totalReviews;
            }
            return userJson;
        }));

        return sendSuccess(res, 200, 'Users retrieved.', {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            users: usersWithCounts,
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
        // Use the global imports

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

/**
 * @desc  Review a user's identity verification submission (accept/reject)
 * @route PATCH /api/users/:id/verify
 * @access Private (admin only)
 * 
 * Body: { action: 'accept' | 'reject', notes?: 'Optional reasoning' }
 */
const reviewIdentityVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        
        if (!['accept', 'reject'].includes(action)) {
            return sendError(res, 400, 'Action must be "accept" or "reject".');
        }

        const user = await User.findByPk(id);
        if (!user) return sendError(res, 404, 'User not found.');

        if (user.verification_status !== 'pending') {
            return sendError(res, 400, `User verification status is ${user.verification_status}, cannot review.`);
        }

        const newStatus = action === 'accept' ? 'verified' : 'rejected';
        await user.update({ verification_status: newStatus });

        // Notify user via Socket.io
        const io = getIo();
        if (io) {
            io.to(user.id.toString()).emit('new_notification', {
                title: 'تحديث حالة التوثيق',
                message: action === 'accept' ? 'تهانينا! تم توثيق حسابك بنجاح.' : 'نأسف، تم رفض طلب توثيق حسابك. يرجى المحاولة مرة أخرى.',
                type: action === 'accept' ? 'success' : 'error',
                link: '/profile'
            });
        }

        return sendSuccess(res, 200, `User identity ${newStatus}.`, {
            id: user.id,
            verification_status: user.verification_status
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc  Get all requests for the admin dashboard (with pagination & search)
 * @route GET /api/admin/requests
 * @access Private (admin only)
 */
const getAllRequestsAdmin = async (req, res) => {
    try {
        const { search = '', status, type, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status && ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
            where.status = status;
        }

        if (type && ['medical', 'financial', 'logistical'].includes(type)) {
            where.type = type;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Request.findAndCountAll({
            where,
            include: [
                { model: User, as: 'beneficiary', attributes: ['id', 'full_name', 'email', 'profile_picture'] },
                { model: User, as: 'volunteer', attributes: ['id', 'full_name', 'email', 'profile_picture'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            distinct: true,
        });

        // Search in memory for now if search exists (or we can use advanced Sequelize Op.or on includes)
        // For simplicity, we filter the rows if search string is provided
        let filteredRows = rows;
        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            filteredRows = rows.filter(r => 
                (r.beneficiary && r.beneficiary.full_name.toLowerCase().includes(lowerSearch)) ||
                (r.volunteer && r.volunteer.full_name.toLowerCase().includes(lowerSearch)) ||
                (r.description && r.description.toLowerCase().includes(lowerSearch))
            );
        }

        return sendSuccess(res, 200, 'Requests retrieved.', {
            total: search.trim() ? filteredRows.length : count,
            page: parseInt(page),
            totalPages: Math.ceil((search.trim() ? filteredRows.length : count) / parseInt(limit)),
            requests: filteredRows,
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc  Get all messages for a specific request (Admin Chat Oversight)
 * @route GET /api/admin/requests/:requestId/messages
 * @access Private (admin only)
 */
const getAdminRequestMessages = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await Request.findByPk(requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        const messages = await Message.findAll({
            where: { request_id: requestId },
            order: [['created_at', 'ASC']],
        });

        // Get sender details manually to attach names
        const userIds = [...new Set(messages.map(m => m.sender_id))];
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'full_name', 'role', 'profile_picture'],
        });

        const userMap = users.reduce((acc, u) => {
            acc[u.id] = { full_name: u.full_name, role: u.role };
            return acc;
        }, {});

        const enrichedMessages = messages.map(m => ({
            ...m.toJSON(),
            senderName: userMap[m.sender_id]?.full_name || 'مستخدم غير معروف',
            senderRole: userMap[m.sender_id]?.role || 'غير محدد'
        }));

        return sendSuccess(res, 200, 'Messages retrieved for oversight.', enrichedMessages);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { 
    getAllUsers, 
    updateUserStatus, 
    getStats, 
    reviewIdentityVerification,
    getAllRequestsAdmin,
    getAdminRequestMessages
};
