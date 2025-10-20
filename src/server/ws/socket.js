// src/server/ws/socket.js
// Node-compatible Socket.IO initializer (no TypeScript)
const { Server: SocketIOServer } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socketio',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  });

  io.on('connection', (socket) => {
    console.info('Client connected', { socketId: socket.id });

    // Join tenant-specific room (skip DB lookup in dev)
    socket.on('join-tenant', (tenantSlug) => {
      try {
        if (tenantSlug) {
          socket.join(`tenant:${tenantSlug}`);
          console.info('Client joined tenant room', { socketId: socket.id, tenantSlug });
        }
      } catch (error) {
        console.error('Failed to join tenant room', { socketId: socket.id, tenantSlug, error });
      }
    });

    // Join company-specific room
    socket.on('join-company', (companyId) => {
      socket.join(`company:${companyId}`);
      console.info('Client joined company room', { socketId: socket.id, companyId });
    });

    // Join manifest-specific room
    socket.on('join-manifest', (manifestId) => {
      socket.join(`manifest:${manifestId}`);
      console.info('Client joined manifest room', { socketId: socket.id, manifestId });
    });

    socket.on('disconnect', () => {
      console.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
}

function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

function emitLocationPing(tenantSlug, ping) {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('ping:new', ping);
}

function emitManifestUpdate(companyId, manifest) {
  const socketIO = getSocketIO();
  socketIO.to(`company:${companyId}`).emit('manifest:update', manifest);
}

function emitWebhookEvent(tenantSlug, event) {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('webhook:new', event);
}

module.exports = {
  initSocket,
  getSocketIO,
  emitLocationPing,
  emitManifestUpdate,
  emitWebhookEvent,
};


