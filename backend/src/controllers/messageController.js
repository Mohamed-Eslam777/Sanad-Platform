const { Message, Request } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ensure uploads directory exists ──
const uploadPath = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ── Multer Storage Config ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg' // added webm/ogg for browser recording
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, documents (PDF/DOC), and audio are allowed.'));
        }
    },
});

/**
 * @desc    Get all messages for a request (chat thread)
 * @route   GET /api/messages/:requestId
 * @access  Private (participants only)
 */
const getMessages = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        // Ensure only the beneficiary or volunteer involved can read messages
        const isParticipant =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isParticipant) return sendError(res, 403, 'Not authorized to view these messages.');

        const messages = await Message.findAll({
            where: { request_id: req.params.requestId },
            order: [['created_at', 'ASC']],
        });

        return sendSuccess(res, 200, 'Messages retrieved.', messages);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Send a message within a request chat
 * @route   POST /api/messages/:requestId
 * @access  Private (participants only)
 */
const sendMessage = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        const isParticipant =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isParticipant) return sendError(res, 403, 'Not authorized to send messages here.');

        if (!['accepted', 'in_progress'].includes(request.status)) {
            return sendError(res, 400, 'Chat is only open for accepted or in-progress requests.');
        }

        const message = await Message.create({
            request_id: request.id,
            sender_id: req.user.id,
            content: req.body.content || '',
            attachment_url: req.body.attachment_url || null,
            attachment_type: req.body.attachment_type || null,
        });

        return sendSuccess(res, 201, 'Message sent.', message);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Upload an attachment for a chat message
 * @route   POST /api/messages/upload/:requestId
 * @access  Private (participants only)
 */
const uploadAttachment = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.requestId);
        if (!request) return sendError(res, 404, 'Request not found.');

        const isParticipant =
            req.user.id === request.beneficiary_id || req.user.id === request.volunteer_id;
        if (!isParticipant) return sendError(res, 403, 'Not authorized.');

        if (!req.file) return sendError(res, 400, 'No file uploaded.');

        // Determine type based on mimetype
        let attachment_type = 'document';
        if (req.file.mimetype.startsWith('image/')) attachment_type = 'image';
        if (req.file.mimetype.startsWith('audio/')) attachment_type = 'audio';

        // Build the public URL (relative to the static folder mapped in app.js)
        const attachment_url = `/uploads/${req.file.filename}`;

        return sendSuccess(res, 201, 'File uploaded securely.', {
            attachment_url,
            attachment_type,
            fileName: req.file.originalname,
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = { getMessages, sendMessage, uploadAttachment, upload };
