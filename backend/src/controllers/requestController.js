const { sequelize, Request, User, Review } = require('../models');
const { QueryTypes, Op } = require('sequelize');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { notifyUser, getIO } = require('../ioInstance');

/**
 * @desc    Create a new assistance request (beneficiary only)
 * @route   POST /api/requests
 * @access  Private (beneficiary)
 */
const createRequest = async (req, res) => {
    try {
        const { type, description, location_lat, location_lng, location_address, scheduled_time, price } = req.body;

        const request = await Request.create({
            beneficiary_id: req.user.id,
            type,
            description,
            location_lat,
            location_lng,
            location_address,
            price,
            scheduled_time,
        });

        const io = getIO();
        if (io) {
            io.to('volunteers').emit('new_request_available', {
                message: 'A new request is available near you.',
                request_id: request.id,
            });
        }

        return sendSuccess(res, 201, 'Request created successfully.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Get the logged-in beneficiary's own requests
 * @route   GET /api/requests/mine
 * @access  Private (beneficiary)
 */
const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { beneficiary_id: req.user.id },
            include: [{ model: User, as: 'volunteer', attributes: ['id', 'full_name'] }],
            order: [['created_at', 'DESC']],
        });
        return sendSuccess(res, 200, 'Your requests.', requests);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Get all pending requests (for volunteers to browse)
 * @route   GET /api/requests
 * @access  Private
 */
const getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'pending' },
            include: [{ model: User, as: 'beneficiary', attributes: ['id', 'full_name', 'profile_picture'] }],
            order: [['created_at', 'DESC']],
        });
        return sendSuccess(res, 200, 'Pending requests.', requests);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc  Get nearby pending requests for volunteers.
 * @route GET /api/requests/nearby
 * @access Private (volunteer)
 *
 * Query params:
 *  - lat, lng : volunteer coordinates (required for geo filter)
 *  - radius   : radius in KM (default 5)
 *
 * If lat/lng are missing or invalid, falls back to returning all pending
 * requests ordered by created_at DESC (same as getRequests).
 */
const getNearbyRequests = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        const parsedLat = lat != null ? parseFloat(lat) : null;
        const parsedLng = lng != null ? parseFloat(lng) : null;
        const parsedRadius = radius != null ? parseFloat(radius) : 5;

        const hasValidCoords =
            typeof parsedLat === 'number' &&
            !Number.isNaN(parsedLat) &&
            typeof parsedLng === 'number' &&
            !Number.isNaN(parsedLng);

        // Fallback: no coordinates → behave like generic pending list
        if (!hasValidCoords) {
            const fallback = await Request.findAll({
                where: { status: 'pending' },
                include: [
                    {
                        model: User,
                        as: 'beneficiary',
                        attributes: ['id', 'full_name', 'profile_picture'],
                    },
                ],
                order: [['created_at', 'DESC']],
            });

            return sendSuccess(res, 200, 'Pending requests (no geo filter applied).', fallback);
        }

        // Geo-filtered query using Haversine distance in SQL
        const distanceExpr = `
            6371 * acos(
                cos(radians(:lat)) * cos(radians(r.location_lat)) *
                cos(radians(r.location_lng) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(r.location_lat))
            )
        `;
        const sql = `
            SELECT
                r.*,
                (${distanceExpr}) AS distance_km
            FROM Requests r
            WHERE
                r.status = 'pending'
                AND r.location_lat IS NOT NULL
                AND r.location_lng IS NOT NULL
            HAVING distance_km <= :radius
            ORDER BY distance_km ASC, r.created_at DESC
        `;

        const rows = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            replacements: {
                lat: parsedLat,
                lng: parsedLng,
                radius: parsedRadius,
            },
        });

        // Manually hydrate beneficiary relation for consistency with other endpoints
        const requestIds = rows.map((r) => r.id);
        let enriched = [];

        if (requestIds.length > 0) {
            enriched = await Request.findAll({
                where: { id: requestIds },
                include: [
                    {
                        model: User,
                        as: 'beneficiary',
                        attributes: ['id', 'full_name', 'profile_picture'],
                    },
                ],
            });

            // Attach distance_km onto each instance's dataValues for frontend usage
            const distanceById = rows.reduce((acc, row) => {
                acc[row.id] = row.distance_km;
                return acc;
            }, {});

            enriched.forEach((reqInstance) => {
                const id = reqInstance.id;
                if (distanceById[id] != null) {
                    // eslint-disable-next-line no-param-reassign
                    reqInstance.dataValues.distance_km = Number(distanceById[id]);
                }
            });
        }

        return sendSuccess(res, 200, 'Nearby pending requests within radius.', enriched);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Get a single request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
