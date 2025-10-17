// src/app/api/whatsapp/webhook/route.ts
// WhatsApp webhook endpoint for receiving messages
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook payload for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));
    
    // TODO: Process the webhook payload
    // - Extract message content
    // - Store in database
    // - Trigger real-time updates via Socket.IO
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process WhatsApp webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Webhook verification endpoint
  return NextResponse.json({ 
    message: 'WhatsApp webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
