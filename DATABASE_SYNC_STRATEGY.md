# Database Sync Strategy

## Current Setup

### Local Development

- **Database**: SQLite (`prisma/dev.db`)
- **Schema**: `prisma/schema-dev.prisma`
- **Purpose**: Fast local development, no setup required
- **Used by**: `npm run dev`, local development

### Production

- **Database**: PostgreSQL (hosted at `db.prisma.io`)
- **Schema**: `prisma/schema-prod.prisma`
- **Purpose**: Production deployment on Vercel
- **Used by**: Vercel deployments, production app

## Keeping Schemas in Sync

### 1. Schema Structure Sync

The schemas should have **identical models** - only the database provider differs:

```bash
# Compare schemas to ensure they match
git diff prisma/schema-dev.prisma prisma/schema-prod.prisma
```

**Key Point**: Only the `datasource db` provider differs:

- Dev: `provider = "sqlite"`
- Prod: `provider = "postgresql"`

**When to sync schemas:**

- After adding new models
- After changing field types
- After adding/removing fields
- Before deploying to production

**How to sync:**

```bash
# 1. Make changes in schema-dev.prisma (local development)
# 2. Copy to schema-prod.prisma (update provider to postgresql)
node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma
# 3. Update provider line manually in schema-prod.prisma
# 4. Commit both files
```

### 2. Data Sync (One-Way: Local → Production)

**Important**: Production is the source of truth for live data. Local SQLite is for development/testing.

#### When to Sync Data

**Option A: Initial Migration (One-Time)**
After setting up production database:

```bash
npm run db:migrate:all  # Migrate all data from local to production
```

**Option B: Selective Migration**
When you need specific data in production:

```bash
npm run db:migrate:manifests  # Just manifests
# Or create custom migration scripts
```

**Option C: Manual Sync**
For specific records or tables, use the migration scripts:

```bash
npm run db:migrate:all  # All tables
```

## Recommended Workflow

### Daily Development

1. **Work locally** with SQLite (`npm run db:dev`)
2. **Test changes** on local data
3. **Commit code** changes (not database file)

### Before Deploying

1. **Sync schemas** if you changed data models:

   ```bash
   # Compare and update schema-prod.prisma if needed
   git diff prisma/schema-dev.prisma prisma/schema-prod.prisma
   ```

2. **Push schema to production**:

   ```bash
   npm run db:prod  # Switch to production schema
   npm run db:push  # Update production database structure
   ```

3. **Migrate data if needed**:

   ```bash
   npm run db:migrate:manifests  # Or db:migrate:all
   ```

4. **Switch back to dev**:
   ```bash
   npm run db:dev  # Back to local development
   ```

### After Deploying

1. **Verify production** shows correct data
2. **Production is now source of truth** for live data
3. **Local SQLite** can be reset/refreshed for testing

## Data Flow Strategy

### Development → Production (One-Way Sync)

```
┌─────────────────┐         ┌──────────────────┐
│  Local SQLite   │  READ   │  Migration        │  WRITE  │  Production      │
│  (dev.db)       │ ──────→ │  Scripts          │ ──────→ │  PostgreSQL      │
│                 │         │                   │         │                  │
│  - Test data    │         │  - db:migrate:all │         │  - Live data     │
│  - Development  │         │  - db:migrate:    │         │  - Production    │
│  - Safe to      │         │    manifests       │         │  - Source of     │
│    experiment   │         │                   │         │    truth         │
└─────────────────┘         └──────────────────┘         └──────────────────┘
```

### Schema Sync (Bidirectional, Manual)

```
┌─────────────────┐
│  schema-dev     │  ←── Manual copy ──→  │  schema-prod    │
│  (SQLite)       │                       │  (PostgreSQL)    │
│                 │                       │                  │
│  - Develop here │                       │  - Deploy here  │
│  - Make changes │                       │  - Keep in sync │
└─────────────────┘                       └─────────────────┘
```

## Important Rules

### ✅ DO:

- Keep schemas identical (except provider)
- Migrate data one-way: Local → Production
- Use local SQLite for development/testing
- Use production PostgreSQL for live data
- Commit schema changes to git
- **Never commit** `dev.db` to git (already in `.gitignore`)

### ❌ DON'T:

- Don't modify production data manually in production database
- Don't sync production data back to local (production is source of truth)
- Don't use production database for local development
- Don't forget to sync schemas before deploying

## Sync Checklist

Before each production deployment:

- [ ] Compare schemas: `git diff prisma/schema-dev.prisma prisma/schema-prod.prisma`
- [ ] Update schema-prod.prisma if schema-dev.prisma changed
- [ ] Run `npm run db:prod` to switch to production schema
- [ ] Run `npm run db:push` to update production database structure
- [ ] Run `npm run db:migrate:all` if you need to sync data
- [ ] Switch back: `npm run db:dev`
- [ ] Deploy to Vercel
- [ ] Verify production shows correct data

## Scripts Reference

```bash
# Schema Management
npm run db:dev          # Switch to SQLite schema (local development)
npm run db:prod         # Switch to PostgreSQL schema (production)

# Database Structure
npm run db:push         # Push schema to active database (dev or prod)

# Data Migration (Local → Production)
npm run db:migrate:manifests  # Migrate only manifests
npm run db:migrate:all        # Migrate all tables

# Seeding
npm run db:seed         # Seed local SQLite
npm run db:seed:prod    # Seed production PostgreSQL
```

## Notes

- **Local SQLite** is disposable - you can reset it anytime
- **Production PostgreSQL** is persistent - contains live user data
- **Schemas must match** except for the database provider
- **Data sync is one-way** (local → production) for safety
- **Production is the source of truth** for live data
