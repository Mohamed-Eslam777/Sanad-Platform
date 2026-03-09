/**
 * ioInstance.js — Singleton to share the Socket.io `io` instance
 * across the entire backend (controllers, services, etc.)
 * without creating circular dependency issues.
 *
 * Usage in server.js:
 *   const { setIO } = require('./src/ioInstance');
 *   setIO(io);  // call once after creating the io server
 *
 * Usage in any controller:
 *   const { getIO } = require('../ioInstance');
 *   getIO()?.to(`user_${userId}`).emit('new_notification', payload);
 */

'use strict';

let _io = null;

function setIO(io) {
    _io = io;
}

function getIO() {
    if (!_io) {
        console.warn('[ioInstance] Socket.io instance not set yet. Call setIO(io) in server.js first.');
    }
    return _io;
}

/**
 * Send a notification to a specific user's private room.
 * @param {number} userId - The target user's ID
 * @param {object} payload - { type, title, body, link?, requestId? }
 */
function notifyUser(userId, payload) {
    if (!_io) return;
    _io.to(`user_${userId}`).emit('new_notification', {
        id: Date.now(),
        ...payload,
        read: false,
        timestamp: new Date().toISOString(),
    });
}

module.exports = { setIO, getIO, notifyUser };
