// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional().default("file:./dev.db"),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(32).optional().default("your-super-secret-jwt-key-that-is-at-least-32-characters-long"),
  
  // Redis
  REDIS_URL: z.string().url().optional().default("redis://localhost:6379"),
  
  // S3 Storage
  S3_ENDPOINT: z.string().url().optional().default("http://localhost:9000"),
  S3_REGION: z.string().optional().default("us-east-1"),
  S3_BUCKET: z.string().optional().default("logistics-media"),
  S3_ACCESS_KEY_ID: z.string().optional().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().optional().default("minioadmin"),
  
  // Webhook Secrets
  TRACCAR_WEBHOOK_SECRET: z.string().optional().default("traccar-secret-key"),
  WHATSAPP_WEBHOOK_SECRET: z.string().optional().default("whatsapp-secret-key"),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
