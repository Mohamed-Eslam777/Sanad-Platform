/**
 * reset-db.js — Nuclear reset + seed script for Sanad development environment.
 *
 * ⚠️  WARNING: This DESTROYS all existing data and rebuilds the schema from scratch.
 *     NEVER run in production.
 *
 * Usage:
 *   npm run reset-db
 *   node scripts/reset-db.js
 */

'use strict';
require('dotenv').config(); // Load .env from the project root
const bcrypt = require('bcryptjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GREEN = (s) => `\x1b[32m${s}\x1b[0m`;
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

const line = '─'.repeat(54);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const DEFAULT_ADMIN = {
    full_name: 'مدير النظام (Admin)',
    email: 'admin@sanad.com',
    password: '123456',
    role: 'admin',
    status: 'active',
};

const SAMPLE_USERS = [
    { full_name: 'أحمد المستفيد', email: 'beneficiary@sanad.com', password: '123456', role: 'beneficiary' },
    { full_name: 'فاطمة المتطوعة', email: 'volunteer@sanad.com', password: '123456', role: 'volunteer' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\n${BOLD(line)}`);
    console.log(BOLD(YELLOW('  🗑️  Sanad — Database Reset & Seed Script')));
    console.log(BOLD(line));
    console.log(RED('  ⚠️  All existing data will be permanently deleted!\n'));

    // Import models AFTER dotenv so the DB config is available
    const { sequelize, User, BeneficiaryProfile, VolunteerProfile } = require('../src/models');

    try {
        // ── 1. Verify DB connection ──────────────────────────────────────────
        console.log(DIM('  → Testing database connection...'));
        await sequelize.authenticate();
        console.log(GREEN('  ✔  Connected to MySQL successfully.\n'));

        // ── 2. Drop all tables and recreate (force: true) ────────────────────
        console.log(DIM('  → Dropping all tables and re-syncing schema...'));
        await sequelize.sync({ force: true });
        console.log(GREEN('  ✔  Schema recreated (all tables are now empty).\n'));

        // ── 3. Create admin account ──────────────────────────────────────────
        console.log(DIM('  → Creating default admin account...'));
        const adminHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
        await User.create({
            full_name: DEFAULT_ADMIN.full_name,
            email: DEFAULT_ADMIN.email,
            password_hash: adminHash,
            role: DEFAULT_ADMIN.role,
            status: DEFAULT_ADMIN.status,
        });
        console.log(GREEN(`  ✔  Admin created: ${DEFAULT_ADMIN.email}\n`));

        // ── 4. Create sample beneficiary + volunteer ─────────────────────────
        console.log(DIM('  → Creating sample test accounts...'));
        for (const u of SAMPLE_USERS) {
            const hash = await bcrypt.hash(u.password, 12);
            const user = await User.create({
                full_name: u.full_name,
                email: u.email,
                password_hash: hash,
                role: u.role,
                status: 'active',
            });

            // Create the matching sub-profile
            if (u.role === 'beneficiary') {
                await BeneficiaryProfile.create({ user_id: user.id });
            } else if (u.role === 'volunteer') {
                await VolunteerProfile.create({ user_id: user.id });
            }
            console.log(GREEN(`  ✔  ${u.role.padEnd(12)} → ${u.email}`));
        }

        // ── 5. Summary ───────────────────────────────────────────────────────
        console.log(`\n${BOLD(line)}`);
        console.log(GREEN(BOLD('  ✅  Database reset & seed completed successfully!')));
        console.log(BOLD(line));
        console.log('');
        console.log('  📋  TEST ACCOUNTS (password: 123456 for all)');
        console.log('  ┌─────────────────────────────────────────────┐');
        console.log(`  │  📧  admin@sanad.com       — Admin          │`);
        console.log(`  │  📧  beneficiary@sanad.com — Beneficiary    │`);
        console.log(`  │  📧  volunteer@sanad.com   — Volunteer      │`);
        console.log('  └─────────────────────────────────────────────┘');
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error(`\n${RED('  ✖  Error during reset:')}`);
        console.error(RED(`     ${error.message}`));
        console.error(error);
        process.exit(1);
    }
}

main();
