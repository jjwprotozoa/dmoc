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

  return {
    session,
    db: dbConnection,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
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
