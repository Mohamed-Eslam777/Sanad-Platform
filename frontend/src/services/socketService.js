import { io } from 'socket.io-client';

/**
 * socketService.js — Singleton Socket.io client for Sanad frontend.
 *
 * IMPORTANT: JWT token key MUST stay in sync with:
 *  - TOKEN_KEY in `src/context/AuthContext.jsx`
 *  - TOKEN_KEY in `src/services/api.js`
 */

const TOKEN_KEY = 'sanad_token';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

let socket = null;

/**
 * Get (or create) the socket instance.
 * Authenticates via JWT token stored in localStorage.
 */
export function getSocket() {
    if (socket && socket.connected) return socket;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        console.warn('[socketService] No token found — cannot connect to socket.');
        return null;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('🔌 Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
}

/**
 * Disconnect and clean up the socket instance.
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
