// src/app/api/whatsapp/send/route.ts
// WhatsApp message sending endpoint
import { ensureConfigured } from '@/lib/env';
import { sendChatMessage } from '@/services/ultraMsgService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if UltraMsg is configured
    ensureConfigured(['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN']);
    
    const body = await request.json();
    const { to, message } = body;
    
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }
    
    const result = await sendChatMessage({ to, body: message });
    
    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Integration not configured')) {
      return NextResponse.json(
        { error: 'WhatsApp integration not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send WhatsApp message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
