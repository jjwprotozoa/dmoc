// src/app/test-socket/page.tsx
// Test page for Socket.IO connection
'use client';

import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

export default function TestSocketPage() {
  const { socket, isConnected, connectionError } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (socket) {
      const addMessage = (msg: string) => {
        setMessages((prev) => [
          ...prev,
          `${new Date().toLocaleTimeString()}: ${msg}`,
        ]);
      };

      socket.on('connect', () => {
        addMessage('Connected to Socket.IO server');
      });

      socket.on('disconnect', (reason) => {
        addMessage(`Disconnected: ${reason}`);
      });

      socket.on('connect_error', (error) => {
        addMessage(
          `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      });

      socket.on('ping:new', (ping) => {
        addMessage(`Received ping: ${JSON.stringify(ping)}`);
      });

      socket.on('webhook:new', (event) => {
        addMessage(`Received webhook: ${JSON.stringify(event)}`);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('ping:new');
        socket.off('webhook:new');
      };
    } else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // Show message when Socket.IO is disabled on Vercel
      setMessages((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: Socket.IO disabled for Vercel deployment`,
      ]);
    }
  }, [socket]);

  const sendTestMessage = () => {
    if (socket) {
      socket.emit('test-message', { message: 'Hello from client!' });
    } else {
      setMessages((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: Cannot send message - Socket.IO not available`,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Socket.IO Connection Test</h1>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <div
              className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-lg">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {connectionError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Connection Error:</p>
              <p className="text-red-600">{connectionError}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <button
            onClick={sendTestMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send Test Message
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet...</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={index} className="text-sm font-mono">
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
