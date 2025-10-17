// src/services/tiveService.ts
// Tive logistics tracking API service module
// Source: Context7:/websites/terminal49 (retrieved 2025-01-17)
import { ensureConfigured, isIntegrationConfigured } from '@/lib/env';
import { http } from '@/lib/http';

const baseUrl = process.env.TIVE_API_BASE_URL ?? 'https://platform.tive.com/api';
const apiKey = process.env.TIVE_API_KEY;

/**
 * Creates Tive API client with authentication
 * @throws Error if required environment variables are not configured
 */
function client() {
  ensureConfigured(['TIVE_API_KEY']);
  
  return http(baseUrl, {
    headers: { 
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/vnd.api+json'
    },
  });
}

/**
 * Get all tracked shipments
 * @returns Promise resolving to shipments array
 */
export async function getShipments() {
  return client().get('/v1/shipments').then(r => r.data);
}

/**
 * Get shipment by ID
 * @param shipmentId - The shipment ID to retrieve
 * @returns Promise resolving to shipment data
 */
export async function getShipment(shipmentId: string) {
  return client().get(`/v1/shipments/${shipmentId}`).then(r => r.data);
}

/**
 * Get all trackers
 * @returns Promise resolving to trackers array
 */
export async function getTrackers() {
  return client().get('/v1/trackers').then(r => r.data);
}

/**
 * Get tracker by ID
 * @param trackerId - The tracker ID to retrieve
 * @returns Promise resolving to tracker data
 */
export async function getTracker(trackerId: string) {
  return client().get(`/v1/trackers/${trackerId}`).then(r => r.data);
}

/**
 * Check if Tive service is configured
 * @returns true if all required environment variables are set
 */
export function isTiveConfigured(): boolean {
  return isIntegrationConfigured(['TIVE_API_KEY']);
}
