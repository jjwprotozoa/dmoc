// src/server/api/trpc.ts
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';

export const createTRPCContext = async () => {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn('Failed to get session during build:', error);
  }

  // Ensure database connection is available
  let dbConnection = null;
  try {
    dbConnection = db;
    // Test the connection
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Database connection failed:', error);
    // In Vercel, we might not have a database connection during build
    if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
      console.warn('Database not available in Vercel build environment');
    } else {
      throw error;
    }
  }

  /**
   * Helper function to require tenant ID for tenant-scoped routes.
   * Throws TRPCError if session, user, or tenantId is missing.
   * 
   * @returns The tenantId (guaranteed to be a string, never undefined)
   * @throws TRPCError with code UNAUTHORIZED if tenantId is missing
   * 
   * @example
   * // In a router that must be tenant-scoped
   * const tenantId = ctx.requireTenant();
   * await db.model.findMany({ where: { tenantId } });
   */
  const requireTenant = (): string => {
    if (!session || !session.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Session required',
      });
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Tenant ID is required for this operation',
      });
    }

    return tenantId;
  };

  return {
    session,
    db: dbConnection,
    requireTenant,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const createTRPCRouter = t.router; // Alias for compatibility with createTRPCRouter imports
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

/**
 * Middleware to enforce Digiwize admin access.
 * Allows access if:
 * - tenantSlug === "digiwize" OR
 * - role is in ["ADMIN", "SUPER_ADMIN", "DIGIWIZE_ADMIN"]
 */
const enforceDigiwizeAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Session required' });
  }

  const user = ctx.session.user;
  const tenantSlug = user.tenantSlug?.toLowerCase();
  const role = user.role?.toUpperCase();

  const isDigiwizeTenant = tenantSlug === 'digiwize';
  const isAdminRole = ['ADMIN', 'SUPER_ADMIN', 'DIGIWIZE_ADMIN'].includes(role || '');

  if (!isDigiwizeTenant && !isAdminRole) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access restricted to Digiwize administrators',
    });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const digiwizeAdminProcedure = t.procedure.use(enforceDigiwizeAdmin);