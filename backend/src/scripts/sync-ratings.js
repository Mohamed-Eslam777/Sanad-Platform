'use strict';

/**
 * One-time script to test frontend rendering.
 * Forces average_rating = 5, total_reviews = 1 for user_id = 3
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const sequelize = require('../config/db');

async function syncRatings() {
    try {
        console.log('🔄 Executing manual SQL update...');

        await sequelize.query(
            "UPDATE Volunteer_Profiles SET average_rating = 5, total_reviews = 1 WHERE user_id = 3;"
        );

        console.log(`✅ Manual sync complete for user_id = 3.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

syncRatings();
