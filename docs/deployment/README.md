# Production Deployment Documentation

This directory contains comprehensive guides for deploying the DMOC Web application to production.

## Quick Start

**For most deployments, use the automated script:**

```bash
npm run deploy:production:auto
```

This will:
1. ✅ Check if schemas are synchronized
2. ✅ Sync schemas automatically if needed
3. ✅ Push schema to production database
4. ✅ Seed production database
5. ✅ Switch back to development schema

## Documentation Files

### 📘 [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
Complete guide with detailed steps, troubleshooting, and best practices.

### ✅ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
Quick checklist for ensuring all steps are completed.

### 📝 [PRODUCTION_DEPLOYMENT_STEPS.md](./PRODUCTION_DEPLOYMENT_STEPS.md)
Original step-by-step guide (now updated with references to automated scripts).

## Available Scripts

### Schema Management
```bash
# Compare dev and prod schemas
npm run schema:compare

# Switch to production schema
npm run db:prod

# Switch back to development schema
npm run db:dev
```

### Database Operations
```bash
# Push schema to production database
npm run db:push

# Seed production database
npm run db:seed:prod

# Migrate manifest data
npm run db:migrate:manifests
```

### Deployment
```bash
# Automated deployment (recommended)
npm run deploy:production:auto

# Manual deployment (with checks)
npm run deploy:production
```

## Typical Deployment Workflow

1. **Develop locally** with SQLite (`npm run db:dev`)
2. **Test changes** thoroughly
3. **Compare schemas** (`npm run schema:compare`)
4. **Deploy to production** (`npm run deploy:production:auto`)
5. **Push code** to git (Vercel auto-deploys)
6. **Verify** production app works correctly

## Key Concepts

### Schema Synchronization
- `schema-dev.prisma` uses SQLite (for local development)
- `schema-prod.prisma` uses PostgreSQL (for production)
- Both must have **identical models** - only the datasource provider differs
- Always sync schemas before deploying schema changes

### Database Seeding
- Production database needs to be seeded separately
- Seed script creates: tenants, users, companies, routes, locations, etc.
- Run `npm run db:seed:prod` after schema changes

### Environment Variables
- Pull from Vercel: `vercel env pull .env.production`
- Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Set in Vercel Dashboard → Project Settings → Environment Variables

## Troubleshooting

See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed troubleshooting steps.

Common issues:
- **Schema mismatch**: Run `npm run schema:compare` and sync manually
- **Database connection error**: Verify `DATABASE_URL` in `.env.production`
- **Missing data**: Re-run `npm run db:seed:prod`

## Support

For deployment issues:
1. Check the deployment guide
2. Review Vercel deployment logs
3. Verify environment variables
4. Compare schemas with `npm run schema:compare`

