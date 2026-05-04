'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Notification — Persistent record of every in-app notification.
 *
 * Created by notifyUser() in ioInstance.js before broadcasting via Socket.io.
 * Exposed via GET /api/notifications for initial history load on app open.
 */
const Notification = sequelize.define(
    'Notification',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'Recipient user ID.',
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'e.g. request_accepted, request_completed, new_message, kyc_accepted, kyc_rejected',
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        link: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        request_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: 'Notifications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Notification;
