const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * SOSAlert model — safety feature.
 * Triggered by the SOS button; records the alert and notifies admins/emergency contacts.
 */
const SOSAlert = sequelize.define(
    'SOSAlert',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'The user (usually beneficiary) who triggered the SOS.',
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Optional message attached to the SOS alert.',
        },
        status: {
            type: DataTypes.ENUM('active', 'resolved'),
            defaultValue: 'active',
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'SOS_Alerts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = SOSAlert;
