# Production Deployment Setup Guide

This guide walks you through setting up the production database and migrating manifest data to show on your deployed Vercel app.

## Prerequisites

1. Vercel account with a deployed project
2. PostgreSQL database (Vercel Postgres, Supabase, Railway, or external)
3. Local SQLite database with manifest data (`prisma/dev.db`)

## Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. The `DATABASE_URL` will be automatically added to your environment variables

### Option B: External PostgreSQL

1. Get your PostgreSQL connection string (e.g., from Supabase, Railway, or PlanetScale)
2. Copy the connection string
3. Go to your Vercel project settings → Environment Variables
4. Add `DATABASE_URL` with your PostgreSQL connection string

## Step 2: Configure Environment Variables in Vercel

Add these environment variables to your Vercel project:

### Required Variables

```bash
# Your app URL
NEXTAUTH_URL=https://dmoc.vercel.app

# Secret key for NextAuth (generate a secure 32+ character string)
NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### Optional Variables

```bash
# Redis for BullMQ (if using queue system)
REDIS_URL=redis://username:password@host:port

# S3/MinIO Storage (if using file storage)
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=us-east-1
S3_BUCKET=logistics-media
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## Step 3: Run Database Migration

### Using Vercel CLI (Recommended)

```bash
# 1. Link your local project to Vercel
vercel link

# 2. Pull environment variables
vercel env pull .env.production

# 3. Switch to production schema
npm run db:prod

# 4. Push schema to database
npx prisma db push

# 5. Seed basic data (tenant, admin user, companies, routes, etc.)
npm run db:seed:prod
```

### Alternative: Using Vercel Dashboard

1. Go to your Vercel project → Settings → Database
2. Click on your Postgres database
3. Open the "Query" tab
4. Run the SQL commands from `prisma/migrations`

## Step 4: Migrate Manifest Data

After the database is set up, you need to migrate your manifest data from local SQLite to production PostgreSQL.

### Option A: Automated Migration Script

```bash
# Make sure you have manifest data in local SQLite (prisma/dev.db)
# This script will copy all manifests from local to production

npm run db:migrate:manifests
```

This will:

1. Read all manifests from `prisma/dev.db`
2. Get or create the Digiwize tenant in production
3. Map companies, routes, and locations
4. Create all manifests in the production database

### Option B: Manual Seed via API Endpoint

```bash
# Call the seed endpoint
curl -X POST https://dmoc.vercel.app/api/seed-production
```

### Option C: Using Prisma Studio

1. Connect to your production database:

```bash
# Set your DATABASE_URL to production
export DATABASE_URL="postgresql://..."
npx prisma studio
```

2. Manually import data or use Prisma Studio's interface

## Step 5: Verify Deployment

1. Visit your deployed app: `https://dmoc.vercel.app`
2. Sign in with credentials:
   - Email: `admin@digiwize.com`
   - Password: `admin123`
3. Navigate to the manifests page
4. Verify that manifest data is displayed

## Troubleshooting

### No Data Showing

**Problem**: Manifests not appearing after deployment

**Solutions**:

1. **Check Database Connection**: Verify `DATABASE_URL` is set correctly in Vercel

   ```bash
   vercel env pull .env.production
   cat .env.production | grep DATABASE_URL
   ```

2. **Check Prisma Schema**: Ensure production schema is being used

   ```bash
   # Verify schema is PostgreSQL
   cat prisma/schema.prisma | grep provider
   ```

3. **Check Tenant ID**: Verify the tenant exists in production

   ```bash
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.tenant.findMany().then(console.log).finally(() => p.\$disconnect())"
   ```

4. **Check Manifest Count**: Query the database to see if manifests exist
   ```bash
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.manifest.findMany().then(m => console.log('Count:', m.length)).finally(() => p.\$disconnect())"
   ```

### Build Failures

**Problem**: Build fails on Vercel

**Solutions**:

1. **Prisma Client Not Generated**: Add to `vercel-build` script

   ```json
   "vercel-build": "npm run db:prod && prisma generate && next build"
   ```

2. **Environment Variables Missing**: Check all required variables are set

3. **Database Connection Issues**: Verify DATABASE_URL format is correct for PostgreSQL

### Authentication Issues

**Problem**: Can't sign in

**Solutions**:

1. Verify `NEXTAUTH_URL` matches your deployment URL exactly
2. Ensure `NEXTAUTH_SECRET` is at least 32 characters
3. Check that admin user exists in database:
   ```bash
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.findUnique({ where: { email: 'admin@digiwize.com' } }).then(console.log).finally(() => p.\$disconnect())"
   ```

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server with SQLite

# Production Setup
npm run db:prod               # Switch to PostgreSQL schema
npx prisma db push           # Push schema to database
npm run db:seed:prod         # Seed basic data
npm run db:migrate:manifests # Migrate manifest data

# Deployment
vercel --prod                # Deploy to production

# Environment Management
vercel env pull .env.production
vercel env add DATABASE_URL production
```

## Database Schema Comparison

| Schema      | Provider   | File                 | Usage                 |
| ----------- | ---------- | -------------------- | --------------------- |
| Development | SQLite     | `schema-dev.prisma`  | Local development     |
| Production  | PostgreSQL | `schema-prod.prisma` | Production deployment |

The key differences:

- SQLite uses `String` for JSON fields (settings in Tenant)
- PostgreSQL uses native `Json` type
- Both schemas have the same models and relations

## Next Steps

After successful deployment:

1. **Monitor Performance**: Check Vercel logs for any database query issues
2. **Set Up Backups**: Configure automatic backups for your PostgreSQL database
3. **Add Monitoring**: Set up database monitoring (Vercel provides basic monitoring)
4. **Scale**: Consider connection pooling for high traffic

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check database connection string format
3. Verify environment variables are set correctly
4. Review Prisma schema and migrations
5. Test database connection manually

For more help, see:

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
