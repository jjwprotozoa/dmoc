// src/services/ultraMsgService.ts
// UltraMsg WhatsApp API service module
// Source: Context7:/websites/ultramsg (retrieved 2025-01-17)
import { ensureConfigured, isIntegrationConfigured } from '@/lib/env';
import { http } from '@/lib/http';

const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
const token = process.env.ULTRAMSG_TOKEN;

/**
 * Creates UltraMsg API client with authentication
 * @throws Error if required environment variables are not configured
 */
function client() {
  ensureConfigured(['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN']);
  
  return http(`https://api.ultramsg.com/${instanceId}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: { token },
  });
}

/**
 * Send a text message via WhatsApp
 * @param params - Message parameters
 * @returns Promise resolving to API response
 */
export async function sendChatMessage({ 
  to, 
  body 
}: { 
  to: string; 
  body: string; 
}) {
  const c = client();
  return c.post('/messages/chat', { to, body });
}

/**
 * Send an image message via WhatsApp
 * @param params - Image message parameters
 * @returns Promise resolving to API response
 */
export async function sendImageMessage({ 
  to, 
  imageUrl, 
  caption 
}: { 
  to: string; 
  imageUrl: string; 
  caption?: string; 
}) {
  const c = client();
  return c.post('/messages/image', { 
    to, 
    image: imageUrl, 
    caption 
  });
}

/**
 * Send a document message via WhatsApp
 * @param params - Document message parameters
 * @returns Promise resolving to API response
 */
export async function sendDocumentMessage({ 
  to, 
  docUrl, 
  caption 
}: { 
  to: string; 
  docUrl: string; 
  caption?: string; 
}) {
  const c = client();
  return c.post('/messages/document', { 
    to, 
    document: docUrl, 
    caption 
  });
}

/**
 * Check if UltraMsg service is configured
 * @returns true if all required environment variables are set
 */
export function isUltraMsgConfigured(): boolean {
  return isIntegrationConfigured(['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN']);
}
