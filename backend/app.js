const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ── 1. Security Headers (helmet) ───────────────────────────────────────────────
// Sets X-Frame-Options, Content-Security-Policy, X-Content-Type-Options, etc.
app.use(helmet());

// ── 2. CORS — restricted to the frontend origin ────────────────────────────────
// Set ALLOWED_ORIGIN in .env (e.g. https://sanad.app) for production.
// Falls back to localhost:5173 for development.
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman) in development
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (origin === allowedOrigin) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
    },
    credentials: true,
}));

// ── 3. Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          // cap body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 4. Rate Limiting ───────────────────────────────────────────────────────────
// Auth: protect against brute-force on login/register
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'تجاوزت الحد المسموح من المحاولات. يرجى الانتظار 15 دقيقة والمحاولة مجدداً.',
    },
    skipSuccessfulRequests: true, // don't count successful logins against the rate
});
app.use('/api/auth', authLimiter);

// SOS: prevent abuse of SOS endpoint
const sosLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'تم إرسال عدد كبير من طلبات الاستغاثة في وقت قصير. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.',
    },
});
app.use('/api/sos', sosLimiter);

// Messaging: lightweight rate limit to reduce spam
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'تجاوزت الحد المسموح من الرسائل في الدقيقة. يرجى الانتظار قليلاً ثم المتابعة.',
    },
});
app.use('/api/messages', messageLimiter);

// ── 5. API Routes ──────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 6. Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Sanad API 🤝', status: 'OK' });
});

// ── 7. Global Error Handler (must stay last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
