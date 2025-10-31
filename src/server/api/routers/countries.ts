// src/server/api/routers/countries.ts - tRPC router for country CRUD and lookup
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const countriesRouter = router({
  // List all countries
  list: publicProcedure.query(async () => {
    return db.country.findMany({ orderBy: { name: 'asc' } });
  }),

  // Get country by id
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.country.findUnique({ where: { id: input.id } });
    }),

  // Create country
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        abbreviation: z.string().min(2).max(4),
        flag: z.string().emoji().optional(),
        displayValue: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      // Auto-generate ID by finding max and incrementing
      const maxCountry = await db.country.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const nextId = (maxCountry?.id ?? 0) + 1;
      return db.country.create({ data: { ...input, id: nextId } });
    }),

  // Update country
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2),
        abbreviation: z.string().min(2).max(4),
        flag: z.string().emoji().optional(),
        displayValue: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      return db.country.update({
        where: { id: input.id },
        data: {
          name: input.name,
          abbreviation: input.abbreviation,
          flag: input.flag,
          displayValue: input.displayValue,
        },
      });
    }),

  // Delete country
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.country.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
