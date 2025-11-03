# Vercel Environment Variables Setup

## Overview

This document explains how to configure environment variables in Vercel for the DMOC application.

## Current Environment Variables

You currently have the following environment variables in Vercel:

1. **`dmoc_POSTGRES_URL`**: Direct Prisma Data Platform connection
2. **`dmoc_PRISMA_DATABASE_URL`**: Prisma Accelerate connection
3. **`dmoc_DATABASE_URL`**: Same as POSTGRES_URL (legacy/duplicate)

## Recommended Configuration

### Required Environment Variables

Add or update these in your Vercel project settings:

#### 1. Database Connection

- **Name**: `DATABASE_URL` (or `dmoc_DATABASE_URL` if using Vercel's PostgreSQL integration)
- **Value**: The PostgreSQL connection string
- **Required**: Yes

**Example value**:

```
postgres://df3a2d01ef60df10c425a5b834baf7f7131e3b3d1c7c236f1d4333e8563cad1b:sk___7QB-KNqeHjo1EYmyJ6F@db.prisma.io:5432/postgres?sslmode=require
```

#### 2. Prisma Accelerate (Optional but Recommended)

- **Name**: `PRISMA_DATABASE_URL` (or `dmoc_PRISMA_DATABASE_URL`)
- **Value**: Prisma Accelerate connection string
- **Required**: No (but improves performance)

**Example value**:

```
@prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. NextAuth Configuration

- **Name**: `NEXTAUTH_URL`
- **Value**: `https://dmoc.vercel.app`
- **Required**: Yes

- **Name**: `NEXTAUTH_SECRET`
- **Value**: A random string (at least 32 characters)
- **Required**: Yes

**Generate a secret**:

```bash
# Windows PowerShell
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))"

# Node.js (works on all platforms)
npm run generate:secret

# Linux/Mac
openssl rand -base64 32
```

#### 4. Other Optional Environment Variables

```
REDIS_URL=redis://... (if using Redis)
S3_ENDPOINT=... (for S3/MinIO storage)
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

## How It Works

### Build Process

1. **`scripts/prebuild.js`** runs first and maps Vercel's auto-prefixed variables to standard names
2. The script checks for these variables in order:
   - `dmoc_DATABASE_URL`
   - `dmoc_POSTGRES_URL`
   - `POSTGRES_URL`
   - `DATABASE_URL`
3. Sets `DATABASE_URL` for Prisma to use during the build

### Runtime Process

1. **`src/lib/env.ts`** maps environment variables at runtime
2. Same priority order as during build
3. Provides fallback to development database if none found

## Vercel Setup Steps

### Option 1: Use Existing Variables (Recommended)

Since you already have `dmoc_DATABASE_URL`, the application will automatically use it. However, you should:

1. **Set up NEXTAUTH_SECRET** in Vercel:

   ```
   Go to Vercel Dashboard → Project Settings → Environment Variables
   Add: NEXTAUTH_SECRET = (generate a random 32+ character string)
   ```

2. **Optionally** add `PRISMA_DATABASE_URL` for better performance:

   ```
   Add: PRISMA_DATABASE_URL = (your Prisma Accelerate URL)
   ```

3. **Remove duplicate variables** (optional cleanup):
   - Keep only `dmoc_DATABASE_URL` (remove `dmoc_POSTGRES_URL` if they're the same)

### Option 2: Standard Variable Names

If you prefer standard naming:

1. Add `DATABASE_URL` in Vercel with the same PostgreSQL connection string
2. You can remove the `dmoc_` prefixed variables

## Testing

After setting up environment variables:

1. **Redeploy** your application in Vercel
2. Check the **build logs** for:
   - `✅ [Prebuild] Using ... as DATABASE_URL`
   - `🗄️ [Prebuild] Database URL: ...***@`
3. Check the **runtime logs** for database connection messages

## Troubleshooting

### Build Fails with "Could not read env.DATABASE_URL"

- Ensure at least one database environment variable is set in Vercel
- Check the build logs for the prebuild script output

### Runtime Database Connection Errors

- Verify the connection string is valid
- Check SSL mode is set to `require`
- Ensure the database server is accessible from Vercel

### Environment Variables Not Found

- Make sure variables are added to the correct **environment** (Production, Preview, Development)
- Check that variables are not marked as **"Sensitive"** if you're not seeing them in logs

## File Changes Summary

### Created Files

- `scripts/prebuild.js` - Handles environment variable mapping during build

### Modified Files

- `src/lib/env.ts` - Enhanced environment variable mapping with fallbacks
- `package.json` - Updated `vercel-build` to run prebuild script
- `vercel.json` - Added `NODE_ENV` to environment configuration

## Next Steps

1. **Set `NEXTAUTH_SECRET`** in Vercel (required for auth to work)
2. **Deploy to Vercel** and verify the build succeeds
3. **Check application logs** to confirm database connection
4. **Test authentication** flow

## References

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Data Platform](https://www.prisma.io/data-platform)
- [Prisma Accelerate](https://www.prisma.io/accelerate)
