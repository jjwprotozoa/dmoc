// src/app/api/integrations/status/route.ts
// Integration status endpoint - reports which integrations are configured
import { getIntegrationStatus } from '@/lib/env';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = getIntegrationStatus();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      integrations: {
        ultraMsg: {
          configured: status.ultraMsg,
          status: status.ultraMsg ? 'ready' : 'pending',
          required: ['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN'],
        },
        traccar: {
          configured: status.traccar,
          status: status.traccar ? 'ready' : 'pending',
          required: ['TRACCAR_BASE_URL', 'TRACCAR_TOKEN'],
        },
        tive: {
          configured: status.tive,
          status: status.tive ? 'ready' : 'pending',
          required: ['TIVE_API_KEY'],
        },
        database: {
          configured: status.db,
          status: status.db ? 'ready' : 'pending',
          required: ['DATABASE_URL'],
        },
      },
      summary: {
        total: 4,
        configured: Object.values(status).filter(Boolean).length,
        ready: Object.values(status).every(Boolean),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check integration status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
