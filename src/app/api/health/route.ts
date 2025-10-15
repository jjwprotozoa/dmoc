// src/app/api/health/route.ts
// Health check endpoint for production debugging
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      vercelUrl: process.env.VERCEL_URL,
      vercelEnv: process.env.VERCEL_ENV,
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
