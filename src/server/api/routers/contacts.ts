// src/server/api/routers/contacts.ts
// Contacts router: tenant-scoped CRUD with E.164 phone storage

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// In real app, get tenantId from auth/session. For now, accept via input with validation.
const baseContact = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  contactNr: z.string().min(3), // E.164 validated on client; server can add stricter rules later
  idNumber: z.string().min(1),
  pictureLoaded: z.boolean().optional().default(false),
  countryOfOrigin: z.string().min(1),
  displayValue: z.string().min(1),
});

export const contactsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        tenantId: z.string().min(1),
        search: z.string().optional(),
        take: z.number().min(1).max(100).optional().default(24),
        skip: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        tenantId: input.tenantId,
        OR: input.search
          ? [
              { name: { contains: input.search, mode: 'insensitive' } },
              { contactNr: { contains: input.search } },
              { idNumber: { contains: input.search, mode: 'insensitive' } },
              { countryOfOrigin: { contains: input.search, mode: 'insensitive' } },
            ]
          : undefined,
      } as const;

      const [items, total] = await Promise.all([
        ctx.db.contact.findMany({ where, take: input.take, skip: input.skip, orderBy: { updatedAt: 'desc' } }),
        ctx.db.contact.count({ where }),
      ]);
      return { items, total };
    }),

  create: publicProcedure.input(baseContact).mutation(async ({ ctx, input }) => {
    try {
      const contact = await ctx.db.contact.create({ data: input });
      return contact;
    } catch {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to create contact' });
    }
  }),

  update: publicProcedure
    .input(
      baseContact.extend({ id: z.string().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await ctx.db.contact.findFirst({ where: { id, tenantId: data.tenantId } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' });
      return ctx.db.contact.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1), tenantId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.contact.findFirst({ where: { id: input.id, tenantId: input.tenantId } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' });
      await ctx.db.contact.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
