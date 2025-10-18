// src/app/api/traccar/positions/route.ts
// Traccar positions endpoint
import { ensureConfigured } from '@/lib/env';
import { latestPositions } from '@/services/traccarService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Traccar is configured
    ensureConfigured(['TRACCAR_BASE_URL', 'TRACCAR_TOKEN']);
    
    const { searchParams } = new URL(request.url);
    const deviceIds = searchParams.get('deviceIds');
    
    const deviceIdArray = deviceIds 
      ? deviceIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;
    
    const positions = await latestPositions(deviceIdArray);
    
    return NextResponse.json({
      success: true,
      positions,
      count: positions.length,
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
        error: 'Failed to fetch Traccar positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
