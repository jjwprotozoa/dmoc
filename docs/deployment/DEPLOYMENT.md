# Production Deployment Guide

## Vercel Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long-change-this-in-production

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database_name

# Optional: Redis for BullMQ
REDIS_URL=redis://username:password@host:port

# Optional: S3/MinIO Storage
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## Database Setup

### Option 1: Vercel Postgres

1. Add Vercel Postgres addon to your project
2. Use the provided `DATABASE_URL` from Vercel dashboard

### Option 2: External PostgreSQL

1. Use services like Supabase, Railway, or PlanetScale
2. Set `DATABASE_URL` to your PostgreSQL connection string

## Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Deploy** - Vercel will automatically run the build process
3. **Database Migration** - Run `npx prisma db push` in Vercel CLI or dashboard
4. **Seed Database** - Run `npx tsx prisma/seed-production.ts`

## Manual Database Setup (if needed)

```bash
# Connect to Vercel project
vercel link

# Pull environment variables
vercel env pull .env.production

# Switch to production PostgreSQL schema
npm run db:prod

# Run database migration
npx prisma db push

# Seed production database (basic data)
npm run db:seed:prod

# Migrate manifest data from local SQLite to production PostgreSQL
npm run db:migrate:manifests
```

## Quick Start

**Just need to get manifest data showing?** See `DEPLOYMENT_QUICK_START.md` for 3-step guide.

**Need detailed instructions?** See `PRODUCTION_SETUP.md` for complete setup guide.

## Testing Production Authentication

1. Visit your Vercel app URL
2. Go to `/sign-in`
3. Use credentials:
   - Email: `admin@digiwize.com`
   - Password: `admin123`

## Troubleshooting

### Authentication Issues

- Check `NEXTAUTH_URL` matches your Vercel app URL exactly
- Ensure `NEXTAUTH_SECRET` is at least 32 characters
- Verify database connection and user exists

### Database Issues

- Confirm `DATABASE_URL` is correct
- Check if database migrations ran successfully
- Verify production seed script executed

### Build Issues

- Ensure all environment variables are set
- Check Prisma client generation
- Verify PostgreSQL connection string format
