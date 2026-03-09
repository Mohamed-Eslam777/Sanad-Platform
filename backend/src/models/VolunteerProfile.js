const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * VolunteerProfile — extended info for users with role='volunteer'.
 * includes verification status (National ID), rating, and geolocation
 * used for the 5km radius matching algorithm.
 */
const VolunteerProfile = sequelize.define(
    'VolunteerProfile',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
        },
        national_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Required for identity verification.',
        },
        is_id_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        skills: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Comma-separated or JSON array of volunteer skills.',
        },
        average_rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0.0,
        },
        total_reviews: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        // Geolocation for the 5km radius matching
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: 'Volunteer_Profiles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = VolunteerProfile;
