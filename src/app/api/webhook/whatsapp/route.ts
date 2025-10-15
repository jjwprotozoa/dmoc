// src/app/api/webhook/whatsapp/route.ts
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { webhookRateLimit } from '@/lib/rateLimit';
import { emitWebhookEvent } from '@/server/ws/socket';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const whatsappWebhookSchema = z.object({
  message: z.string(),
  phone: z.string(),
  timestamp: z.string(),
  imageUrl: z.string().optional(),
  mediaType: z.enum(['text', 'image', 'document']).default('text'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!webhookRateLimit.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verify webhook secret
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== env.WHATSAPP_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = whatsappWebhookSchema.parse(body);

    // Create webhook event
    const webhookEvent = await db.webhookEvent.create({
      data: {
        source: 'whatsapp',
        payload: validatedData,
        status: 'PENDING',
      },
    });

    // TODO: Enqueue job for processing WhatsApp message
    // This would typically use BullMQ to process the message
    // For now, we'll just mark it as completed
    await db.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { 
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Emit real-time update to all tenants (in a real app, you'd filter by tenant)
    const tenants = await db.tenant.findMany();
    for (const tenant of tenants) {
      emitWebhookEvent(tenant.slug, {
        ...webhookEvent,
        payload: validatedData,
      });
    }

    logger.info('WhatsApp webhook processed', {
      webhookId: webhookEvent.id,
      phone: validatedData.phone,
      messageType: validatedData.mediaType,
    });

    return NextResponse.json({ 
      success: true, 
      webhookId: webhookEvent.id 
    });
  } catch (error) {
    logger.error('WhatsApp webhook error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
