const { sequelize } = require('../src/config/db');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        const queryInterface = sequelize.getQueryInterface();
        const table = 'Requests';

        console.log(`Checking columns in ${table} table...`);
        const tableInfo = await queryInterface.describeTable(table);

        if (!tableInfo.price) {
            console.log('Adding "price" column (STRING)...');
            await queryInterface.addColumn(table, 'price', {
                type: sequelize.Sequelize.STRING(50),
                allowNull: true,
            });
            console.log('✅ "price" column added successfully.');
        } else {
            console.log('Column "price" already exists.');
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
