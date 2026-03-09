const { Message, Request } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc    Get all messages for a request (chat thread)
 * @route   GET /api/messages/:requestId
 * @access  Private (participants only)
 */
const getMessages = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        // Ensure only the beneficiary or volunteer involved can read messages
        const isParticipant =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isParticipant) return sendError(res, 403, 'Not authorized to view these messages.');

        const messages = await Message.findAll({
            where: { request_id: req.params.requestId },
            order: [['created_at', 'ASC']],
        });

        return sendSuccess(res, 200, 'Messages retrieved.', messages);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Send a message within a request chat
 * @route   POST /api/messages/:requestId
 * @access  Private (participants only)
 */
const sendMessage = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        const isParticipant =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isParticipant) return sendError(res, 403, 'Not authorized to send messages here.');

        if (!['accepted', 'in_progress'].includes(request.status)) {
            return sendError(res, 400, 'Chat is only open for accepted or in-progress requests.');
        }

        const message = await Message.create({
            request_id: request.id,
            sender_id: req.user.id,
            content: req.body.content,
        });

        return sendSuccess(res, 201, 'Message sent.', message);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { getMessages, sendMessage };
