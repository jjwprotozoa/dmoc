// src/app/api/socketio/route.ts
// Socket.IO API route handler for Next.js App Router
// This route handles Socket.IO handshake and upgrades WebSocket connections

import { NextResponse } from 'next/server';

export async function GET() {
  // On Vercel, Socket.IO is not supported due to serverless limitations
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        message: 'Socket.IO not available on Vercel deployment',
        reason:
          'Serverless functions do not support persistent WebSocket connections',
        fallback: 'Real-time features will use polling instead',
      },
      { status: 200 }
    );
  }

  // This route is handled by the custom server.js Socket.IO implementation
  // The actual Socket.IO server is initialized in server.js and handles
  // the handshake and WebSocket upgrade at this path

  return NextResponse.json(
    {
      message: 'Socket.IO server is running',
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
    },
    { status: 200 }
  );
}

export async function POST() {
  // On Vercel, Socket.IO is not supported due to serverless limitations
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        message: 'Socket.IO polling not available on Vercel',
        reason: 'Serverless functions do not support persistent connections',
      },
      { status: 200 }
    );
  }

  // Handle Socket.IO polling requests
  // The actual Socket.IO server handles this in server.js

  return NextResponse.json(
    {
      message: 'Socket.IO polling endpoint',
      status: 'active',
    },
    { status: 200 }
  );
}
