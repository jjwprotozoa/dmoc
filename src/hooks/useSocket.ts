// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (tenantSlug?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to socket server');
      
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

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [tenantSlug]);

  return { socket, isConnected, connectionError };
};
