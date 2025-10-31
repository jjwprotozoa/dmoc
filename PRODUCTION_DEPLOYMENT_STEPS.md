# Production Deployment Steps

## Current Status
✅ Code pushed to git (commits: bb42cc5, 30ab38e, etc.)
❌ Production database schema may not be in sync
❌ Production database may not have latest data

## Required Steps for Full Production Deployment

### Step 1: Sync Schema Files (if needed)
```bash
# Compare dev and prod schemas
git diff prisma/schema-dev.prisma prisma/schema-prod.prisma

# If schemas differ, sync them:
# Copy dev schema to prod (review first!)
# node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma
```

### Step 2: Connect to Vercel
```bash
# Link local project to Vercel
vercel link

# Pull production environment variables
vercel env pull .env.production
```

### Step 3: Switch to Production Schema & Migrate Database
```bash
# Switch to production PostgreSQL schema
npm run db:prod

# Push schema changes to production database
npm run db:push
```

### Step 4: Seed Production Database
```bash
# Seed basic data (tenant, admin user, companies, routes, etc.)
npm run db:seed:prod

# Migrate manifest data from local to production (if needed)
npm run db:migrate:manifests
```

### Step 5: Verify Deployment
1. Visit your Vercel app URL
2. Sign in with: `admin@digiwize.com` / `admin123`
3. Check that all pages match local behavior:
   - Vehicles (card view with search)
   - Contacts
   - Logistics Officers (with email functionality)
   - Countries
   - Locations
   - Manifests

## Quick Command Sequence

```bash
# Full production deployment (run after code is pushed)
vercel link
vercel env pull .env.production
npm run db:prod
npm run db:push
npm run db:seed:prod
npm run db:migrate:manifests  # If you need manifest data
```

## Important Notes

- **Vercel Build**: The `vercel-build` script automatically uses `schema-prod.prisma` during build
- **Database Changes**: Any schema changes in `schema-dev.prisma` must be manually synced to `schema-prod.prisma`
- **Data Migration**: Production database needs to be seeded separately - it doesn't happen automatically

## Troubleshooting

If production looks different from local:
1. Check that `DATABASE_URL` is set correctly in Vercel
2. Verify schema-prod.prisma matches schema-dev.prisma for new models
3. Run `npm run db:push` to ensure database structure matches schema
4. Check that seed data exists: `npm run db:seed:prod`

