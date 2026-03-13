const { sequelize } = require('../src/config/db');
const { DataTypes } = require('sequelize');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        const queryInterface = sequelize.getQueryInterface();
        const table = 'Users';

        console.log(`Checking columns in ${table} table...`);
        const tableInfo = await queryInterface.describeTable(table);

        const newColumns = {
            id_card_front: { type: DataTypes.STRING(255), allowNull: true },
            id_card_back: { type: DataTypes.STRING(255), allowNull: true },
            id_selfie: { type: DataTypes.STRING(255), allowNull: true },
            verification_status: { type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'), defaultValue: 'unverified' }
        };

        for (const [columnName, columnDef] of Object.entries(newColumns)) {
            if (!tableInfo[columnName]) {
                console.log(`Adding "${columnName}" column...`);
                await queryInterface.addColumn(table, columnName, columnDef);
                console.log(`✅ "${columnName}" column added successfully.`);
            } else {
                console.log(`Column "${columnName}" already exists.`);
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
