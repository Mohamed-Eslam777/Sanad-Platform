const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * BeneficiaryProfile — extended info for users with role='beneficiary'.
 */
const BeneficiaryProfile = sequelize.define(
    'BeneficiaryProfile',
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
        disability_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        medical_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        emergency_contact_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        emergency_contact_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
    },
    {
        tableName: 'Beneficiary_Profiles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = BeneficiaryProfile;
