const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAllUsers, updateUserStatus, reviewIdentityVerification } = require('../controllers/adminController');
const { getUserProfile, getMyProfile, updateProfile, verifyIdentity } = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Setup Multer for KYC Identities ────────────────────────────────────────
const identitiesDir = path.join(__dirname, '../../public/uploads/identities');
if (!fs.existsSync(identitiesDir)) {
    fs.mkdirSync(identitiesDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, identitiesDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per image
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images are allowed'));
        cb(null, true);
    }
});

// ================================================================================
//  IMPORTANT: ALL named/static routes MUST come BEFORE the dynamic /:id route.
//  Express matches routes top-to-bottom. If /:id is listed first, requests like
//  /me, /stats will be caught by /:id with id="me" or id="stats".
// ════════════════════════════════════════════════════════════════════════════════

// ─── Static named routes (no /:id conflicts) ────────────────────────────────

// GET  /api/users/me      → authenticated user's own profile
router.get('/me', protect, getMyProfile);

// PUT  /api/users/me      → update own profile
router.put('/me', protect, updateProfile);

// POST /api/users/verify-identity → User uploads KYC documents
router.post(
    '/verify-identity',
    protect,
    upload.fields([
        { name: 'id_card_front', maxCount: 1 },
        { name: 'id_card_back', maxCount: 1 },
        { name: 'id_selfie', maxCount: 1 }
    ]),
    verifyIdentity
);


// GET  /api/users         → admin: list all users (search/filter/pagination)
router.get('/', protect, authorize('admin'), getAllUsers);

// ─── Dynamic parameterised routes (MUST be last) ────────────────────────────

// PATCH /api/users/:id/status  → admin: change user status
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

// PATCH /api/users/:id/verify  → admin: review identity verification (accept/reject)
router.patch('/:id/verify', protect, authorize('admin'), reviewIdentityVerification);

// GET   /api/users/:id         → view any user's profile
router.get('/:id', protect, getUserProfile);

module.exports = router;
