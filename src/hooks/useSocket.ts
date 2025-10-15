// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (tenantSlug?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only create socket connection on client side
    if (typeof window === 'undefined') return;

    // Skip Socket.IO on Vercel deployments (serverless doesn't support persistent connections)
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.log('Socket.IO disabled for Vercel deployment');
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      upgrade: true,
      rememberUpgrade: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to socket server', { 
        id: socketInstance.id, 
        transport: socketInstance.io.engine.transport.name 
      });
      
      if (tenantSlug) {
        socketInstance.emit('join-tenant', tenantSlug);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from socket server:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      console.error('Socket connection error:', error);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Add reconnection event handlers
    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setConnectionError('Failed to reconnect to server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [tenantSlug]);

  return { socket, isConnected, connectionError };
};
