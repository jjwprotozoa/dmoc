// src/app/api/traccar/devices/route.ts
// Traccar devices endpoint
import { ensureConfigured } from '@/lib/env';
import { listDevices } from '@/services/traccarService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Traccar is configured
    ensureConfigured(['TRACCAR_BASE_URL', 'TRACCAR_TOKEN']);
    
    const devices = await listDevices();
    
    return NextResponse.json({
      success: true,
      devices,
      count: devices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Integration not configured')) {
      return NextResponse.json(
        { error: 'Traccar integration not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Traccar devices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
