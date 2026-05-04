'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Seed} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@Sanad2026', salt);

    await queryInterface.bulkInsert('Users', [{
      full_name: 'System Admin',
      email: 'admin@sanad.app',
      password_hash: hashedPassword,
      role: 'admin',
      status: 'active',
      verification_status: 'verified',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@sanad.app' }, {});
  }
};
