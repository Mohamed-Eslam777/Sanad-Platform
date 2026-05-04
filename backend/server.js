/**
 * server.js — Sanad entry point.
 *
 * Creates the HTTP server, attaches Express + Socket.io, authenticates
 * DB, and starts listening.
 */
require('dotenv').config();

const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const app = require('./app');
const { sequelize } = require('./src/models');
const { authenticateSocket, registerSocketEvents } = require('./src/socketHandler');
const { setIO } = require('./src/ioInstance');
const { pubClient, subClient } = require('./src/config/redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

// ── 1. Create HTTP server from Express app ──────────────────────────────────
const httpServer = http.createServer(app);

// ── 2. Attach Socket.io to the same HTTP server ────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── 2b. Attach Redis adapter for horizontal scaling ─────────────────────────
// Graceful fallback: if Redis is unreachable, Socket.io falls back to in-memory.
Promise.all([pubClient.connect?.() || Promise.resolve(), subClient.connect?.() || Promise.resolve()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('✅ Socket.io Redis adapter attached successfully.');
  })
  .catch((err) => {
    logger.warn(`⚠️ Redis adapter failed to attach: ${err.message}. Falling back to in-memory adapter.`);
  });

// ── 3. Register io in singleton so controllers can emit notifications ────────
setIO(io);

// ── 4. Socket.io middleware: JWT authentication ─────────────────────────────
io.use(authenticateSocket);

// ── 4. Socket.io connection handler ──────────────────────────────────────────
io.on('connection', (socket) => {
  registerSocketEvents(io, socket);
});

// ── 5. Authenticate DB then start listening ──────────────────────────────────
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Syncing database in development/test mode...');
      return sequelize.sync({ alter: true });
    }
    console.log('⏩ Skipping database sync in production mode (using migrations).');
    return Promise.resolve();
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Sanad server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.io listening for real-time connections.`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });
