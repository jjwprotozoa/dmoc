// src/app/api/health/route.ts
// Health check endpoint for production debugging
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health: {
      status: string;
      timestamp: string;
      environment: string;
      nextAuthUrl: string | undefined;
      nextAuthSecret: string;
      databaseUrl: string;
      vercelUrl: string | undefined;
      vercelEnv: string | undefined;
      dbConfigured?: boolean;
      dbConnected?: boolean;
      dbError?: string;
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      vercelUrl: process.env.VERCEL_URL,
      vercelEnv: process.env.VERCEL_ENV,
    };

    // Only test database connectivity if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        await db.$queryRaw`SELECT 1`;
        health.dbConfigured = true;
        health.dbConnected = true;
      } catch (dbError) {
        health.dbConfigured = true;
        health.dbConnected = false;
        health.dbError = dbError instanceof Error ? dbError.message : 'Unknown error';
      }
    } else {
      health.dbConfigured = false;
      health.dbConnected = false;
    }

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
