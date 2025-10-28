# Quick Start: Deploy with Manifest Data

**Problem**: Manifest data shows locally but not when deployed to Vercel.

**Root Cause**: Production uses SQLite instead of PostgreSQL, or DATABASE_URL is not configured.

**Solution**: Set up PostgreSQL database and migrate manifest data.

## Quick Solution (3 Steps)

### 1. Set DATABASE_URL in Vercel

Go to your Vercel project → Settings → Environment Variables

Add:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```

If using **Vercel Postgres**:

1. Go to Storage tab in your project
2. Create Postgres database
3. DATABASE_URL is added automatically

### 2. Run Database Setup (Locally)

```bash
# Pull environment variables
vercel env pull .env.production

# Generate PostgreSQL Prisma client
npm run db:prod

# Push schema to production database
npx prisma db push

# Seed basic data (tenant, admin user)
npm run db:seed:prod
```

### 3. Migrate Manifest Data

```bash
# This copies manifests from local SQLite to production PostgreSQL
npm run db:migrate:manifests
```

## Verification

Visit your deployed app and sign in:

- URL: `https://dmoc.vercel.app`
- Email: `admin@digiwize.com`
- Password: `admin123`

Navigate to `/dashboard/manifests` - you should see your manifest data!

## If Data Still Doesn't Show

### Check 1: Verify DATABASE_URL is set

```bash
# In Vercel CLI
vercel env ls

# Should show DATABASE_URL
```

### Check 2: Verify tenant exists

```bash
# Connect to production database
export DATABASE_URL="postgresql://..."
npx prisma studio
```

Open the `Tenant` table - should have one row with slug: "digiwize"

### Check 3: Verify manifests migrated

```bash
# In Prisma Studio or via CLI
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.manifest.findMany({ take: 5 }).then(console.log).finally(() => p.\$disconnect());
"
```

Should return 5 manifest records.

## Troubleshooting Commands

```bash
# Check if DATABASE_URL is using SQLite or PostgreSQL
echo $DATABASE_URL | grep -E "(file:|postgresql:)"

# Test database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Count manifests in production
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient({ log: ['query'] });
p.manifest.count().then(count => console.log('Manifests:', count)).finally(() => p.\$disconnect());
"
```

## Alternative: Use API Endpoint

If you can't run scripts locally:

1. Go to: `https://dmoc.vercel.app/api/seed-production`
2. This will seed basic data (but not manifests)
3. For manifests, use Prisma Studio to import data

## Full Documentation

See `PRODUCTION_SETUP.md` for detailed instructions.



