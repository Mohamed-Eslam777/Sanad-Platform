const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Request model — core entity of the Sanad platform.
 * Lifecycle: pending → accepted → in_progress → completed | cancelled.
 */
const Request = sequelize.define(
    'Request',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        beneficiary_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        volunteer_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true, // null until a volunteer accepts
        },
        type: {
            type: DataTypes.ENUM('transportation', 'reading', 'errand', 'other'),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completion_requested', 'completed', 'cancelled'),
            defaultValue: 'pending',
        },
        // Location where help is needed (used for geo-matching)
        location_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
        },
        location_lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
        },
        location_address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        price: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        scheduled_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'Requests',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Request;
