/**
 * socketHandler.js — Socket.io event handlers for Sanad real-time chat
 * and notifications.
 *
 * Rooms:
 *   - `user_<id>`      → private room; every connected user auto-joins.
 *                        Used for personal notifications.
 *   - `request_<id>`   → chat room; joined on demand when the user opens chat.
 *                        Private to the two participants.
 */

'use strict';

const jwt = require('jsonwebtoken');
const { Message, Request, User } = require('./models');
const { notifyUser } = require('./ioInstance');

/* ─────────────────────────────────────────────────────────────────────────────
   JWT authentication middleware
───────────────────────────────────────────────────────────────────────────── */
async function authenticateSocket(socket, next) {
    try {
        const token = socket.handshake.query.token || socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: no token provided.'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'full_name', 'role'],
        });
        if (!user) return next(new Error('Authentication error: user not found.'));

        socket.user = user;
        next();
    } catch {
        next(new Error('Authentication error: invalid token.'));
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Register all event listeners on a connected socket.
───────────────────────────────────────────────────────────────────────────── */
function registerSocketEvents(io, socket) {
    const userId = socket.user.id;
    const userName = socket.user.full_name;

    // ── Auto-join private user room for personal notifications ───────────────
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`🔌 Socket connected: ${userName} → joined private room ${userRoom}`);

    // ── join_room (chat) ──────────────────────────────────────────────────────
    socket.on('join_room', async (requestId) => {
        try {
            if (!requestId) return;

            const request = await Request.findByPk(requestId);
            if (!request) return socket.emit('error_message', { message: 'Request not found.' });

            const isParticipant =
                userId === request.beneficiary_id || userId === request.volunteer_id;
            if (!isParticipant) return socket.emit('error_message', { message: 'Not authorized.' });

            const roomName = `request_${requestId}`;
            socket.join(roomName);
            console.log(`📨 ${userName} joined chat room ${roomName}`);

            socket.to(roomName).emit('user_joined', { userId, name: userName });
        } catch (err) {
            console.error('join_room error:', err.message);
            socket.emit('error_message', { message: 'Failed to join room.' });
        }
    });

    // ── leave_room ────────────────────────────────────────────────────────────
    socket.on('leave_room', (requestId) => {
        if (!requestId) return;
        socket.leave(`request_${requestId}`);
        console.log(`👋 ${userName} left room request_${requestId}`);
    });

    // ── send_message ──────────────────────────────────────────────────────────
    socket.on('send_message', async (data) => {
        try {
            const { requestId, content } = data || {};
            if (!requestId || !content?.trim()) return;

            const request = await Request.findByPk(requestId);
            if (!request) return socket.emit('error_message', { message: 'Request not found.' });

            const isParticipant =
                userId === request.beneficiary_id || userId === request.volunteer_id;
            if (!isParticipant) return socket.emit('error_message', { message: 'Not authorized.' });

            if (!['accepted', 'in_progress'].includes(request.status)) {
                return socket.emit('error_message', { message: 'Chat is only open for accepted/in-progress requests.' });
            }

            // Persist to DB
            const message = await Message.create({
                request_id: requestId,
                sender_id: userId,
                content: content.trim(),
            });

            // Broadcast chat message to everyone in the chat room
            const roomName = `request_${requestId}`;
            io.to(roomName).emit('receive_message', {
                id: message.id,
                request_id: message.request_id,
                sender_id: message.sender_id,
                sender_name: userName,
                content: message.content,
                created_at: message.created_at,
            });

            // ── Notify the OTHER party if they're NOT in the chat room ────────
            // Determine recipient
            const recipientId =
                userId === request.beneficiary_id
                    ? request.volunteer_id
                    : request.beneficiary_id;

            if (recipientId) {
                // Check if recipient has any socket in the chat room
                const chatRoomSockets = await io.in(roomName).allSockets();
                const recipientUserRoom = `user_${recipientId}`;
                const recipientSockets = await io.in(recipientUserRoom).allSockets();
                const recipientInChat = [...chatRoomSockets].some(sid =>
                    [...recipientSockets].includes(sid)
                );

                if (!recipientInChat) {
                    notifyUser(recipientId, {
                        type: 'new_message',
                        title: 'رسالة جديدة 💬',
                        body: `${userName}: ${content.trim().slice(0, 60)}${content.trim().length > 60 ? '...' : ''}`,
                        requestId: requestId,
                        link: `/requests/${requestId}`,
                    });
                }
            }
        } catch (err) {
            console.error('send_message error:', err.message);
            socket.emit('error_message', { message: 'Failed to send message.' });
        }
    });

    // ── typing ─────────────────────────────────────────────────────────────────
    socket.on('typing', ({ requestId }) => {
        if (!requestId) return;
        socket.to(`request_${requestId}`).emit('typing', { userId, name: userName });
    });

    socket.on('stop_typing', ({ requestId }) => {
        if (!requestId) return;
        socket.to(`request_${requestId}`).emit('stop_typing', { userId });
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${userName} (${reason})`);
    });
}

module.exports = { authenticateSocket, registerSocketEvents };
