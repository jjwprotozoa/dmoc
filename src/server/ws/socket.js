// src/server/ws/socket.js
// JavaScript version of Socket.IO server for custom Next.js server
const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socketio',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
    serveClient: false, // Don't serve the client files
  });

  // Add error handling
  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });

  io.on('connection', async (socket) => {
    console.log('Client connected', { socketId: socket.id });

    // Add error handling for individual sockets
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Join tenant-specific room
    socket.on('join-tenant', async (tenantSlug) => {
      try {
        // For now, just join the room without DB validation
        socket.join(`tenant:${tenantSlug}`);
        console.log('Client joined tenant room', { 
          socketId: socket.id, 
          tenantSlug 
        });
      } catch (error) {
        console.error('Failed to join tenant room', { 
          socketId: socket.id, 
          tenantSlug, 
          error 
        });
      }
    });

    // Join company-specific room
    socket.on('join-company', (companyId) => {
      socket.join(`company:${companyId}`);
      console.log('Client joined company room', { 
        socketId: socket.id, 
        companyId 
      });
    });

    // Join manifest-specific room
    socket.on('join-manifest', (manifestId) => {
      socket.join(`manifest:${manifestId}`);
      console.log('Client joined manifest room', { 
        socketId: socket.id, 
        manifestId 
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected', { socketId: socket.id, reason });
    });
  });

  return io;
};

const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Socket event emitters
const emitLocationPing = (tenantSlug, ping) => {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('ping:new', ping);
};

const emitManifestUpdate = (companyId, manifest) => {
  const socketIO = getSocketIO();
  socketIO.to(`company:${companyId}`).emit('manifest:update', manifest);
};

const emitWebhookEvent = (tenantSlug, event) => {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('webhook:new', event);
};

module.exports = {
  initSocket,
  getSocketIO,
  emitLocationPing,
  emitManifestUpdate,
  emitWebhookEvent,
};
