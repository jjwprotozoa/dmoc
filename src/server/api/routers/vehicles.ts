// src/server/api/routers/vehicles.ts
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, router } from '../trpc';

// Helper – ensure tenant isolation, but allow admin to see everything
function whereTenant(tenantId: string, userRole?: string) {
  // If user is ADMIN, don't filter by tenant (can see everything)
  if (userRole === 'ADMIN') {
    console.log('🔓 [Admin] Bypassing tenant isolation - can see all vehicles');
    return {};
  }
  return { tenantId };
}

export const vehiclesRouter = router({
  // Get all vehicles for a tenant
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(['horses', 'trailers', 'all']).optional(),
        status: z.string().optional(),
        includeInactive: z.boolean().optional(), // When true, includes inactive vehicles
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type, status, includeInactive } = input;

      console.log('🔍 [Vehicles Router] getAll called');
      console.log('👤 User session:', {
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        tenantId: ctx.session.user.tenantId,
        tenantSlug: ctx.session.user.tenantSlug,
        role: ctx.session.user.role
      });

      const tenantId = ctx.session.user.tenantId;
      console.log('🏢 Using tenantId:', tenantId);

      if (!tenantId) {
        console.error('❌ [Vehicles Router] No tenantId in session');
        throw new Error('User tenant not found');
      }

      const where: Prisma.VehicleWhereInput = {
        ...whereTenant(tenantId, ctx.session.user.role),
      };

      // Default to active vehicles only, unless:
      // 1. includeInactive is explicitly true, OR
      // 2. There's a search query (to allow finding inactive vehicles via search)
      // When searching, we want to find vehicles regardless of status
      if (!search && !includeInactive) {
        where.status = 'Active';
      }
      // If searching, don't filter by status (search across all vehicles)
      // If includeInactive is true, don't filter by status (show all)

      if (search) {
        where.OR = [
          { registration: { contains: search } },
          { countryOfOrigin: { contains: search } },
          { entityTypeDescription: { contains: search } },
          { currentDriver: { contains: search } },
          { location: { contains: search } },
        ];
      }

      if (type && type !== 'all') {
        where.entityTypeDescription = type === 'horses' ? 'HORSE' : 'TRAILER';
      }

      // If status is explicitly provided, use it (overrides the default active filter)
      if (status) {
        where.status = status;
      }

      console.log('🔍 [Vehicles Router] Query where clause:', JSON.stringify(where, null, 2));

      try {
        const vehicles = await db.vehicle.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        console.log(`✅ [Vehicles Router] Found ${vehicles.length} vehicles`);
        return vehicles;
      } catch (error: unknown) {
        console.error('❌ [Vehicles Router] Database error:', error);
        throw error;
      }
    }),

  // Get vehicle by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const where: Prisma.VehicleWhereInput = {
        id: input.id,
        ...whereTenant(tenantId, ctx.session.user.role),
      };
      
      const vehicle = await db.vehicle.findFirst({
        where,
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      return vehicle;
    }),

  // List vehicles with advanced filtering (similar to manifest.list)
  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
        status: z.array(z.string()).optional(),
        type: z.enum(['horses', 'trailers', 'all']).optional(),
        activeOnly: z.boolean().optional(),
        dateRange: z.enum(['today', 'yesterday', 'week', 'month', 'custom', 'all']).optional(),
        customDateFrom: z.string().optional(),
        customDateTo: z.string().optional(),
        take: z.number().min(1).max(100).default(50),
        skip: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      if (!tenantId) {
        throw new Error('User tenant not found');
      }

      console.log('🔍 [Vehicles Router] list called with input:', JSON.stringify(input, null, 2));
      console.log('👤 [Vehicles Router] User session:', {
        tenantId,
        role: ctx.session.user.role,
      });
      
      // Build base where clause with tenant isolation (admin bypass)
      const baseWhere = whereTenant(tenantId, ctx.session.user.role);
      
      // First check: count all vehicles for this tenant/admin (no filters)
      const totalForTenant = await db.vehicle.count({ where: baseWhere });
      console.log(`🔍 [Vehicles Router] Total vehicles accessible: ${totalForTenant} (${ctx.session.user.role === 'ADMIN' ? 'all tenants' : `tenant ${tenantId}`})`);

      const where: Prisma.VehicleWhereInput = {
        ...baseWhere,
      };

      // Text search across multiple fields
      if (input.q) {
        where.OR = [
          { registration: { contains: input.q } },
          { countryOfOrigin: { contains: input.q } },
          { entityTypeDescription: { contains: input.q } },
          { currentDriver: { contains: input.q } },
          { location: { contains: input.q } },
        ];
        console.log('🔍 [Vehicles Router] Added search filter with OR clause');
      }

      // Status filtering - only if explicitly provided
      if (input.status && input.status.length > 0) {
        where.status = { in: input.status };
        console.log('🔍 [Vehicles Router] Added status filter:', input.status);
      }
      // Removed activeOnly default filter - show all vehicles by default

      // Type filtering
      if (input.type && input.type !== 'all') {
        where.entityTypeDescription = input.type === 'horses' ? 'HORSE' : 'TRAILER';
        console.log('🔍 [Vehicles Router] Added type filter:', input.type);
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
              dateTo.setHours(23, 59, 59, 999);
            }
            break;
        }

        if (dateFrom) {
          where.createdAt = {
            gte: dateFrom,
            ...(dateTo && { lte: dateTo }),
          };
        }
      }

      console.log('🔍 [Vehicles Router] Final where clause:', JSON.stringify(where, null, 2));

      const [rows, total] = await Promise.all([
        db.vehicle.findMany({
          where,
          take: input.take,
          skip: input.skip,
          orderBy: { createdAt: 'desc' },
        }),
        db.vehicle.count({ where }),
      ]);

      console.log(`✅ [Vehicles Router] list returning ${rows.length} vehicles (total: ${total})`);
      if (rows.length === 0 && total === 0) {
        // Debug: check if any vehicles exist at all
        const allVehiclesCount = await db.vehicle.count({ where: baseWhere });
        console.log(`🔍 [Vehicles Router] Debug: Total accessible vehicles: ${allVehiclesCount}`);
        
        if (allVehiclesCount === 0 && ctx.session.user.role !== 'ADMIN') {
          // Check all tenants to see which one has vehicles
          const allTenants = await db.tenant.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              _count: { select: { vehicles: true } },
            },
          });
          console.log('🔍 [Vehicles Router] All tenants and their vehicle counts:');
          allTenants.forEach((t) => {
            console.log(`  - ${t.name} (${t.slug}): ${t._count.vehicles} vehicles - ID: ${t.id}`);
          });
        } else if (allVehiclesCount > 0) {
          // Sample a few vehicles to see their status
          const sampleVehicles = await db.vehicle.findMany({
            where: baseWhere,
            take: 5,
            select: { id: true, registration: true, status: true, entityTypeDescription: true, tenantId: true },
          });
          console.log('🔍 [Vehicles Router] Sample vehicles:', sampleVehicles);
        }
      }

      return {
        items: rows,
        total,
        hasMore: input.skip + input.take < total,
      };
    }),

  // Get filter counts for the filter component
  getFilterCounts: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;

    if (!tenantId) {
      throw new Error('User tenant not found');
    }

    const baseWhere: Prisma.VehicleWhereInput = {
      ...whereTenant(tenantId, ctx.session.user.role),
    };

    const [
      total,
      active,
      horses,
      trailers,
      maintenance,
      inTransit,
      outOfService,
    ] = await Promise.all([
      db.vehicle.count({ where: baseWhere }),
      db.vehicle.count({
        where: { ...baseWhere, status: 'Active' },
      }),
      db.vehicle.count({
        where: { ...baseWhere, entityTypeDescription: 'HORSE' },
      }),
      db.vehicle.count({
        where: { ...baseWhere, entityTypeDescription: 'TRAILER' },
      }),
      db.vehicle.count({
        where: { ...baseWhere, status: 'Maintenance' },
      }),
      db.vehicle.count({
        where: { ...baseWhere, status: 'In Transit' },
      }),
      db.vehicle.count({
        where: { ...baseWhere, status: 'Out of Service' },
      }),
    ]);

    return {
      all: total,
      active,
      horses,
      trailers,
      maintenance,
      inTransit,
      outOfService,
      total,
    };
  }),

  // Get vehicle statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.user.tenantId;
    const baseWhere: Prisma.VehicleWhereInput = {
      ...whereTenant(tenantId, ctx.session.user.role),
    };
    
    const [
      totalVehicles,
      activeVehicles,
      horses,
      trailers,
      maintenanceVehicles,
    ] = await Promise.all([
      db.vehicle.count({
        where: baseWhere,
      }),
      db.vehicle.count({
        where: {
          ...baseWhere,
          status: 'Active',
        },
      }),
      db.vehicle.count({
        where: {
          ...baseWhere,
          entityTypeDescription: 'HORSE',
        },
      }),
      db.vehicle.count({
        where: {
          ...baseWhere,
          entityTypeDescription: 'TRAILER',
        },
      }),
      db.vehicle.count({
        where: {
          ...baseWhere,
          status: 'Maintenance',
        },
      }),
    ]);

    return {
      totalVehicles,
      activeVehicles,
      horses,
      trailers,
      maintenanceVehicles,
    };
  }),
});
