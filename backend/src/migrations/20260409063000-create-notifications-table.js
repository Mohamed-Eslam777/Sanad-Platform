'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Fetch all existing tables safely
    const tables = await queryInterface.showAllTables();
    
    // Normalize table names array (depending on DB dialect, it can return strings or objects)
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName));

    // 2) Idempotent Check: Only create if the table DOES NOT exist
    if (!tableNames.includes('Notifications')) {
      await queryInterface.createTable('Notifications', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        body: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        link: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        request_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
      console.log('✅ [Migration] Created "Notifications" table successfully.');
    } else {
      console.log('⏩ [Migration] Table "Notifications" already exists. Skipping creation to prevent crashing.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop the table safely
    await queryInterface.dropTable('Notifications');
  }
};
