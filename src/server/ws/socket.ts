// src/server/ws/socket.ts
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
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

  io.on('connection', async (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    // Join tenant-specific room
    socket.on('join-tenant', async (tenantSlug: string) => {
      try {
        const tenant = await db.tenant.findUnique({
          where: { slug: tenantSlug },
        });

        if (tenant) {
          socket.join(`tenant:${tenantSlug}`);
          logger.info('Client joined tenant room', { 
            socketId: socket.id, 
            tenantSlug 
          });
        }
      } catch (error) {
        logger.error('Failed to join tenant room', { 
          socketId: socket.id, 
          tenantSlug, 
          error 
        });
      }
    });

    // Join company-specific room
    socket.on('join-company', (companyId: string) => {
      socket.join(`company:${companyId}`);
      logger.info('Client joined company room', { 
        socketId: socket.id, 
        companyId 
      });
    });

    // Join manifest-specific room
    socket.on('join-manifest', (manifestId: string) => {
      socket.join(`manifest:${manifestId}`);
      logger.info('Client joined manifest room', { 
        socketId: socket.id, 
        manifestId 
      });
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

interface LocationPing {
  id: string;
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  device: {
    id: string;
    externalId: string;
  };
}

interface Manifest {
  id: string;
  [key: string]: unknown;
}

interface WebhookEvent {
  id: string;
  createdAt: string;
  payload: {
    message?: string;
    [key: string]: unknown;
  };
}

// Socket event emitters
export const emitLocationPing = (tenantSlug: string, ping: LocationPing) => {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('ping:new', ping);
};

export const emitManifestUpdate = (companyId: string, manifest: Manifest) => {
  const socketIO = getSocketIO();
  socketIO.to(`company:${companyId}`).emit('manifest:update', manifest);
};

export const emitWebhookEvent = (tenantSlug: string, event: WebhookEvent) => {
  const socketIO = getSocketIO();
  socketIO.to(`tenant:${tenantSlug}`).emit('webhook:new', event);
};
