// src/lib/trpc.ts
'use client';

import { type AppRouter } from '@/server/api/root';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const TRPCProvider = trpc.Provider;

// React Query client for use with TRPCProvider
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        console.log('🔍 [tRPC] Making request to /api/trpc');
        return {};
      },
    }),
  ],
});

// Vanilla tRPC client for imperative calls (outside React Query)
export const trpcVanillaClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        console.log('🔍 [tRPC] Making request to /api/trpc');
        return {};
      },
    }),
  ],
});
