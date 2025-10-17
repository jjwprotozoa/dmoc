// src/services/traccarService.ts
// Traccar GPS tracking API service module
// Source: Context7:/websites/traccar-api-reference (retrieved 2025-01-17)
import { ensureConfigured, isIntegrationConfigured } from '@/lib/env';
import { http } from '@/lib/http';

const baseUrl = process.env.TRACCAR_BASE_URL;
const token = process.env.TRACCAR_TOKEN;

/**
 * Creates Traccar API client with authentication
 * @throws Error if required environment variables are not configured
 */
function client() {
  ensureConfigured(['TRACCAR_BASE_URL', 'TRACCAR_TOKEN']);
  
  return http(baseUrl!, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

/**
 * List all devices from Traccar
 * @returns Promise resolving to devices array
 */
export async function listDevices() {
  return client().get('/devices').then(r => r.data);
}

/**
 * Get latest positions for devices
 * @param deviceIds - Optional array of device IDs to filter by
 * @returns Promise resolving to positions array
 */
export async function latestPositions(deviceIds?: number[]) {
  const params = deviceIds?.length ? { deviceId: deviceIds.join(',') } : {};
  return client().get('/positions', { params }).then(r => r.data);
}

/**
 * Get events within a time period
 * @param params - Event query parameters
 * @returns Promise resolving to events array
 */
export async function events(params: {
  from: string;
  to: string;
  deviceId?: number;
}) {
  return client().get('/reports/events', { params }).then(r => r.data);
}

/**
 * Get route report for devices within time period
 * @param params - Route query parameters
 * @returns Promise resolving to positions array
 */
export async function routeReport(params: {
  from: string;
  to: string;
  deviceId?: number[];
  groupId?: number[];
}) {
  return client().get('/reports/route', { params }).then(r => r.data);
}

/**
 * Check if Traccar service is configured
 * @returns true if all required environment variables are set
 */
export function isTraccarConfigured(): boolean {
  return isIntegrationConfigured(['TRACCAR_BASE_URL', 'TRACCAR_TOKEN']);
}
