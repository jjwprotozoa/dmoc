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
  S3_FORCE_PATH_STYLE: z.string().optional().default('true'),

  // Webhook Secrets
  TRACCAR_WEBHOOK_SECRET: z.string().optional().default('traccar-secret-key'),
  WHATSAPP_WEBHOOK_SECRET: z.string().optional().default('whatsapp-secret-key'),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Only parse environment variables if not in build mode
let env: z.infer<typeof envSchema>;
try {
  // Handle Vercel PostgreSQL environment variable naming
  if (!process.env.DATABASE_URL && process.env.dmoc_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.dmoc_DATABASE_URL;
  }
  
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
      S3_FORCE_PATH_STYLE: 'true',
      TRACCAR_WEBHOOK_SECRET: 'traccar-secret-key',
      WHATSAPP_WEBHOOK_SECRET: 'whatsapp-secret-key',
      NODE_ENV: 'development',
    };
  } else {
    throw error;
  }
}

export { env };
export type Env = z.infer<typeof envSchema>;
