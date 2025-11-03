// src/server/api/routers/uploads.ts
import { uploadFile } from '@/lib/s3';
import { z } from 'zod';
import { db } from '@/lib/db';
import { protectedProcedure, router } from '../trpc';

export const uploadsRouter = router({
  uploadFile: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        data: z.string(), // base64 encoded data
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, 'base64');
      const key = `${input.entityType}/${input.entityId}/${Date.now()}-${input.fileName}`;

      const url = await uploadFile(key, buffer, input.mimeType);

      const attachment = await db.attachment.create({
        data: {
          entityType: input.entityType,
          entityId: input.entityId,
          url,
          mime: input.mimeType,
          meta: JSON.stringify({
            fileName: input.fileName,
            size: buffer.length,
          }),
        },
      });

      return attachment;
    }),

  getAttachments: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const attachments = await db.attachment.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { createdAt: 'desc' },
      });

      return attachments;
    }),
});
