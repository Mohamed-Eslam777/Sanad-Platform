/**
 * server.js — Sanad entry point.
 *
 * Creates the HTTP server, attaches Express + Socket.io, authenticates
 * DB, and starts listening.
 */
require('dotenv').config();

const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./src/models');
const { authenticateSocket, registerSocketEvents } = require('./src/socketHandler');
const { setIO } = require('./src/ioInstance');

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// ── 1. Create HTTP server from Express app ──────────────────────────────────
const httpServer = http.createServer(app);

// ── 2. Attach Socket.io to the same HTTP server ────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
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
    return sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
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
