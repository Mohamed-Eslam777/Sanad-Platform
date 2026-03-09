const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

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

module.exports = Review;
