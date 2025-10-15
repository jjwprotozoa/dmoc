// src/app/api/webhook/traccar/route.ts
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { webhookRateLimit } from '@/lib/rateLimit';
import { emitLocationPing } from '@/server/ws/socket';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const traccarWebhookSchema = z.object({
  deviceId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
  course: z.number().optional(),
  timestamp: z.string(),
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
    if (secret !== env.TRACCAR_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = traccarWebhookSchema.parse(body);

    // Find device by external ID
    const device = await db.device.findUnique({
      where: { externalId: validatedData.deviceId },
      include: { tenant: true },
    });

    if (!device) {
      logger.warn('Device not found for Traccar webhook', { 
        deviceId: validatedData.deviceId 
      });
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Create location ping
    const ping = await db.locationPing.create({
      data: {
        deviceId: device.id,
        lat: validatedData.latitude,
        lng: validatedData.longitude,
        speed: validatedData.speed,
        heading: validatedData.course,
        timestamp: new Date(validatedData.timestamp),
      },
    });

    // Update device last ping
    await db.device.update({
      where: { id: device.id },
      data: { lastPingAt: new Date(validatedData.timestamp) },
    });

    // Emit real-time update
    emitLocationPing(device.tenant.slug, {
      ...ping,
      device: {
        id: device.id,
        externalId: device.externalId,
      },
    });

    logger.info('Traccar webhook processed', {
      deviceId: device.externalId,
      tenantSlug: device.tenant.slug,
      pingId: ping.id,
    });

    return NextResponse.json({ success: true, pingId: ping.id });
  } catch (error) {
    logger.error('Traccar webhook error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
