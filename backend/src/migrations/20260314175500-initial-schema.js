'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Users table ───────────────────────────────────────────────────────
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('beneficiary', 'volunteer', 'admin'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'flagged', 'suspended'),
        defaultValue: 'active',
      },
      profile_picture: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_card_front: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_card_back: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_selfie: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      verification_status: {
        type: Sequelize.ENUM('unverified', 'pending', 'verified', 'rejected'),
        defaultValue: 'unverified',
      },
      reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reset_token_expires: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // ── 2. Beneficiary_Profiles table ──────────────────────────────────────
    await queryInterface.createTable('Beneficiary_Profiles', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      disability_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      medical_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
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

    // ── 3. Volunteer_Profiles table ────────────────────────────────────────
    await queryInterface.createTable('Volunteer_Profiles', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      national_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_id_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      skills: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      total_reviews: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // ── 4. Requests table ──────────────────────────────────────────────────
    await queryInterface.createTable('Requests', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      beneficiary_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      volunteer_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('transportation', 'reading', 'errand', 'other'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'in_progress', 'completion_requested', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      location_lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      location_lng: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      location_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      price: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      scheduled_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // ── 5. Messages table ──────────────────────────────────────────────────
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      attachment_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      attachment_type: {
        type: Sequelize.ENUM('image', 'document', 'audio'),
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
    });

    // ── 6. Reviews table ───────────────────────────────────────────────────
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'Requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reviewer_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      reviewed_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      rating: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ── 7. SOS_Alerts table ───────────────────────────────────────────────
    await queryInterface.createTable('SOS_Alerts', {
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
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'resolved'),
        defaultValue: 'active',
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect foreign key constraints
    await queryInterface.dropTable('SOS_Alerts');
    await queryInterface.dropTable('Reviews');
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('Requests');
    await queryInterface.dropTable('Volunteer_Profiles');
    await queryInterface.dropTable('Beneficiary_Profiles');
    await queryInterface.dropTable('Users');
  }
};
