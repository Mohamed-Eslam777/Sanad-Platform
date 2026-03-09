const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hashes a plain-text password.
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password against a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePasswords = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Generates a signed JWT for the authenticated user.
 * @param {object} payload - Data to encode (e.g., { id, role })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = { hashPassword, comparePasswords, generateToken };
