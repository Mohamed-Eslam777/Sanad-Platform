const sequelize = require('../src/config/db');
const { DataTypes } = require('sequelize');

async function migrate() {
    console.log('Starting DB migration for Message attachments...');
    try {
        const queryInterface = sequelize.getQueryInterface();
        
        // Check if columns already exist to make this script idempotent
        const tableInfo = await queryInterface.describeTable('Messages');
        
        if (!tableInfo.attachment_url) {
            console.log('Adding attachment_url column...');
            await queryInterface.addColumn('Messages', 'attachment_url', {
                type: DataTypes.STRING,
                allowNull: true,
            });
        } else {
            console.log('attachment_url already exists, skipping.');
        }

        if (!tableInfo.attachment_type) {
            console.log('Adding attachment_type column...');
            await queryInterface.addColumn('Messages', 'attachment_type', {
                type: DataTypes.ENUM('image', 'document', 'audio'),
                allowNull: true,
            });
        } else {
            console.log('attachment_type already exists, skipping.');
        }

        console.log('Migration completed successfully. ✅');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

migrate();
