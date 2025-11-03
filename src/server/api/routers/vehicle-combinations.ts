// src/server/api/routers/vehicle-combinations.ts
import { z } from 'zod';
import { db } from '@/lib/db';
import { protectedProcedure, router } from '../trpc';

export const vehicleCombinationsRouter = router({
  // Get all vehicle combinations for a tenant
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        driver: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const combinations = await db.vehicleCombination.findMany({
        where: {
          tenantId: ctx.session.user.tenantId,
          ...(input.status && { status: input.status }),
          ...(input.driver && { driver: { contains: input.driver } }),
        },
        include: {
          horse: true,
          trailers: {
            include: {
              trailer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return combinations;
    }),

  // Get combination by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const combination = await db.vehicleCombination.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          horse: true,
          trailers: {
            include: {
              trailer: true,
            },
          },
        },
      });

      if (!combination) {
        throw new Error('Vehicle combination not found');
      }

      return combination;
    }),

  // Create new vehicle combination
  create: protectedProcedure
    .input(
      z.object({
        horseId: z.string(),
        trailerIds: z.array(z.string()),
        driver: z.string(),
        status: z.string().default('Active'),
        startDate: z.date(),
        cargo: z.string().optional(),
        route: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // CRITICAL: Ensure tenantId exists (required for all mutations)
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }

      // Verify all vehicles belong to the tenant
      const vehicles = await db.vehicle.findMany({
        where: {
          id: { in: [input.horseId, ...input.trailerIds] },
          tenantId,
        },
      });

      if (vehicles.length !== input.trailerIds.length + 1) {
        throw new Error('One or more vehicles not found or not accessible');
      }

      const horse = vehicles.find(v => v.id === input.horseId);
      if (!horse || horse.entityTypeDescription !== 'HORSE') {
        throw new Error('Horse vehicle not found or invalid');
      }

      const trailers = vehicles.filter(v => input.trailerIds.includes(v.id));
      if (trailers.some(t => t.entityTypeDescription !== 'TRAILER')) {
        throw new Error('One or more trailer vehicles are invalid');
      }

      // Create the combination
      const combination = await db.vehicleCombination.create({
        data: {
          tenantId,
          horseId: input.horseId,
          driver: input.driver,
          status: input.status,
          startDate: input.startDate,
          cargo: input.cargo,
          route: input.route,
          trailers: {
            create: input.trailerIds.map(trailerId => ({
              trailerId,
            })),
          },
        },
        include: {
          horse: true,
          trailers: {
            include: {
              trailer: true,
            },
          },
        },
      });

      return combination;
    }),

  // Update combination status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const combination = await db.vehicleCombination.updateMany({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: {
          status: input.status,
        },
      });

      return combination;
    }),

  // Disconnect combination (remove trailers)
  disconnect: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Remove all trailer connections
      await db.vehicleCombinationTrailer.deleteMany({
        where: {
          combinationId: input.id,
          combination: {
            tenantId: ctx.session.user.tenantId,
          },
        },
      });

      // Update combination status
      const combination = await db.vehicleCombination.updateMany({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: {
          status: 'Disconnected',
        },
      });

      return combination;
    }),

  // Delete combination
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete trailer connections first
      await db.vehicleCombinationTrailer.deleteMany({
        where: {
          combinationId: input.id,
          combination: {
            tenantId: ctx.session.user.tenantId,
          },
        },
      });

      // Delete the combination
      const combination = await db.vehicleCombination.deleteMany({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return combination;
    }),

  // Get combination statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalCombinations,
      activeCombinations,
      inTransitCombinations,
      loadingCombinations,
    ] = await Promise.all([
      db.vehicleCombination.count({
        where: { tenantId: ctx.session.user.tenantId },
      }),
      db.vehicleCombination.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          status: 'Active',
        },
      }),
      db.vehicleCombination.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          status: 'In Transit',
        },
      }),
      db.vehicleCombination.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          status: 'Loading',
        },
      }),
    ]);

    return {
      totalCombinations,
      activeCombinations,
      inTransitCombinations,
      loadingCombinations,
    };
  }),
});
