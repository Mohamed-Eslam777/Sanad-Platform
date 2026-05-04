const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

/**
 * Review model — beneficiary reviews volunteer after request completion.
 * Only enabled when request status = 'completed'.
 */
const Review = sequelize.define(
    'Review',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        request_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true, // one review per completed request
        },
        reviewer_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'Beneficiary who wrote the review.',
        },
        reviewed_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'Volunteer being reviewed.',
        },
        rating: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'Reviews',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

/**
 * Hook to recalculate the volunteer's average rating and total reviews.
 */
const recalculateVolunteerRating = async (review, options) => {
    try {
        logger.info(`[Sanad] Hook Triggered: recalculateVolunteerRating for reviewed_id: ${review.reviewed_id}`);
        const VolunteerProfile = sequelize.models.VolunteerProfile;
        if (!VolunteerProfile) {
            logger.warn('[Sanad] Hook Warning: VolunteerProfile model not found in sequelize.models!');
            return;
        }

        // Calculate new average and count directly in the DB
        const result = await Review.findOne({
            where: { reviewed_id: review.reviewed_id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'newAverage'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'newTotal'],
            ],
            raw: true,
            transaction: options.transaction,
        });

        const newAverage = result?.newAverage ? parseFloat(result.newAverage).toFixed(2) : 0.00;
        const newTotal = result?.newTotal ? parseInt(result.newTotal, 10) : 0;
        
        logger.info(`[Sanad] Hook Calc: user ${review.reviewed_id} -> newAvg: ${newAverage}, newTotal: ${newTotal}`);

        await VolunteerProfile.update(
            { average_rating: newAverage, total_reviews: newTotal },
            { 
                where: { user_id: review.reviewed_id },
                transaction: options.transaction
            }
        );
        logger.info('[Sanad] Hook Success: VolunteerProfile updated.');
    } catch (err) {
        logger.error(`[Sanad] Hook Error: Failed to recalculate volunteer rating: ${err.message}`);
    }
};

Review.afterSave(recalculateVolunteerRating);
Review.afterDestroy(recalculateVolunteerRating);

module.exports = Review;
