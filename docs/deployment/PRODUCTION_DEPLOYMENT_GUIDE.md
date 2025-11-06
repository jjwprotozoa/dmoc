# Production Deployment Guide

## Overview

This guide ensures that your local changes (code, schemas, and data) are properly synchronized with production on Vercel.

## Quick Start

### Automated Deployment (Recommended)

```bash
# Full automated deployment with schema sync
npm run deploy:production:auto

# Or step-by-step with manual review
npm run deploy:production
```

### Manual Deployment Steps

If you prefer to run steps manually:

```bash
# 1. Ensure you're connected to Vercel
vercel link
vercel env pull .env.production

# 2. Check schema differences
git diff prisma/schema-dev.prisma prisma/schema-prod.prisma

# 3. Sync schemas if needed (review first!)
node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma
# Then manually update the datasource provider in schema-prod.prisma to PostgreSQL

# 4. Deploy to production
npm run deploy:production
```

## Detailed Steps

### Step 1: Schema Synchronization

**Why**: Your local `schema-dev.prisma` (SQLite) and production `schema-prod.prisma` (PostgreSQL) must have identical models. Only the `datasource` provider differs.

**Check for differences**:
```bash
git diff prisma/schema-dev.prisma prisma/schema-prod.prisma
```

**If schemas differ**:
1. Review the differences carefully
2. Sync schemas:
   ```bash
   node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma
   ```
3. Verify `schema-prod.prisma` has:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

**When to sync**:
- After adding new models
- After changing field types
- After adding/removing fields
- Before deploying to production

### Step 2: Environment Setup

**Pull production environment variables**:
```bash
vercel link
vercel env pull .env.production
```

**Verify DATABASE_URL**:
- Should point to your production PostgreSQL database
- Check in Vercel dashboard: Project Settings → Environment Variables

### Step 3: Database Schema Migration

**Push schema to production**:
```bash
# Switch to production schema
npm run db:prod

# Push schema changes
npm run db:push
```

**What this does**:
- Updates the production database structure to match `schema-prod.prisma`
- Creates new tables, columns, indexes as needed
- **Does NOT delete data** (safe operation)

### Step 4: Seed Production Database

**Seed basic data**:
```bash
npm run db:seed:prod
```

**What gets seeded**:
- Default tenant (Digiwize)
- Admin user (admin@digiwize.com / admin123)
- Organizations and companies
- Routes and locations
- Countries, contacts, logistics officers
- Vehicles
- Invoice states

**Migrate manifest data** (if needed):
```bash
npm run db:migrate:manifests
```

### Step 5: Deploy Code to Vercel

**Push code changes**:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Vercel will automatically:
- Run `npm run vercel-build`
- Use `schema-prod.prisma` for Prisma client generation
- Deploy the application

**Or deploy manually**:
```bash
vercel --prod
```

### Step 6: Verification

**Test production deployment**:
1. Visit your Vercel app URL
2. Sign in with: `admin@digiwize.com` / `admin123`
3. Verify all features work:
   - ✅ Vehicles (card view with search)
   - ✅ Contacts
   - ✅ Logistics Officers
   - ✅ Countries
   - ✅ Locations
   - ✅ Manifests
   - ✅ Routes

**Check database**:
```bash
# Switch to production schema
npm run db:prod

# Open Prisma Studio (optional)
npx prisma studio
```

## Deployment Script Options

The `deploy-to-production.js` script supports several flags:

```bash
# Full automated deployment (syncs schemas automatically)
npm run deploy:production:auto

# Manual deployment (checks schemas but doesn't auto-sync)
npm run deploy:production

# Skip schema check
node scripts/deploy-to-production.js --skip-schema-check

# Skip schema sync (if already synced)
node scripts/deploy-to-production.js --skip-schema-sync

# Skip database seeding (if already seeded)
node scripts/deploy-to-production.js --skip-seed

# Combine flags
node scripts/deploy-to-production.js --skip-schema-check --skip-seed
```

## Troubleshooting

### Schema Mismatch Error

**Problem**: Schemas are not synchronized

**Solution**:
```bash
# Review differences
git diff prisma/schema-dev.prisma prisma/schema-prod.prisma

# Sync schemas
node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma

# Verify datasource is PostgreSQL in schema-prod.prisma
```

### DATABASE_URL Not Found

**Problem**: Environment variable not set

**Solution**:
```bash
# Pull from Vercel
vercel env pull .env.production

# Or set manually in .env.production
echo 'DATABASE_URL="postgresql://..."' > .env.production
```

### Database Connection Error

**Problem**: Cannot connect to production database

**Solution**:
1. Verify DATABASE_URL is correct
2. Check database credentials in Vercel
3. Ensure database is accessible from your IP (if using IP restrictions)
4. Test connection: `npx prisma db pull` (with production schema)

### Seed Data Not Appearing

**Problem**: Production database is empty after seeding

**Solution**:
```bash
# Re-run seed script
npm run db:prod
npm run db:seed:prod

# Check for errors in output
# Verify tenant was created
```

### Production App Shows Old Data

**Problem**: Production shows cached or old data

**Solution**:
1. Clear browser cache
2. Check Vercel deployment logs
3. Verify DATABASE_URL in Vercel environment variables
4. Re-run schema push: `npm run db:push`

## Best Practices

### Before Every Deployment

1. ✅ **Test locally** - Ensure everything works in development
2. ✅ **Check schema sync** - Verify schemas are identical
3. ✅ **Review changes** - Check what's being deployed
4. ✅ **Backup production** - If possible, backup production database

### During Deployment

1. ✅ **Use automated script** - `npm run deploy:production:auto`
2. ✅ **Monitor output** - Watch for errors or warnings
3. ✅ **Verify each step** - Don't skip verification steps

### After Deployment

1. ✅ **Test production** - Verify all features work
2. ✅ **Check logs** - Review Vercel deployment logs
3. ✅ **Monitor errors** - Watch for runtime errors
4. ✅ **Switch back to dev** - `npm run db:dev`

## Schema Management

### Development Workflow

1. Make changes in `schema-dev.prisma`
2. Test locally with SQLite
3. Before deploying, sync to `schema-prod.prisma`
4. Deploy to production

### Schema Sync Command

```bash
# Copy dev schema to prod
node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma

# Manually update datasource in schema-prod.prisma:
# Change: provider = "sqlite"
# To:     provider = "postgresql"
# Change: url = "file:./dev.db"
# To:     url = env("DATABASE_URL")
```

## Data Migration

### When to Migrate Data

- **Initial setup**: First time setting up production
- **New seed data**: After adding new seed files
- **Data updates**: When seed data structure changes

### Migration Commands

```bash
# Seed all production data
npm run db:seed:prod

# Migrate manifests only
npm run db:migrate:manifests

# Migrate all data (if script exists)
npm run db:migrate:all
```

## Environment Variables

### Required in Production

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Production app URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `NODE_ENV=production` - Environment flag

### Setting in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/update variables
5. Redeploy if needed

## Rollback Procedure

If deployment fails or causes issues:

1. **Revert code**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Revert database** (if schema changes):
   - Restore from backup if available
   - Or manually revert schema changes

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Support

For issues or questions:
- Check deployment logs in Vercel
- Review Prisma migration logs
- Check database connection
- Verify environment variables

