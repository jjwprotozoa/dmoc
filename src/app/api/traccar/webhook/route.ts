// src/app/api/traccar/webhook/route.ts
// Traccar webhook endpoint for receiving GPS updates
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook payload for debugging
    console.log('Traccar webhook received:', JSON.stringify(body, null, 2));
    
    // TODO: Process the webhook payload
    // - Extract position data
    // - Store in database
    // - Update vehicle locations
    // - Trigger real-time updates via Socket.IO
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Traccar webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process Traccar webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Webhook verification endpoint
  return NextResponse.json({ 
    message: 'Traccar webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
