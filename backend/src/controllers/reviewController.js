const { Review, Request, VolunteerProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc    Submit a review for a completed request (beneficiary only)
 * @route   POST /api/reviews
 * @access  Private (beneficiary)
 */
const createReview = async (req, res) => {
    try {
        const { request_id, rating, comment } = req.body;

        const request = await Request.findByPk(request_id);
        if (!request) return sendError(res, 404, 'Request not found.');
        if (request.status !== 'completed') return sendError(res, 400, 'Reviews are only enabled for completed requests.');
        if (request.beneficiary_id !== req.user.id) return sendError(res, 403, 'Only the beneficiary can leave a review.');

        const existing = await Review.findOne({ where: { request_id } });
        if (existing) return sendError(res, 409, 'A review for this request already exists.');

        const review = await Review.create({
            request_id,
            reviewer_id: req.user.id,
            reviewed_id: request.volunteer_id,
            rating,
            comment,
        });

        // Rating recalculation is handled automatically by Review.afterSave hook

        return sendSuccess(res, 201, 'Review submitted successfully.', review);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { createReview };
