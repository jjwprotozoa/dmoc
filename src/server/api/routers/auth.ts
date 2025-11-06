// src/server/api/routers/auth.ts
// Authentication router for sign-in flow
// Provides lookupByEmailOrUsername endpoint for 2-step tenant-aware authentication
// Supports both email and username lookup (username stored in name field)

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const authRouter = createTRPCRouter({
  lookupByEmailOrUsername: publicProcedure
    .input(
      z.object({
        identifier: z.string().min(1, 'Email or username is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new Error('Database connection not available');
      }

      const { identifier } = input;
      
      // Check if identifier is an email (contains @)
      const isEmail = identifier.includes('@');
      
      let user;
      
      if (isEmail) {
        // For email, do exact match (case-insensitive via lowercase)
        user = await ctx.db.user.findFirst({
          where: {
            email: identifier.toLowerCase(),
          },
          include: {
            tenant: true,
            clientAccess: {
              include: {
                client: true,
              },
            },
          },
        });
      } else {
        // For username, use case-insensitive search on name field
        // Since name is nullable and Prisma doesn't support mode: 'insensitive' on nullable fields,
        // use raw SQL for case-insensitive matching
        const users = await ctx.db.$queryRaw<Array<{
          id: string;
          tenantId: string;
          email: string;
          name: string | null;
          passwordHash: string | null;
          role: string;
          tenantSlug: string | null;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
        }>>`
          SELECT u.*
          FROM users u
          WHERE u.name IS NOT NULL AND LOWER(u.name) = LOWER(${identifier})
          LIMIT 1
        `;
        
        if (users.length === 0) {
          user = null;
        } else {
          // Fetch the full user with relations
          user = await ctx.db.user.findUnique({
            where: { id: users[0].id },
            include: {
              tenant: true,
              clientAccess: {
                include: {
                  client: true,
                },
              },
            },
          });
        }
      }

      if (!user) {
        throw new Error(
          isEmail
            ? 'User not found with that email'
            : 'User not found with that username'
        );
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      return {
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug ?? user.tenant?.slug ?? null,
        tenantName: user.tenant?.name ?? null,
        role: user.role,
        clients: (user.clientAccess ?? []).map((uc) => ({
          id: uc.clientId,
          name: uc.client.name,
          displayValue: uc.client.displayValue,
        })),
      };
    }),
});

