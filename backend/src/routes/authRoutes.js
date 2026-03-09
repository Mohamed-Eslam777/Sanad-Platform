const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidators, loginValidators, validate } = require('../utils/validators');

// POST /api/auth/register
router.post('/register', registerValidators, validate, register);

// POST /api/auth/login
router.post('/login', loginValidators, validate, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

// POST /api/auth/forgot-password — request a password reset link
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password — submit new password with the token
router.post('/reset-password', resetPassword);

module.exports = router;
