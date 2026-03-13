/**
 * Jest global setup — runs before any test suite.
 * Loads .env so environment variables are available even when
 * Supertest imports app.js directly (bypassing server.js).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Force test environment
process.env.NODE_ENV = 'test';
