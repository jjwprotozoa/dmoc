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

  return {
    session,
    db,
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
      session: {
        ...ctx.session,
        user: ctx.session.user as typeof ctx.session.user & {
          driverId?: string | null;
        },
      },
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
