// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional().default('file:./dev.db'),

  // NextAuth
  NEXTAUTH_URL: z.string().optional().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32)
    .optional()
    .default('your-super-secret-jwt-key-that-is-at-least-32-characters-long'),

  // Redis
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),

  // S3 Storage
  S3_ENDPOINT: z.string().optional().default('http://localhost:9000'),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_BUCKET: z.string().optional().default('logistics-media'),
  S3_ACCESS_KEY_ID: z.string().optional().default('minioadmin'),
  S3_SECRET_ACCESS_KEY: z.string().optional().default('minioadmin'),

  // Webhook Secrets
  TRACCAR_WEBHOOK_SECRET: z.string().optional().default('traccar-secret-key'),
  WHATSAPP_WEBHOOK_SECRET: z.string().optional().default('whatsapp-secret-key'),

  // UltraMsg WhatsApp Integration
  ULTRAMSG_INSTANCE_ID: z.string().optional(),
  ULTRAMSG_TOKEN: z.string().optional(),
  ULTRAMSG_SENDER_PHONE: z.string().optional(),

  // Traccar GPS Tracking
  TRACCAR_BASE_URL: z.string().optional(),
  TRACCAR_TOKEN: z.string().optional(),

  // Tive Logistics Tracking
  TIVE_API_BASE_URL: z.string().optional().default('https://platform.tive.com/api'),
  TIVE_API_KEY: z.string().optional(),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Only parse environment variables if not in build mode
let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  // During build time, use defaults
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('Using default environment variables during build');
    env = {
      DATABASE_URL: 'file:./dev.db',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET:
        'your-super-secret-jwt-key-that-is-at-least-32-characters-long',
      REDIS_URL: 'redis://localhost:6379',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_REGION: 'us-east-1',
      S3_BUCKET: 'logistics-media',
      S3_ACCESS_KEY_ID: 'minioadmin',
      S3_SECRET_ACCESS_KEY: 'minioadmin',
      TRACCAR_WEBHOOK_SECRET: 'traccar-secret-key',
      WHATSAPP_WEBHOOK_SECRET: 'whatsapp-secret-key',
      ULTRAMSG_INSTANCE_ID: undefined,
      ULTRAMSG_TOKEN: undefined,
      ULTRAMSG_SENDER_PHONE: undefined,
      TRACCAR_BASE_URL: undefined,
      TRACCAR_TOKEN: undefined,
      TIVE_API_BASE_URL: 'https://platform.tive.com/api',
      TIVE_API_KEY: undefined,
      NODE_ENV: 'development',
    };
  } else {
    throw error;
  }
}

export { env };
export type Env = z.infer<typeof envSchema>;

/**
 * Checks if all required environment variables are configured
 * @param keys - Array of environment variable keys to check
 * @returns true if all keys are configured, false otherwise
 */
export function isConfigured(keys: string[]): boolean {
  return keys.every(key => {
    const value = process.env[key];
    return value !== undefined && value !== '';
  });
}

/**
 * Requires specific environment variables to be configured
 * @param keys - Array of environment variable keys to require
 * @throws Error if any required key is missing
 */
export function requireEnv(keys: string[]): void {
  const missing = keys.filter(key => {
    const value = process.env[key];
    return value === undefined || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Standardized environment guard for integrations
 * Prevents live API calls when credentials are missing
 * @param vars - Array of environment variable keys to check
 * @throws Error if any required variable is missing
 */
export function ensureConfigured(vars: string[]): void {
  const missing = vars.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Integration not configured: ${missing.join(", ")}`);
  }
}

/**
 * Integration status helper - checks if all required vars are configured
 * @param vars - Array of environment variable keys to check
 * @returns true if all variables are configured, false otherwise
 */
export function isIntegrationConfigured(vars: string[]): boolean {
  return vars.every((k) => process.env[k]);
}

/**
 * Get integration status for all services
 * @returns Object with configuration status for each integration
 */
export function getIntegrationStatus() {
  return {
    ultraMsg: isIntegrationConfigured(['ULTRAMSG_INSTANCE_ID', 'ULTRAMSG_TOKEN']),
    traccar: isIntegrationConfigured(['TRACCAR_BASE_URL', 'TRACCAR_TOKEN']),
    tive: isIntegrationConfigured(['TIVE_API_KEY']),
    db: isIntegrationConfigured(['DATABASE_URL']),
  };
}
