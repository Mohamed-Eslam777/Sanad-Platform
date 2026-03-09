const { sequelize, Request, User } = require('../models');
const { QueryTypes } = require('sequelize');
const { haversineSQLString } = require('../services/geoService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { notifyUser } = require('../ioInstance');

/**
 * @desc    Create a new assistance request (beneficiary only)
 * @route   POST /api/requests
 * @access  Private (beneficiary)
 */
const createRequest = async (req, res) => {
    try {
        const { type, description, location_lat, location_lng, location_address, scheduled_time } = req.body;

        const request = await Request.create({
            beneficiary_id: req.user.id,
            type,
            description,
            location_lat,
            location_lng,
            location_address,
            scheduled_time,
        });

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
 * NOTE: Geo-filtering is temporarily disabled for development/testing.
 *       All pending requests are returned. Haversine filtering will be
 *       re-enabled once real geolocation data is available.
 */
const getNearbyRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'beneficiary', attributes: ['id', 'full_name', 'profile_picture'] },
            ],
            order: [['created_at', 'DESC']],
        });

        return sendSuccess(res, 200, 'Pending requests.', requests);
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
 * @desc    Mark a request as completed (volunteer or beneficiary)
 * @route   PATCH /api/requests/:id/complete
 * @access  Private
 */
const completeRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        const isOwner =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isOwner) return sendError(res, 403, 'Not authorized to complete this request.');
        if (request.status !== 'accepted' && request.status !== 'in_progress') {
            return sendError(res, 400, 'Request cannot be completed at this stage.');
        }

        await request.update({ status: 'completed', completed_at: new Date() });

        // 🔔 Notify the other party about completion
        const otherId = req.user.id === request.beneficiary_id
            ? request.volunteer_id
            : request.beneficiary_id;
        if (otherId) {
            notifyUser(otherId, {
                type: 'request_completed',
                title: 'تم إكمال الطلب ✅',
                body: `تم إكمال الطلب #${request.id} بنجاح. يمكنك الآن ترك تقييم.`,
                requestId: request.id,
                link: `/requests/${request.id}`,
            });
        }

        return sendSuccess(res, 200, 'Request marked as completed. You can now leave a review.', request);
    } catch (error) {
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
                status: ['accepted', 'in_progress'],
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
 * @desc    Beneficiary cancels a pending request
 * @route   PATCH /api/requests/:id/cancel
 * @access  Private (beneficiary)
 *
 * Rules:
 *  - Only the beneficiary who created the request can cancel it.
 *  - Can only cancel while status is 'pending' (before a volunteer accepts).
 */
const cancelRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return sendError(res, 404, 'Request not found.');

        if (request.beneficiary_id !== req.user.id) {
            return sendError(res, 403, 'You are not authorised to cancel this request.');
        }
        if (request.status !== 'pending') {
            return sendError(res, 400, `Cannot cancel a request with status "${request.status}". Only pending requests can be cancelled.`);
        }

        await request.update({ status: 'cancelled' });
        return sendSuccess(res, 200, 'Request cancelled successfully.', request);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

module.exports = { createRequest, getMyRequests, getRequests, getNearbyRequests, getRequestById, acceptRequest, completeRequest, getMyAcceptedRequests, cancelRequest };
