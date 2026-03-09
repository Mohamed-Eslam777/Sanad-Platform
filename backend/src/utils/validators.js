const { body, validationResult } = require('express-validator');
const { sendError } = require('./responseHelper');

/**
 * Runs validation results and short-circuits with a 400 if errors exist.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed.', errors.array());
    }
    next();
};

// ─── Auth Validators ───────────────────────────────────────────────────────────
const registerValidators = [
    body('full_name').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('role').isIn(['beneficiary', 'volunteer']).withMessage('Role must be beneficiary or volunteer.'),
];

const loginValidators = [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
];

// ─── Request Validators ────────────────────────────────────────────────────────
const createRequestValidators = [
    body('type').isIn(['transportation', 'reading', 'errand', 'other']).withMessage('Invalid request type.'),
    body('location_lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
    body('location_lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
];

module.exports = { validate, registerValidators, loginValidators, createRequestValidators };
