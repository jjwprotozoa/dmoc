// FILE: src/server/api/routers/manifest.ts
// Manifest router with getAll and list procedures - Updated with new fields
import { db } from "@/lib/db";
import { protectedProcedure, router } from "@/server/api/trpc";
import { getSignedPutUrl, objectUri } from "@/server/lib/storage";
import { z } from "zod";

// Helper – ensure tenant isolation, but allow admin to see everything
function whereTenant(tenantId: string | undefined, userRole?: string) {
  // If user is ADMIN, don't filter by tenant (can see everything)
  if (userRole === 'ADMIN') {
    console.log('🔓 [Admin] Bypassing tenant isolation - can see all manifests');
    return {};
  }
  // For non-admin users, tenantId must be provided
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }
  return { tenantId };
}

export const manifestRouter = router({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      console.log('🔍 [Manifest Router] getAll called');
      console.log('👤 User session:', {
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        tenantId: ctx.session.user.tenantId,
        tenantSlug: ctx.session.user.tenantSlug,
        role: ctx.session.user.role
      });
      
      // CRITICAL: Ensure tenantId exists (required for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId && ctx.session.user.role !== 'ADMIN') {
        throw new Error("Tenant ID is required");
      }
      console.log('🏢 Using tenantId:', tenantId);
      console.log('👑 User role:', ctx.session.user.role);
      
      try {
        console.log('🗄️ [Database] Testing connection...');
        await db.$connect();
        console.log('✅ [Database] Connection successful');
        
        console.log('🔍 [Database] Querying manifests...');
        const manifests = await db.manifest.findMany({
          where: whereTenant(tenantId, ctx.session.user.role),
          orderBy: { dateTimeAdded: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            trackingId: true,
            tripStateId: true,
            routeId: true,
            clientId: true,
            transporterId: true,
            companyId: true,
            horseId: true,
            trailerId1: true,
            trailerId2: true,
            locationId: true,
            parkLocationId: true,
            countryId: true,
            invoiceStateId: true,
            invoiceNumber: true,
            rmn: true,
            jobNumber: true,
            scheduledAt: true,
            dateTimeAdded: true,
            dateTimeUpdated: true,
            dateTimeEnded: true,
            // Relations
            invoiceState: { select: { name: true, code: true } },
            company: { select: { id: true, name: true } },
            route: { select: { id: true, name: true } },
            location: { select: { id: true, description: true, latitude: true, longitude: true } },
            parkLocation: { select: { id: true, description: true, latitude: true, longitude: true } },
          },
        });

        console.log('📊 [Database] Query result:', {
          count: manifests.length,
          manifests: manifests.map(m => ({
            id: m.id.slice(-8),
            title: m.title,
            status: m.status,
            trackingId: m.trackingId,
            company: m.company?.name
          }))
        });

        const result = manifests.map(manifest => ({
          ...manifest,
          createdAt: manifest.dateTimeAdded, // Map for UI compatibility
        }));
        
        console.log('✅ [Manifest Router] getAll returning', result.length, 'manifests');
        return result;
      } catch (error) {
        console.error('❌ [Manifest Router] getAll error:', error);
        throw error;
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
        status: z.array(z.string()).optional(),
        activeOnly: z.boolean().optional(),
        dateRange: z.enum(['today', 'yesterday', 'week', 'month', 'custom', 'all']).optional(),
        customDateFrom: z.string().optional(),
        customDateTo: z.string().optional(),
        staleness: z.enum(['fresh', 'stale', 'old', 'all']).optional(),
        quickFilter: z.enum(['all', 'active', 'waiting', 'breakdown', 'accident', 'logistical', 'closed', 'handed_over', 'foreign']).optional(),
        take: z.number().min(1).max(100).default(20),
        skip: z.number().min(0).default(0),
        cursor: z.string().optional(), // string cursor for cuid
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log('🔍 [Manifest Router] list called with input:', input);
      console.log('👤 User session:', {
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        tenantId: ctx.session.user.tenantId,
        tenantSlug: ctx.session.user.tenantSlug,
        role: ctx.session.user.role
      });
      
      // CRITICAL: Ensure tenantId exists (required for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId && ctx.session.user.role !== 'ADMIN') {
        throw new Error("Tenant ID is required");
      }
      console.log('🏢 Using tenantId:', tenantId);
      console.log('👑 User role:', ctx.session.user.role);
      
      try {
        console.log('🗄️ [Database] Testing connection...');
        await db.$connect();
        console.log('✅ [Database] Connection successful');
        
        // Build where clause with proper typing
        const where: Record<string, unknown> = {
          ...whereTenant(tenantId, ctx.session.user.role),
        };
        
        console.log('🔍 [Database] Base where clause:', where);
        
        // Text search across multiple fields
        if (input.q) {
          where.OR = [
            { title: { contains: input.q } },
            { trackingId: { contains: input.q } },
            { jobNumber: { contains: input.q } },
            { rmn: { contains: input.q } },
          ].filter(Boolean);
          console.log('🔍 [Database] Added search filter:', where.OR);
        }
        
        // Status filtering
        if (input.status && input.status.length > 0) {
          where.status = { in: input.status };
          console.log('🔍 [Database] Added status filter:', where.status);
        }
        
        // Active-only filtering (not ended and updated recently)
        if (input.activeOnly) {
          const activeHours = parseInt(process.env.ACTIVE_HOURS || '48', 10);
          const cutoffTime = new Date(Date.now() - activeHours * 60 * 60 * 1000);
          
          where.AND = [
            { dateTimeEnded: null }, // Not ended
            { dateTimeUpdated: { gte: cutoffTime } }, // Updated recently
          ];
          console.log('🔍 [Database] Added active filter:', where.AND);
        }

        // Date range filtering
        if (input.dateRange && input.dateRange !== 'all') {
          const now = new Date();
          let dateFrom: Date | undefined;
          let dateTo: Date = now;

          switch (input.dateRange) {
            case 'today':
              dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'yesterday':
              dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
              dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'week':
              dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'month':
              dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'custom':
              if (input.customDateFrom) {
                dateFrom = new Date(input.customDateFrom);
              }
              if (input.customDateTo) {
                dateTo = new Date(input.customDateTo);
                dateTo.setHours(23, 59, 59, 999); // End of day
              }
              break;
            default:
              break;
          }

          if (dateFrom) {
            where.dateTimeAdded = {
              gte: dateFrom,
              ...(dateTo && { lte: dateTo })
            };
            console.log('🔍 [Database] Added date range filter:', { dateFrom, dateTo });
          }
        }

        // Staleness filtering
        if (input.staleness && input.staleness !== 'all') {
          const now = new Date();
          let cutoffTime: Date | undefined;

          switch (input.staleness) {
            case 'fresh':
              cutoffTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes
              break;
            case 'stale':
              cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours
              where.dateTimeUpdated = {
                gte: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                lt: new Date(now.getTime() - 30 * 60 * 1000)
              };
              break;
            case 'old':
              cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours
              where.dateTimeUpdated = { lt: cutoffTime };
              break;
            default:
              break;
          }

          if (input.staleness === 'fresh' && cutoffTime) {
            where.dateTimeUpdated = { gte: cutoffTime };
          }
          console.log('🔍 [Database] Added staleness filter:', input.staleness);
        }

        // Quick filter logic (similar to Windows app categories)
        if (input.quickFilter && input.quickFilter !== 'all') {
          switch (input.quickFilter) {
            case 'active':
              where.status = { in: ['IN_PROGRESS', 'SCHEDULED'] };
              where.dateTimeEnded = null;
              break;
            case 'waiting':
              // This would need additional logic based on business rules
              where.status = 'SCHEDULED';
              break;
            case 'breakdown':
              // This would need additional logic based on business rules
              where.status = 'IN_PROGRESS';
              break;
            case 'accident':
              // This would need additional logic based on business rules
              where.status = 'IN_PROGRESS';
              break;
            case 'logistical':
              // This would need additional logic based on business rules
              where.status = 'IN_PROGRESS';
              break;
            case 'closed':
              where.status = 'COMPLETED';
              break;
            case 'handed_over':
              where.status = 'COMPLETED';
              break;
            case 'foreign':
              // This would need additional logic based on business rules
              where.status = { in: ['IN_PROGRESS', 'SCHEDULED'] };
              break;
          }
          console.log('🔍 [Database] Added quick filter:', input.quickFilter);
        }
        
        console.log('🔍 [Database] Final where clause:', JSON.stringify(where, null, 2));
        
        console.log('🔍 [Database] Querying manifests with pagination...');
        const [rows, total] = await Promise.all([
          db.manifest.findMany({
            where,
            take: input.take,
            skip: input.skip,
            orderBy: { dateTimeUpdated: 'desc' },
            select: {
              id: true,
              title: true,
              status: true,
              trackingId: true,
              tripStateId: true,
              routeId: true,
              clientId: true,
              transporterId: true,
              companyId: true,
              horseId: true,
              trailerId1: true,
              trailerId2: true,
              locationId: true,
              parkLocationId: true,
              countryId: true,
              invoiceStateId: true,
              invoiceNumber: true,
              rmn: true,
              jobNumber: true,
              scheduledAt: true,
              dateTimeAdded: true,
              dateTimeUpdated: true,
              dateTimeEnded: true,
              // Relations
              invoiceState: { select: { name: true, code: true } },
              company: { select: { id: true, name: true } },
              route: { select: { id: true, name: true } },
              location: { select: { id: true, description: true, latitude: true, longitude: true } },
              parkLocation: { select: { id: true, description: true, latitude: true, longitude: true } },
            },
          }),
          db.manifest.count({ where }),
        ]);

        console.log('📊 [Database] Query result:', {
          rowsCount: rows.length,
          totalCount: total,
          pagination: { take: input.take, skip: input.skip },
          rows: rows.map(r => ({
            id: r.id.slice(-8),
            title: r.title,
            status: r.status,
            trackingId: r.trackingId,
            company: r.company?.name,
            dateTimeUpdated: r.dateTimeUpdated
          }))
        });

        const result = { 
          items: rows.map(row => ({
            ...row,
            createdAt: row.dateTimeAdded, // Map for UI compatibility
          })), 
          total,
          hasMore: input.skip + input.take < total,
        };
        
        console.log('✅ [Manifest Router] list returning:', {
          itemsCount: result.items.length,
          total: result.total,
          hasMore: result.hasMore
        });
        
        return result;
      } catch (error) {
        console.error('❌ [Manifest Router] list error:', error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // CRITICAL: Ensure tenantId exists (required for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId && ctx.session.user.role !== 'ADMIN') {
        throw new Error("Tenant ID is required");
      }

      const row = await db.manifest.findFirst({
        where: tenantId ? { id: input.id, tenantId } : { id: input.id },
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
        title: z.string().optional(),
        trackingId: z.string().min(1),
        status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
        scheduledAt: z.date().optional(),
        routeId: z.string().optional(),
        locationId: z.string().optional(),
        invoiceStateId: z.string().optional(),
        companyId: z.string().optional(),
        rmn: z.string().optional(),
        jobNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }

      const created = await db.manifest.create({
        data: {
          tenantId,
          title: input.title || input.trackingId,
          trackingId: input.trackingId,
          status: input.status || "SCHEDULED",
          scheduledAt: input.scheduledAt || new Date(),
          routeId: input.routeId,
          locationId: input.locationId,
          invoiceStateId: input.invoiceStateId,
          companyId: input.companyId,
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
          title: z.string().optional(),
          status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
          scheduledAt: z.date().optional(),
          routeId: z.string().optional(),
          locationId: z.string().optional(),
          invoiceStateId: z.string().optional(),
          companyId: z.string().optional(),
          rmn: z.string().optional(),
          jobNumber: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      const existing = await db.manifest.findFirst({
        where: { id: input.id, tenantId },
      });
      if (!existing) throw new Error("Manifest not found.");

      const updated = await db.manifest.update({
        where: { id: existing.id },
        data: {
          ...input.patch,
        },
        select: { id: true },
      });

      // Create audit trail separately
      await db.manifestAudit.create({
        data: {
          tenantId,
          manifestId: existing.id,
          action: "update",
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(input.patch),
        },
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
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }

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
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
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
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
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
      // CRITICAL: Ensure tenantId exists (required for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId && ctx.session.user.role !== 'ADMIN') {
        throw new Error("Tenant ID is required");
      }
      const [m, locs, media] = await Promise.all([
        db.manifest.findFirst({
          where: tenantId ? { id: input.manifestId, tenantId } : { id: input.manifestId },
          select: { id: true },
        }),
        db.manifestLocation.findMany({
          where: tenantId ? { tenantId, manifestId: input.manifestId } : { manifestId: input.manifestId },
          orderBy: { recordedAt: "asc" },
        }),
        db.whatsappData.findMany({
          where: tenantId ? { tenantId, manifestId: input.manifestId } : { manifestId: input.manifestId },
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
      // CRITICAL: Ensure tenantId exists (required for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId && ctx.session.user.role !== 'ADMIN') {
        throw new Error("Tenant ID is required");
      }
      return db.manifestAudit.findMany({
        where: tenantId ? { tenantId, manifestId: input.manifestId } : { manifestId: input.manifestId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get filter counts for the filter component
  getFilterCounts: protectedProcedure
    .query(async ({ ctx }) => {
      // CRITICAL: Ensure tenantId exists (whereTenant will validate for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      const baseWhere = whereTenant(tenantId, ctx.session.user.role);
      
      try {
        const [
          total,
          active,
          waiting,
          breakdown,
          accident,
          logistical,
          closed,
          handedOver,
          foreign
        ] = await Promise.all([
          // Total count
          db.manifest.count({ where: baseWhere }),
          
          // Active (IN_PROGRESS + SCHEDULED, not ended)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: { in: ['IN_PROGRESS', 'SCHEDULED'] },
              dateTimeEnded: null,
            }
          }),
          
          // Waiting for docs (SCHEDULED)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'SCHEDULED',
            }
          }),
          
          // Breakdown (IN_PROGRESS - would need additional business logic)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
            }
          }),
          
          // Accident (IN_PROGRESS - would need additional business logic)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
            }
          }),
          
          // Logistical issues (IN_PROGRESS - would need additional business logic)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
            }
          }),
          
          // Closed (COMPLETED)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'COMPLETED',
            }
          }),
          
          // Handed over (COMPLETED - would need additional business logic)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'COMPLETED',
            }
          }),
          
          // Foreign horse and driver (IN_PROGRESS + SCHEDULED - would need additional business logic)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: { in: ['IN_PROGRESS', 'SCHEDULED'] },
            }
          }),
        ]);

        return {
          all: total,
          active,
          waiting,
          breakdown,
          accident,
          logistical,
          closed,
          handed_over: handedOver,
          foreign,
          total,
        };
      } catch (error) {
        console.error('❌ [Manifest Router] getFilterCounts error:', error);
        throw error;
      }
    }),

  // Display dashboard - optimized for display screens with configurable filters
  getDisplayDashboard: protectedProcedure
    .input(
      z.object({
        statusFilters: z.array(z.string()).optional(),
        highPriorityOnly: z.boolean().optional(),
        maxResults: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // CRITICAL: Ensure tenantId exists (whereTenant will validate for non-ADMIN users)
      const tenantId = ctx.session.user.tenantId;
      const baseWhere = whereTenant(tenantId, ctx.session.user.role);
      
      const {
        statusFilters = ['IN_PROGRESS', 'SCHEDULED'], // Default to active manifests
        highPriorityOnly = false,
        maxResults = 1000, // Default limit
      } = input || {};
      
      try {
        console.log('📺 [Display Dashboard] Getting dashboard data for tenant:', tenantId);
        console.log('🔍 [Display Dashboard] Filters:', { statusFilters, highPriorityOnly, maxResults });
        
        // Build where clause for manifests
        const manifestWhere = {
          ...baseWhere,
          status: { in: statusFilters },
          ...(highPriorityOnly && {
            OR: [
              // High priority: recently updated (< 2 hours)
              { dateTimeUpdated: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
              // High priority: critical statuses
              { status: { in: ['IN_PROGRESS'] } },
            ]
          })
        };
        
        // Get critical manifests (stale > 2 hours or specific statuses)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const criticalManifests = await db.manifest.findMany({
          where: {
            ...baseWhere,
            OR: [
              // Stale manifests (>2 hours without update)
              {
                dateTimeUpdated: { lt: twoHoursAgo },
                status: { in: ['IN_PROGRESS', 'SCHEDULED'] },
                dateTimeEnded: null,
              },
              // Cancelled manifests
              { status: 'CANCELLED' },
              // Long-running manifests (>4 hours in progress)
              {
                status: 'IN_PROGRESS',
                dateTimeUpdated: { lt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
                dateTimeEnded: null,
              }
            ]
          },
          orderBy: { dateTimeUpdated: 'asc' }, // Oldest first for critical alerts
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            trackingId: true,
            companyId: true,
            horseId: true,
            trailerId1: true,
            trailerId2: true,
            scheduledAt: true,
            dateTimeAdded: true,
            dateTimeUpdated: true,
            dateTimeEnded: true,
            company: { select: { id: true, name: true } },
            route: { select: { id: true, name: true } },
            location: { select: { id: true, description: true, latitude: true, longitude: true } },
          },
        });

        // Get filtered manifests based on configuration
        const filteredManifests = await db.manifest.findMany({
          where: manifestWhere,
          orderBy: { dateTimeUpdated: 'desc' },
          take: maxResults,
          select: {
            id: true,
            title: true,
            status: true,
            trackingId: true,
            companyId: true,
            horseId: true,
            trailerId1: true,
            trailerId2: true,
            scheduledAt: true,
            dateTimeAdded: true,
            dateTimeUpdated: true,
            dateTimeEnded: true,
            company: { select: { id: true, name: true } },
            route: { select: { id: true, name: true } },
            location: { select: { id: true, description: true, latitude: true, longitude: true } },
          },
        });

        // Get stats - use actual manifest statuses from schema
        const [
          total,
          active,
          waiting,
          breakdown,
          accident,
          logistical,
          closed,
          handedOver,
          foreign
        ] = await Promise.all([
          db.manifest.count({ where: baseWhere }),
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
              dateTimeEnded: null,
            }
          }),
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'SCHEDULED',
            }
          }),
          // Breakdown: long-running IN_PROGRESS manifests (>4 hours)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
              dateTimeUpdated: { lt: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // >4 hours
              dateTimeEnded: null,
            }
          }),
          // Accident: manifests with accident-related tracking IDs or job numbers
          db.manifest.count({
            where: {
              ...baseWhere,
              OR: [
                { trackingId: { contains: 'ACCIDENT' } },
                { jobNumber: { contains: 'ACCIDENT' } },
                { title: { contains: 'ACCIDENT' } }
              ]
            }
          }),
          // Logistical: manifests with logistical issues (stale >2 hours)
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'IN_PROGRESS',
              dateTimeUpdated: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // >2 hours
              dateTimeEnded: null,
            }
          }),
          db.manifest.count({
            where: {
              ...baseWhere,
              status: 'COMPLETED',
            }
          }),
          // Handed Over: manifests with HANDED_OVER in tracking or job number
          db.manifest.count({
            where: {
              ...baseWhere,
              OR: [
                { trackingId: { contains: 'HANDED_OVER' } },
                { jobNumber: { contains: 'HANDED_OVER' } },
                { title: { contains: 'HANDED_OVER' } }
              ]
            }
          }),
          // Foreign: manifests with foreign country IDs or tracking IDs
          db.manifest.count({
            where: {
              ...baseWhere,
              OR: [
                { countryId: { not: null } }, // Has country ID
                { trackingId: { contains: 'FOREIGN' } },
                { trackingId: { contains: 'INTL' } }
              ]
            }
          }),
        ]);

        const result = {
          criticalManifests: criticalManifests.map(m => ({
            ...m,
            createdAt: m.dateTimeAdded,
          })),
          highPriorityManifests: filteredManifests.map(m => ({
            ...m,
            createdAt: m.dateTimeAdded,
          })),
          stats: {
            total,
            active,
            waiting,
            breakdown,
            accident,
            logistical,
            closed,
            handed_over: handedOver,
            foreign,
          },
          lastUpdated: new Date().toISOString(),
          filters: {
            statusFilters,
            highPriorityOnly,
            maxResults,
          },
        };

        console.log('📺 [Display Dashboard] Returning:', {
          criticalCount: result.criticalManifests.length,
          filteredCount: result.highPriorityManifests.length,
          stats: result.stats,
          filters: result.filters,
        });

        return result;
      } catch (error) {
        console.error('❌ [Display Dashboard] Error:', error);
        throw error;
      }
    }),
});