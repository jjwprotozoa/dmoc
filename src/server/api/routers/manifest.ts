// FILE: src/server/api/routers/manifest.ts
import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/lib/db";
import { getSignedPutUrl, objectUri } from "@/server/lib/storage";

// Helper – ensure tenant isolation
function whereTenant(tenantId: string) {
  return { tenantId };
}

export const manifestRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(), // string cursor for cuid
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const where = {
        ...whereTenant(tenantId),
        ...(input.q
          ? {
              OR: [
                { trackingId: { contains: input.q } },
                { jobNumber: { contains: input.q } },
                { rmn: { contains: input.q } },
              ],
            }
          : {}),
      };

      const rows = await db.manifest.findMany({
        where,
        take: input.limit + 1,
        skip: input.cursor ? 1 : 0,
        ...(input.cursor ? { cursor: { id: input.cursor } } : {}),
        orderBy: { dateTimeAdded: "desc" },
        select: {
          id: true,
          trackingId: true,
          jobNumber: true,
          rmn: true,
          invoiceState: { select: { name: true, code: true } },
          dateTimeUpdated: true,
        },
      });

      let nextCursor: string | undefined = undefined;
      if (rows.length > input.limit) {
        const next = rows.pop();
        nextCursor = next?.id;
      }
      return { items: rows, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      const row = await db.manifest.findFirst({
        where: { id: input.id, tenantId },
        include: {
          route: true,
          invoiceState: true,
          location: true,
          parkLocation: true,
          locations: {
            orderBy: { recordedAt: "asc" },
          },
          whatsapp: {
            include: {
              files: true,
              locations: true,
              media: true,
            },
          },
          audits: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });

      if (!row) {
        throw new Error("Manifest not found or not in tenant.");
      }
      return row;
    }),

  create: protectedProcedure
    .input(
      z.object({
        trackingId: z.string().min(1),
        routeId: z.string().optional(),
        locationId: z.string().optional(),
        invoiceStateId: z.string().optional(),
        rmn: z.string().optional(),
        jobNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      const created = await db.manifest.create({
        data: {
          tenantId,
          trackingId: input.trackingId,
          routeId: input.routeId,
          locationId: input.locationId,
          invoiceStateId: input.invoiceStateId,
          rmn: input.rmn,
          jobNumber: input.jobNumber,
          audits: {
            create: {
              tenantId,
              action: "create",
              oldValues: "{}",
              newValues: JSON.stringify(input),
            },
          },
        },
        select: { id: true },
      });

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        patch: z.object({
          routeId: z.string().optional(),
          locationId: z.string().optional(),
          invoiceStateId: z.string().optional(),
          rmn: z.string().optional(),
          jobNumber: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const existing = await db.manifest.findFirst({
        where: { id: input.id, tenantId },
      });
      if (!existing) throw new Error("Manifest not found.");

      const updated = await db.manifest.update({
        where: { id: existing.id },
        data: {
          ...input.patch,
          audits: {
            create: {
              tenantId,
              action: "update",
              oldValues: JSON.stringify(existing),
              newValues: JSON.stringify(input.patch),
            },
          },
        },
        select: { id: true },
      });

      return updated;
    }),

  addLocation: protectedProcedure
    .input(
      z.object({
        manifestId: z.string(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        recordedAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      // assert ownership
      const exists = await db.manifest.findFirst({
        where: { id: input.manifestId, tenantId },
        select: { id: true },
      });
      if (!exists) throw new Error("Manifest not found.");

      await db.manifestLocation.create({
        data: {
          tenantId,
          manifestId: input.manifestId,
          latitude: input.latitude,
          longitude: input.longitude,
          recordedAt: input.recordedAt ?? new Date(),
        },
      });

      return { ok: true };
    }),

  // Signed upload flow for media; return key + signed PUT URL
  getSignedUpload: protectedProcedure
    .input(
      z.object({
        manifestId: z.string(),
        kind: z.enum(["file", "media", "thumbnail"]),
        filename: z.string(),
        contentType: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const { manifestId, filename, contentType, kind } = input;

      const manifest = await db.manifest.findFirst({
        where: { id: manifestId, tenantId },
        select: { id: true },
      });
      if (!manifest) throw new Error("Manifest not found.");

      const key = `${tenantId}/manifests/${manifestId}/${Date.now()}_${filename}`;
      const url = await getSignedPutUrl(key, contentType);

      return { key, url, publicUri: objectUri(key), kind };
    }),

  // Attach uploaded object to Whatsapp* table
  attachMedia: protectedProcedure
    .input(
      z.object({
        manifestId: z.string(),
        parentId: z.string().optional(), // optional: existing WhatsappData
        type: z.enum(["file", "media"]),
        fileName: z.string(),
        uri: z.string().url(),
        mimeType: z.string().optional(),
        sizeBytes: z.number().optional(),
        checksum: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const { manifestId } = input;

      const manifest = await db.manifest.findFirst({
        where: { id: manifestId, tenantId },
        select: { id: true },
      });
      if (!manifest) throw new Error("Manifest not found.");

      const parent =
        input.parentId
          ? await db.whatsappData.findFirst({
              where: { id: input.parentId, tenantId, manifestId },
            })
          : await db.whatsappData.create({
              data: { tenantId, manifestId },
            });

      if (!parent) throw new Error("WhatsappData not found/created.");

      if (input.type === "file") {
        await db.whatsappFile.create({
          data: {
            tenantId,
            whatsappDataId: parent.id,
            fileName: input.fileName,
            uri: input.uri,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            checksum: input.checksum,
          },
        });
      } else {
        await db.whatsappMedia.create({
          data: {
            tenantId,
            whatsappDataId: parent.id,
            extension: input.fileName.split(".").pop() || undefined,
            link: null,
            uri: input.uri,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            checksum: input.checksum,
          },
        });
      }

      // audit trail
      await db.manifestAudit.create({
        data: {
          tenantId,
          manifestId,
          action: "attachMedia",
          oldValues: "{}",
          newValues: JSON.stringify(input),
        },
      });

      return { ok: true, parentId: parent.id };
    }),

  // Collated activity for timeline
  timeline: protectedProcedure
    .input(z.object({ manifestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const [m, locs, media] = await Promise.all([
        db.manifest.findFirst({
          where: { id: input.manifestId, tenantId },
          select: { id: true },
        }),
        db.manifestLocation.findMany({
          where: { tenantId, manifestId: input.manifestId },
          orderBy: { recordedAt: "asc" },
        }),
        db.whatsappData.findMany({
          where: { tenantId, manifestId: input.manifestId },
          include: { files: true, media: true, locations: true },
        }),
      ]);
      if (!m) throw new Error("Manifest not found.");
      return { locations: locs, whatsapp: media };
    }),

  audit: protectedProcedure
    .input(
      z.object({
        manifestId: z.string(),
        limit: z.number().min(1).max(200).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      return db.manifestAudit.findMany({
        where: { tenantId, manifestId: input.manifestId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),
});