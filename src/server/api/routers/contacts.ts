// src/server/api/routers/contacts.ts
// Contacts router: tenant-scoped CRUD with E.164 phone storage

import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Helper – ensure tenant isolation, but allow admin to see everything
function whereTenant(tenantId: string, userRole?: string) {
  // If user is ADMIN, don't filter by tenant (can see everything)
  if (userRole === 'ADMIN') {
    console.log('🔓 [Admin] Bypassing tenant isolation - can see all contacts');
    return {};
  }
  return { tenantId };
}

// Contact input schema (without tenantId - derived from session)
const contactInput = z.object({
  name: z.string().min(1),
  contactNr: z.string().min(3), // E.164 validated on client; server can add stricter rules later
  idNumber: z.string().min(1),
  pictureLoaded: z.boolean().optional().default(false),
  countryOfOrigin: z.string().min(1),
  displayValue: z.string().min(1).optional(), // Optional - defaults to name if not provided
});

export const contactsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        take: z.number().min(1).max(100).optional().default(100),
        skip: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Tenant ID not found in session',
        });
      }

      const where: Prisma.ContactWhereInput = {
        ...whereTenant(tenantId, ctx.session.user.role),
      };

      if (input.search) {
        // Use type assertion for mode property (PostgreSQL supports it, SQLite ignores it)
        where.OR = [
          {
            name: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
          {
            contactNr: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
          {
            idNumber: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
          {
            countryOfOrigin: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
        ];
      }

      const [items, total] = await Promise.all([
        db.contact.findMany({
          where,
          take: input.take,
          skip: input.skip,
          orderBy: { updatedAt: 'desc' },
        }),
        db.contact.count({ where }),
      ]);
      return { items, total };
    }),

  create: protectedProcedure
    .input(contactInput)
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Tenant ID not found in session',
        });
      }

      try {
        const contact = await db.contact.create({
          data: {
            tenantId,
            name: input.name,
            contactNr: input.contactNr,
            idNumber: input.idNumber,
            pictureLoaded: input.pictureLoaded ?? false,
            countryOfOrigin: input.countryOfOrigin,
            displayValue: input.displayValue || input.name,
          },
        });
        return contact;
      } catch (error) {
        console.error('Failed to create contact:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to create contact',
        });
      }
    }),

  update: protectedProcedure
    .input(contactInput.extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Tenant ID not found in session',
        });
      }

      const { id, ...data } = input;
      const whereBase = whereTenant(tenantId, ctx.session.user.role);
      const existing = await db.contact.findFirst({
        where: { id, ...whereBase },
      });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contact not found',
        });
      }

      return db.contact.update({
        where: { id },
        data: {
          ...data,
          displayValue: data.displayValue || data.name,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Tenant ID not found in session',
        });
      }

      const whereBase = whereTenant(tenantId, ctx.session.user.role);
      const existing = await db.contact.findFirst({
        where: { id: input.id, ...whereBase },
      });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contact not found',
        });
      }

      await db.contact.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
