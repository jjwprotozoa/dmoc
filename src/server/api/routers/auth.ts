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
      try {
        if (!ctx.db) {
          console.error('[Auth Router] Database connection not available');
          throw new Error('Database connection not available');
        }

        const { identifier } = input;
        
        console.log('[Auth Router] Looking up user with identifier:', identifier);
        
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
          // Since Prisma's mode: 'insensitive' doesn't work on nullable fields in PostgreSQL,
          // fetch users with non-null names and filter in memory
          const usersWithNames = await ctx.db.user.findMany({
            where: {
              name: {
                not: null,
              },
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

          // Case-insensitive match in memory
          user = usersWithNames.find(
            (u) => u.name && u.name.toLowerCase() === identifier.toLowerCase()
          ) || null;
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
      } catch (error) {
        console.error('[Auth Router] Error in lookupByEmailOrUsername:', error);
        // Re-throw to let tRPC handle it properly
        throw error;
      }
    }),
});

