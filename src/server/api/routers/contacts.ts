// src/server/api/routers/contacts.ts
// Contacts router: tenant-scoped CRUD with E.164 phone storage
// NOTE: tenant filtering standardized via buildTenantWhere(...).

import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { buildTenantWhere, getTenantId } from '../utils/tenant';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
      const where: Prisma.ContactWhereInput = {
        ...buildTenantWhere(ctx),
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
      const tenantId = getTenantId(ctx);

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
      const { id, ...data } = input;
      const existing = await db.contact.findFirst({
        where: buildTenantWhere(ctx, { id }),
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
      const existing = await db.contact.findFirst({
        where: buildTenantWhere(ctx, { id: input.id }),
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
