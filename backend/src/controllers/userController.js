const { User, BeneficiaryProfile, VolunteerProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── Helpers ────────────────────────────────────────────────────────────────────
const buildRoleProfile = (user) => {
    if (user.role === 'beneficiary' && user.beneficiaryProfile) {
        const p = user.beneficiaryProfile;
        return {
            type: 'beneficiary',
            disability_type: p.disability_type,
            medical_notes: p.medical_notes,
            emergency_contact_name: p.emergency_contact_name,
            emergency_contact_phone: p.emergency_contact_phone,
        };
    }

    if (user.role === 'volunteer' && user.volunteerProfile) {
        const p = user.volunteerProfile;
        return {
            type: 'volunteer',
            bio: p.bio,
            skills: p.skills,
            average_rating: p.average_rating,
            total_reviews: p.total_reviews,
            completed_requests: p.completed_requests || 0,
        };
    }    return null;
};

const toUserDTO = (user) => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    profile: buildRoleProfile(user),
    verification_status: user.verification_status, // added for Phase 5 KYC
    id_card_front: user.id_card_front,
    id_card_back: user.id_card_back,
    id_selfie: user.id_selfie,
});/**
 * @desc    Get a user's public profile by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash', 'phone'] },
            include: [
                { model: BeneficiaryProfile, as: 'beneficiaryProfile' },
                { model: VolunteerProfile, as: 'volunteerProfile', attributes: { exclude: ['national_id'] } },
            ],
        });

        if (!user) return sendError(res, 404, 'User not found.');
        return sendSuccess(res, 200, 'User profile.', toUserDTO(user));
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get the currently authenticated user's full profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: BeneficiaryProfile, as: 'beneficiaryProfile' },
                { model: VolunteerProfile, as: 'volunteerProfile' },
            ],
        });
        return sendSuccess(res, 200, 'Your profile.', toUserDTO(user));
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Update current user's own profile (User + role-specific sub-profile)
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const {
            full_name, phone,
            // beneficiary fields
            disability_type, medical_notes, emergency_contact_name, emergency_contact_phone,
            // volunteer fields
            bio, skills, national_id,
        } = req.body;

        // 1. Update base User fields
        await req.user.update({ full_name, phone });

        // 2. Upsert sub-profile based on role
        if (req.user.role === 'beneficiary') {
            await BeneficiaryProfile.upsert({
                user_id: req.user.id,
                disability_type,
                medical_notes,
                emergency_contact_name,
                emergency_contact_phone,
            });
        } else if (req.user.role === 'volunteer') {
            await VolunteerProfile.upsert({
                user_id: req.user.id,
                bio,
                skills,
                national_id,
            });
        }

        // 3. Re-fetch full profile to return updated data
        const updated = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: BeneficiaryProfile, as: 'beneficiaryProfile' },
                { model: VolunteerProfile, as: 'volunteerProfile' },
            ],
        });

        return sendSuccess(res, 200, 'Profile updated successfully.', toUserDTO(updated));
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Upload KYC documents and change status to pending
 * @route   POST /api/users/verify-identity
 * @access  Private
 */
const verifyIdentity = async (req, res) => {
    try {
        if (!req.files || !req.files['id_card_front'] || !req.files['id_card_back'] || !req.files['id_selfie']) {
            return sendError(res, 400, 'Please upload all 3 required images (front, back, selfie).');
        }

        const frontUrl = `/uploads/identities/${req.files['id_card_front'][0].filename}`;
        const backUrl = `/uploads/identities/${req.files['id_card_back'][0].filename}`;
        const selfieUrl = `/uploads/identities/${req.files['id_selfie'][0].filename}`;

        await req.user.update({
            id_card_front: frontUrl,
            id_card_back: backUrl,
            id_selfie: selfieUrl,
            verification_status: 'pending',
        });

        return sendSuccess(res, 200, 'Identity documents uploaded successfully. Your account is now pending review.', {
            verification_status: 'pending',
            id_card_front: frontUrl,
            id_card_back: backUrl,
            id_selfie: selfieUrl
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { getUserProfile, getMyProfile, updateProfile, verifyIdentity };
