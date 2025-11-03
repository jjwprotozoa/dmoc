// src/features/driver/mock.ts
// Mock data for driver app MVP (replaced with backend integration later)

import { ManifestTrip, TrackerSignal } from "./types";

export const mockTrips: ManifestTrip[] = [
  {
    id: "M-1001",
    jobNumber: "J-8842",
    clientName: "C****",
    routeName: "Cape Town → Paarl",
    vehicle: { id: "V-12", name: "Horse 12", plate: "CA 123-456" },
    state: "unstarted",
    eta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    lastSignal: {
      trackerId: "T-7938",
      source: "traccar",
      lat: -33.9249,
      lng: 18.4241,
      fixTime: new Date().toISOString(),
    } as TrackerSignal,
    stops: [
      { id: "S-1", name: "Depot", lat: -33.93, lng: 18.42, reached: false },
      { id: "S-2", name: "Client A", lat: -33.72, lng: 18.96, reached: false },
    ],
  },
  {
    id: "M-1002",
    jobNumber: "J-8843",
    clientName: "D****",
    routeName: "CT → Malmesbury",
    vehicle: { id: "V-18", name: "Horse 18", plate: "CA 987-654" },
    state: "enroute",
    eta: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    stops: [
      { id: "S-3", name: "Depot", lat: -33.93, lng: 18.42, reached: true },
      { id: "S-4", name: "Client B", lat: -33.46, lng: 18.73, reached: false },
    ],
  },
];

