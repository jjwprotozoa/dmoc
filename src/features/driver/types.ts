// src/features/driver/types.ts
// Type definitions for driver-facing app module

export type TrackerSource = "traccar" | "tive" | "app";

export type TripState = "unstarted" | "enroute" | "arrived" | "delayed" | "completed";

export interface Driver {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
}

export interface TrackerSignal {
  trackerId: string;
  source: TrackerSource;
  lat: number;
  lng: number;
  speedKph?: number;
  headingDeg?: number;
  fixTime: string; // ISO
}

export interface ManifestTrip {
  id: string;
  jobNumber?: string;
  clientName?: string;     // show masked in UI: e.g. "C****"
  routeName?: string;
  vehicle?: Vehicle;
  state: TripState;
  eta?: string;            // ISO
  lastSignal?: TrackerSignal;
  stops: Array<{ id: string; name: string; lat: number; lng: number; reached?: boolean }>;
}

export type DriverEventType = "incident" | "fuel" | "note" | "pod" | "checklist";

export interface DriverEvent<T = unknown> {
  id: string;
  manifestId: string;
  driverId: string;
  type: DriverEventType;
  payload: T;
  createdAt: string; // ISO
  source: TrackerSource | "ui";
}

