'use strict';

/**
 * Migration: Add GEOMETRY POINT column + SPATIAL INDEX to Volunteer_Profiles
 * for ultra-fast ST_Distance_Sphere proximity queries.
 *
 * MySQL requires all parts of a SPATIAL INDEX to be NOT NULL, so we:
 *   1. Add the column as nullable
 *   2. Back-fill ALL rows (using COALESCE to handle missing lat/lng)
 *   3. Change the column to NOT NULL
 *   4. Create the SPATIAL INDEX
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add GEOMETRY('POINT') column — temporarily nullable
    await queryInterface.addColumn('Volunteer_Profiles', 'location', {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: true,
      comment: 'Spatial POINT column for ultra-fast proximity queries.',
    });

    // 2. Back-fill ALL rows from existing lat/lng (COALESCE to POINT(0 0) if missing)
    await queryInterface.sequelize.query(`
      UPDATE Volunteer_Profiles
      SET location = ST_GeomFromText(
        CONCAT('POINT(', COALESCE(longitude, 0), ' ', COALESCE(latitude, 0), ')')
      );
    `);

    // 3. Alter column to NOT NULL (required for SPATIAL INDEX in MySQL)
    await queryInterface.changeColumn('Volunteer_Profiles', 'location', {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: false,
    });

    // 4. Create SPATIAL INDEX on the now NOT NULL column
    await queryInterface.sequelize.query(`
      CREATE SPATIAL INDEX idx_volunteer_location
      ON Volunteer_Profiles(location);
    `);

    // 5. Add regular indexes on other frequently queried columns
    await queryInterface.addIndex('Volunteer_Profiles', ['is_available'], {
      name: 'idx_volunteer_available',
    });

    await queryInterface.addIndex('Requests', ['status'], {
      name: 'idx_request_status',
    });

    await queryInterface.addIndex('Requests', ['beneficiary_id'], {
      name: 'idx_request_beneficiary',
    });

    await queryInterface.addIndex('Requests', ['volunteer_id'], {
      name: 'idx_request_volunteer',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes (reverse order)
    await queryInterface.removeIndex('Requests', 'idx_request_volunteer');
    await queryInterface.removeIndex('Requests', 'idx_request_beneficiary');
    await queryInterface.removeIndex('Requests', 'idx_request_status');
    await queryInterface.removeIndex('Volunteer_Profiles', 'idx_volunteer_available');

    // Remove spatial index via raw SQL
    await queryInterface.sequelize.query(`
      DROP INDEX idx_volunteer_location ON Volunteer_Profiles;
    `);

    // Remove the column
    await queryInterface.removeColumn('Volunteer_Profiles', 'location');
  }
};
