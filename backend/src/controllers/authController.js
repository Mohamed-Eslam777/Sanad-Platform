const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, BeneficiaryProfile, VolunteerProfile } = require('../models');
const { hashPassword, comparePasswords, generateToken } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── Password reset mail transport (lazy singleton) ─────────────────────────────
let mailTransport = null;

const getMailTransport = () => {
    if (mailTransport) return mailTransport;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        // In non-production, allow running without real SMTP
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
        }
        return null;
    }

    mailTransport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    return mailTransport;
};

/**
 * @desc    Register a new user (beneficiary or volunteer)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { full_name, email, phone, password, role } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return sendError(res, 409, 'An account with this email already exists.');
        }

        const password_hash = await hashPassword(password);
        const user = await User.create({ full_name, email, phone, password_hash, role });

        if (role === 'beneficiary') {
            await BeneficiaryProfile.create({ user_id: user.id });
        } else if (role === 'volunteer') {
            await VolunteerProfile.create({ user_id: user.id });
        }

        const token = generateToken({ id: user.id, role: user.role });

        const dto = {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
        };

        return sendSuccess(res, 201, 'Account created successfully.', {
            token,
            user: dto,
        });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        const isMatch = await comparePasswords(password, user.password_hash);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        if (user.status !== 'active') {
            return sendError(res, 403, 'Your account has been flagged or suspended. Please contact support.');
        }

        const token = generateToken({ id: user.id, role: user.role });

        const dto = {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
        };

        return sendSuccess(res, 200, 'Logged in successfully.', {
            token,
            user: dto,
        });
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        const u = req.user;
        const dto = {
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role,
        };
        return sendSuccess(res, 200, 'Current user data.', dto);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Request a password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 *
 * Security design:
 *  - Always responds with the same success message regardless of whether the
 *    email exists (prevents user enumeration).
 *  - Generates a random 32-byte token, stores its SHA-256 hash in the DB,
 *    and sets a 1-hour expiry.
 *  - In production, integrate a real mail service (SendGrid, Nodemailer, etc.)
 *    to deliver the token. Currently prints to console for development.
 */
const forgotPassword = async (req, res) => {
    const GENERIC_MSG = 'إذا كان البريد مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.';

    try {
        const { email } = req.body;
        if (!email) return sendError(res, 400, 'Email is required.');

        const user = await User.findOne({ where: { email } });

        // Silently succeed even if user not found (prevents email enumeration)
        if (!user) {
            return sendSuccess(res, 200, GENERIC_MSG);
        }

        // 1. Generate a cryptographically secure raw token
        const rawToken = crypto.randomBytes(32).toString('hex');
        // 2. Hash it before storing (so a DB breach doesn't expose valid tokens)
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        // 3. Expiry: 1 hour from now
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        await user.update({
            reset_token: hashedToken,
            reset_token_expires: expires,
        });

        // The URL contains rawToken (plain), not the hash. Only the plain token
        // can be matched back to the stored hash via SHA-256.
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

        // Try to send a real email if SMTP is configured
        try {
            const transport = getMailTransport();
            if (transport) {
                await transport.sendMail({
                    from: process.env.SMTP_FROM || '"Sanad Support" <no-reply@sanad.app>',
                    to: user.email,
                    subject: 'إعادة تعيين كلمة المرور - سَنَد',
                    html: `
                        <p>مرحباً ${user.full_name},</p>
                        <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك في منصة <strong>سَنَد</strong>.</p>
                        <p>يمكنك تعيين كلمة مرور جديدة عبر الضغط على الرابط التالي:</p>
                        <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
                        <p>ينتهي هذا الرابط خلال ساعة واحدة، وإذا لم تكن قد طلبت هذه العملية فتجاهل هذه الرسالة.</p>
                        <p>مع خالص التحية،<br/>فريق سَنَد</p>
                    `,
                });
            } else {
                // Development fallback: log URL to console
                // eslint-disable-next-line no-console
                console.log('─────────────────────────────────────────────────────');
                // eslint-disable-next-line no-console
                console.log('[Sanad] Password reset link (dev only, configure SMTP for production):');
                // eslint-disable-next-line no-console
                console.log(resetUrl);
                // eslint-disable-next-line no-console
                console.log('─────────────────────────────────────────────────────');
            }
        } catch (mailError) {
            // Don't leak mail error details to client; keep generic message
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.error('[Sanad] Failed to send reset email:', mailError.message);
            }
        }

        return sendSuccess(res, 200, GENERIC_MSG);
    } catch (error) {
        return sendError(res, 500, error);
    }
};

/**
 * @desc    Reset password using the token received via email
 * @route   POST /api/auth/reset-password
 * @access  Public
 *
 * Body: { token: string, password: string }
 */
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return sendError(res, 400, 'Token and new password are required.');
        }
        if (password.length < 8) {
            return sendError(res, 400, 'Password must be at least 8 characters.');
        }

        // Hash the incoming raw token to compare against the stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                reset_token: hashedToken,
                reset_token_expires: { [Op.gt]: new Date() }, // must not be expired
            },
        });

        if (!user) {
            return sendError(res, 400, 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
        }

        // Update password and clear the reset token (one-time use)
        const password_hash = await hashPassword(password);
        await user.update({
            password_hash,
            reset_token: null,
            reset_token_expires: null,
        });

        return sendSuccess(res, 200, 'تم تعيين كلمة المرور الجديدة بنجاح. يمكنك الآن تسجيل الدخول.');
    } catch (error) {
        return sendError(res, 500, error);
    }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
