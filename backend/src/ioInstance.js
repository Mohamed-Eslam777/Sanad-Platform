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
 *   const { notifyUser } = require('../ioInstance');
 *   notifyUser(userId, { type, title, body, link, requestId });
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
 * Persist + broadcast a notification to a specific user's private Socket.io room.
 *
 * Strategy:
 *  1. Normalise the payload (unify 'body' / 'message' keys, resolve requestId → request_id).
 *  2. Save to DB.  If DB fails, log the error but DO NOT abort — always try to emit.
 *  3. Emit the DB record (real auto-increment id) when saved, or an ephemeral object as fallback.
 *
 * @param {number} userId  - Recipient user ID
 * @param {object} payload - { type?, title, body?, message?, link?, requestId? }
 */
async function notifyUser(userId, payload) {
    // ── 1. Normalise payload ──────────────────────────────────────────────────
    const normalised = {
        type:       payload.type      || null,
        title:      payload.title     || '',
        body:       payload.body      || payload.message || '',
        link:       payload.link      || null,
        request_id: payload.requestId || null,
    };

    // ── 2. Persist to DB (lazy-require to avoid circular deps at load time) ──
    let record = null;
    try {
        const { Notification } = require('./models');
        record = await Notification.create({ user_id: userId, ...normalised });
    } catch (dbErr) {
        console.error('[notifyUser] DB save failed — falling back to ephemeral emit:', dbErr.message);
    }

    // ── 3. Broadcast via Socket.io ────────────────────────────────────────────
    if (!_io) return;

    const emitPayload = record
        ? {
              id:        record.id,           // real DB integer id
              type:      record.type,
              title:     record.title,
              body:      record.body,
              link:      record.link,
              requestId: record.request_id,
              is_read:   false,
              timestamp: record.created_at,
          }
        : {
              id:        Date.now(),           // fallback ephemeral id
              ...normalised,
              requestId: normalised.request_id,
              is_read:   false,
              timestamp: new Date().toISOString(),
          };

    _io.to(`user_${userId}`).emit('new_notification', emitPayload);
}

module.exports = { setIO, getIO, notifyUser };
