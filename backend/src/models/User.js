const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * User model — base account for all roles (beneficiary, volunteer, admin).
 * Role-Based Access Control (RBAC) is enforced via the `role` field.
 * Flagged accounts are blocked from interactions.
 */
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Hidden from other users; communication via in-app chat only.',
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('beneficiary', 'volunteer', 'admin'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'flagged', 'suspended'),
            defaultValue: 'active',
        },
        profile_picture: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // ── Password Reset ────────────────────────────────────────────────────
        reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Hashed one-time token for password reset.',
        },
        reset_token_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Token expiry — 1 hour from issue time.',
        },
    },
    {
        tableName: 'Users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = User;
