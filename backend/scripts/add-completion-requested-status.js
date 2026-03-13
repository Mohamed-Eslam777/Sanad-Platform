const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../src/models');

async function up() {
    console.log('--- Starting Migration: Add completion_requested to Requests status enum ---');

    try {
        await sequelize.authenticate();
        console.log('✅ Connection to the database has been established successfully.');

        // For PostgreSQL
        const queryInterface = sequelize.getQueryInterface();
        const dbOptions = sequelize.options;

        if (dbOptions.dialect === 'postgres') {
            console.log('Running PostgreSQL specific query...');
            await sequelize.query(`ALTER TYPE "enum_Requests_status" ADD VALUE IF NOT EXISTS 'completion_requested';`);
        } else if (dbOptions.dialect === 'mysql') {
            console.log('Running MySQL specific query...');
            // In MySQL, you alter the table column to redefine the entire enum
            await sequelize.query(`
                ALTER TABLE Requests 
                MODIFY COLUMN status ENUM('pending', 'accepted', 'in_progress', 'completion_requested', 'completed', 'cancelled') 
                DEFAULT 'pending';
            `);
        } else {
            console.warn('⚠️ Warning: This script only supports Postgres and MySQL automated enum updates. Please check your dialect.');
        }

        console.log('✅ "completion_requested" successfully added to Requests status enum.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
}

up();
