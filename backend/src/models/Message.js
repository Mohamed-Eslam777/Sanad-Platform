const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Message model — in-app chat between beneficiary and volunteer.
 * Phone numbers are hidden; all communication goes through this model.
 */
const Message = sequelize.define(
    'Message',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        request_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        attachment_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        attachment_type: {
            type: DataTypes.ENUM('image', 'document', 'audio'),
            allowNull: true,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: 'Messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

module.exports = Message;
