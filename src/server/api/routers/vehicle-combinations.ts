// src/server/api/routers/vehicle-combinations.ts
import { z } from 'zod';
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
      try {
        if (!ctx.db) {
          console.warn('Database not available, returning empty array');
          return [];
        }

        const combinations = await ctx.db.vehicleCombination.findMany({
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
      } catch (error) {
        console.error('Error fetching vehicle combinations:', error);
        return [];
      }
    }),

  // Get combination by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        const combination = await ctx.db.vehicleCombination.findFirst({
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
      } catch (error) {
        console.error('Error fetching vehicle combination:', error);
        throw error;
      }
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
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        // Verify all vehicles belong to the tenant
        const vehicles = await ctx.db.vehicle.findMany({
          where: {
            id: { in: [input.horseId, ...input.trailerIds] },
            tenantId: ctx.session.user.tenantId,
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
        const combination = await ctx.db.vehicleCombination.create({
          data: {
            tenantId: ctx.session.user.tenantId,
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
      } catch (error) {
        console.error('Error creating vehicle combination:', error);
        throw error;
      }
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
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        const combination = await ctx.db.vehicleCombination.updateMany({
          where: {
            id: input.id,
            tenantId: ctx.session.user.tenantId,
          },
          data: {
            status: input.status,
          },
        });

        return combination;
      } catch (error) {
        console.error('Error updating vehicle combination status:', error);
        throw error;
      }
    }),

  // Disconnect combination (remove trailers)
  disconnect: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        // Remove all trailer connections
        await ctx.db.vehicleCombinationTrailer.deleteMany({
          where: {
            combinationId: input.id,
            combination: {
              tenantId: ctx.session.user.tenantId,
            },
          },
        });

        // Update combination status
        const combination = await ctx.db.vehicleCombination.updateMany({
          where: {
            id: input.id,
            tenantId: ctx.session.user.tenantId,
          },
          data: {
            status: 'Disconnected',
          },
        });

        return combination;
      } catch (error) {
        console.error('Error disconnecting vehicle combination:', error);
        throw error;
      }
    }),

  // Delete combination
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        // Delete trailer connections first
        await ctx.db.vehicleCombinationTrailer.deleteMany({
          where: {
            combinationId: input.id,
            combination: {
              tenantId: ctx.session.user.tenantId,
            },
          },
        });

        // Delete the combination
        const combination = await ctx.db.vehicleCombination.deleteMany({
          where: {
            id: input.id,
            tenantId: ctx.session.user.tenantId,
          },
        });

        return combination;
      } catch (error) {
        console.error('Error deleting vehicle combination:', error);
        throw error;
      }
    }),

  // Get combination statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        console.warn('Database not available, returning empty stats');
        return {
          totalCombinations: 0,
          activeCombinations: 0,
          inTransitCombinations: 0,
          loadingCombinations: 0,
        };
      }

      const [
        totalCombinations,
        activeCombinations,
        inTransitCombinations,
        loadingCombinations,
      ] = await Promise.all([
        ctx.db.vehicleCombination.count({
          where: { tenantId: ctx.session.user.tenantId },
        }),
        ctx.db.vehicleCombination.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            status: 'Active',
          },
        }),
        ctx.db.vehicleCombination.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            status: 'In Transit',
          },
        }),
        ctx.db.vehicleCombination.count({
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
    } catch (error) {
      console.error('Error fetching vehicle combination stats:', error);
      return {
        totalCombinations: 0,
        activeCombinations: 0,
        inTransitCombinations: 0,
        loadingCombinations: 0,
      };
    }
  }),
});