const getRequestById = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id, {
            include: [
                { model: User, as: 'beneficiary', attributes: ['id', 'full_name', 'profile_picture'] },
                { model: User, as: 'volunteer', attributes: ['id', 'full_name', 'profile_picture'] },
            ],
        });
        if (!request) return sendError(res, 404, 'Request not found.');

        const isOwner = request.beneficiary_id === req.user.id;
        const isAssignedVolunteer = request.volunteer_id === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAssignedVolunteer && !isAdmin) {
            return sendError(res, 403, 'Not authorized to view this request.');
        }

        return sendSuccess(res, 200, 'Request details.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Volunteer accepts a pending request
 * @route   PATCH /api/requests/:id/accept
 * @access  Private (volunteer)
 */
const acceptRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');
        if (request.status !== 'pending') return sendError(res, 400, 'This request is no longer available.');

        await request.update({ volunteer_id: req.user.id, status: 'accepted' });

        // 🔔 Notify the beneficiary that their request was accepted
        notifyUser(request.beneficiary_id, {
            type: 'request_accepted',
            title: 'تم قبول طلبك! 🎉',
            body: `قام ${req.user.full_name} بقبول طلبك. يمكنكما الآن التواصل عبر الدردشة.`,
            requestId: request.id,
            link: `/requests/${request.id}`,
        });

        return sendSuccess(res, 200, 'Request accepted. Chat is now open.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Volunteer starts the task (updates status from accepted to in_progress)
 * @route   PATCH /api/requests/:id/start
 * @access  Private (Volunteer)
 */
const startRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        // Only the assigned volunteer can start it
        if (req.user.id !== request.volunteer_id) {
            return sendError(res, 403, 'Not authorized. Only the assigned volunteer can start this request.');
        }

        if (request.status !== 'accepted') {
            return sendError(res, 400, 'Request must be accepted before it can be started.');
        }

        await request.update({ status: 'in_progress' });

        // 🔔 Notify Beneficiary
        notifyUser(request.beneficiary_id, {
            type: 'request_started',
            title: 'بدء التنفيذ! 🚀',
            body: `لقد بدأ المتطوع ${req.user.full_name} في تنفيذ طلبك (قيد التنفيذ الآن).`,
            requestId: request.id,
            link: `/requests/${request.id}`,
        });

        return sendSuccess(res, 200, 'Request status updated to in_progress.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Volunteer requests that the task be marked as completed.
 * @route   PATCH /api/requests/:id/request-completion
 * @access  Private (Volunteer)
 */
const requestCompletion = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        // Only the assigned volunteer can request completion
        if (req.user.id !== request.volunteer_id) {
            return sendError(res, 403, 'Not authorized. Only the assigned volunteer can request completion.');
        }

        if (request.status !== 'accepted' && request.status !== 'in_progress') {
            return sendError(res, 400, 'Cannot request completion at this current stage.');
        }

        await request.update({ status: 'completion_requested' });

        // 🔔 Notify Beneficiary
        notifyUser(request.beneficiary_id, {
            type: 'completion_requested',
            title: 'طلب إتمام المهمة 🔔',
            body: `لقد أشار ${req.user.full_name} إلى إخلاء مسؤوليته وإتمام الطلب. يرجى تأكيد العملية وتقييم المتطوع.`,
            requestId: request.id,
            link: `/requests/${request.id}`,
        });

        return sendSuccess(res, 200, 'Completion requested successfully. Awaiting beneficiary confirmation.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Beneficiary confirms completion, rates volunteer, and finalizes request.
 * @route   POST /api/requests/:id/confirm-completion
 * @access  Private (Beneficiary)
 */
const confirmCompletion = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            await t.rollback();
            return sendError(res, 400, 'Please provide a valid rating between 1 and 5.');
        }

        const request = await Request.findByPk(req.params.id, { transaction: t });
        if (!request) {
            await t.rollback();
            return sendError(res, 404, 'Request not found.');
        }

        // Only the beneficiary who made the request can confirm it
        if (req.user.id !== request.beneficiary_id) {
            await t.rollback();
            return sendError(res, 403, 'Not authorized. Only the beneficiary can confirm completion.');
        }

        if (request.status !== 'completion_requested') {
            await t.rollback();
            return sendError(res, 400, 'Request is not pending completion confirmation.');
        }

        // 1. Mark request as completed
        await request.update({ status: 'completed', completed_at: new Date() }, { transaction: t });

        // 2. Create Review
        await Review.create({
            request_id: request.id,
            reviewer_id: req.user.id,
            reviewed_id: request.volunteer_id,
            rating,
            comment
        }, { transaction: t });

        // 3. Rating update is handled automatically by Review.afterSave hook
        //    which recalculates average_rating and total_reviews in VolunteerProfile.

        await t.commit();

        // 🔔 Notify Volunteer
        notifyUser(request.volunteer_id, {
            type: 'request_completed',
            title: 'تم تأكيد الإتمام! ⭐',
            body: `لقد أكد المستفيد إنهاء الطلب بنجاح ومنحك تقييماً ${rating}/5! شكراً لجهودك.`,
            requestId: request.id,
            link: `/requests/${request.id}`,
        });

        return sendSuccess(res, 200, 'Request successfully completed and reviewed.', request);
    } catch (error) {
        await t.rollback();
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Volunteer fetches their accepted / in-progress requests
 * @route   GET /api/requests/my-accepted
 * @access  Private (volunteer)
 */
const getMyAcceptedRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: {
                volunteer_id: req.user.id,
                status: {
                    [Op.in]: ['accepted', 'in_progress'],
                },
            },
            include: [
                { model: User, as: 'beneficiary', attributes: ['id', 'full_name', 'profile_picture'] },
            ],
            order: [['created_at', 'DESC']],
        });
        return sendSuccess(res, 200, 'Your accepted requests.', requests);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Beneficiary cancels an active request
 * @route   PATCH /api/requests/:id/cancel
 * @access  Private (beneficiary)
 */
const cancelRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        if (request.beneficiary_id !== req.user.id) {
            return sendError(res, 403, 'You are not authorised to cancel this request.');
        }
        
        const allowedStatuses = ['pending', 'accepted', 'in_progress'];
        if (!allowedStatuses.includes(request.status)) {
            return sendError(res, 400, `Cannot cancel a request with status "${request.status}". Only active requests can be cancelled.`);
        }

        await request.update({ status: 'cancelled' });

        // 🔔 Notify Volunteer if assigned
        if (request.volunteer_id) {
            notifyUser(request.volunteer_id, {
                type: 'request_cancelled',
                title: 'تم إلغاء الطلب ❌',
                body: `قام المستفيد بإلغاء الطلب الذي قمت بقبوله.`,
                requestId: request.id,
                link: `/requests/${request.id}`,
            });
        }

        return sendSuccess(res, 200, 'Request cancelled successfully.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Volunteer aborts an accepted/in_progress request
 * @route   PATCH /api/requests/:id/abort
 * @access  Private (volunteer)
 */
const abortRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        if (request.volunteer_id !== req.user.id) {
            return sendError(res, 403, 'You are not authorised to abort this request.');
        }

        const allowedStatuses = ['accepted', 'in_progress'];
        if (!allowedStatuses.includes(request.status)) {
            return sendError(res, 400, `Cannot abort a request with status "${request.status}".`);
        }

        await request.update({ status: 'pending', volunteer_id: null });

        // 🔔 Notify Beneficiary
        notifyUser(request.beneficiary_id, {
            type: 'request_aborted',
            title: 'انسحب المتطوع',
            body: 'انسحب المتطوع من الطلب، وتمت إعادته لقائمة الانتظار.',
            requestId: request.id,
            link: `/requests/${request.id}`,
        });

        return sendSuccess(res, 200, 'Request aborted successfully. It is now pending another volunteer.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

module.exports = { createRequest, getMyRequests, getRequests, getNearbyRequests, getRequestById, acceptRequest, startRequest, requestCompletion, confirmCompletion, getMyAcceptedRequests, cancelRequest, abortRequest };
