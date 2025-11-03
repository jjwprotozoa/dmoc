// src/features/driver/api.ts
// Driver API adapters using tRPC (server-enforced access control)

import { ManifestTrip, TrackerSignal } from "./types";

// Client-side API functions - these call tRPC which enforces driver access control
// Use these in client components (marked with "use client")

// For server components, use trpc directly:
// import { trpc } from "@/lib/trpc";
// const trips = await trpc.driver.getMyTrips.query({});

export async function listTodayTrips(): Promise<ManifestTrip[]> {
  // TODO: Replace with tRPC call when used in client component
  // For now, use mock data (server-side will use tRPC directly)
  const { mockTrips } = await import("./mock");
  return mockTrips;
}

export async function getTripById(manifestId: string): Promise<ManifestTrip | null> {
  // TODO: Replace with tRPC call when used in client component
  const { mockTrips } = await import("./mock");
  return mockTrips.find(t => t.id === manifestId) ?? null;
}

export async function sendDriverLocationBatch(args: {
  manifestId: string;
  driverId: string;
  positions: Array<Omit<TrackerSignal, "trackerId" | "source">>;
}): Promise<{ ok: true }> {
  // TODO: Implement via tRPC or direct API endpoint
  console.log("stub sendDriverLocationBatch", args);
  return { ok: true };
}

export async function createDriverEvent(args: {
  manifestId: string;
  driverId: string;
  type: "incident" | "fuel" | "note" | "pod" | "checklist";
  payload: unknown;
}): Promise<{ ok: true; id: string }> {
  // TODO: Replace with tRPC mutation
  // await trpc.driver.createEvent.mutate({ manifestId, type, payload });
  console.log("stub createDriverEvent", args);
  return { ok: true, id: crypto.randomUUID() };
}

