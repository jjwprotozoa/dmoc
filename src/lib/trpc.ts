// src/lib/trpc.ts
'use client';

import { type AppRouter } from '@/server/api/root';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const TRPCProvider = trpc.Provider;

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});
