# Complete Production Database Seeding Guide

## Overview

The `seed-production.ts` script only seeds **basic data**. Several important tables require **separate seed scripts** to populate them with your local data.

## What `seed-production.ts` DOES Seed ✅

The main production seed script (`npm run db:seed:prod`) creates:

- ✅ **Tenant**: Digiwize
- ✅ **Users**: admin@digiwize.com, driver@test.com
- ✅ **Organization**: Digiwize Organization
- ✅ **Companies**: DELTA, RELOAD, TEST CLIENT (sample only)
- ✅ **Routes**: 2 sample routes
- ✅ **Locations**: From `data/locations.txt`
- ✅ **Countries**: From `data/countries.txt`
- ✅ **Contacts**: From `data/contacts.txt`
- ✅ **Logistics Officers**: From `data/Logistics_Officers.txt`
- ✅ **Vehicles**: From `data/vehicles.txt`
- ✅ **Invoice States**: Pending, Paid, Overdue

## What `seed-production.ts` DOES NOT Seed ❌

These tables are **empty** and need separate seed scripts:

### 1. **Clients** (Client table)
**Status**: ❌ Empty  
**Script**: `npm run db:seed:clients`  
**What it does**: Creates ~20 client companies (DELTA, RELOAD, INARA, etc.)  
**Required for**: Manifests, user access control

### 2. **All Users** (User table - legacy users)
**Status**: ❌ Only has admin and driver test user  
**Script**: `npm run db:seed:users`  
**What it does**: Imports ~80 users from legacy Windows system (Delta, Kobra, Inara tenants)  
**Required for**: User authentication, multi-tenant access

### 3. **Manifests** (Manifest table)
**Status**: ❌ Empty  
**Scripts**: 
- `npm run db:migrate:manifests` (from local SQLite)
- OR `npm run dmoc:import:active` (from active_manifests.txt)  
**What it does**: Imports manifest data from local database or data file  
**Required for**: Main application functionality

### 4. **Drivers** (Driver table)
**Status**: ❌ Empty  
**Script**: None (drivers may be created via manifests or need manual import)  
**Note**: Drivers are often created when importing manifests that reference them

### 5. **Other Tables** (typically empty unless needed)
- **UserClient**: User-client access mappings
- **UserImage**: User profile images
- **ManifestLocation**: Manifest location tracking
- **ManifestAudit**: Manifest audit logs
- **Offense**: Driver/vehicle offenses
- **VehicleCombination**: Vehicle-trailer combinations
- **FuelEntry**: Fuel tracking entries
- **WhatsappData/WhatsappFiles/etc**: WhatsApp integration data

## Complete Seeding Steps

To fully populate your production database, run these scripts **in order**:

```bash
# 1. Pull production environment variables
vercel env pull .env.production

# 2. Switch to production schema
npm run db:prod

# 3. Run main production seed (basic data)
npm run db:seed:prod

# 4. Seed clients (required for manifests)
npm run db:seed:clients

# 5. Seed all users from legacy system
npm run db:seed:users

# 6. Import manifests (choose one method):
# Option A: From local SQLite database
npm run db:migrate:manifests

# Option B: From active_manifests.txt file
npm run dmoc:import:active
```

## Quick Reference: What Each Script Does

| Script | Command | What It Seeds |
|--------|--------|--------------|
| Main Seed | `npm run db:seed:prod` | Basic tenant, users, companies, routes, locations, countries, contacts, logistics officers, vehicles |
| Clients | `npm run db:seed:clients` | ~20 client companies (DELTA, RELOAD, INARA, etc.) |
| Users | `npm run db:seed:users` | ~80 users from legacy Windows system |
| Manifests (SQLite) | `npm run db:migrate:manifests` | All manifests from local SQLite database |
| Manifests (File) | `npm run dmoc:import:active` | Manifests from `data/active_manifests.txt` |

## Verification

After running all seed scripts, verify your data:

```bash
# Open Prisma Studio connected to production
npm run db:prod
npx prisma studio
```

Check these tables:
- ✅ `clients` - Should have ~20 rows
- ✅ `users` - Should have ~80+ rows
- ✅ `manifests` - Should have your manifest data
- ✅ `drivers` - May be empty or populated from manifests
- ✅ `vehicles` - Should have data from vehicles.txt
- ✅ `contacts` - Should have data from contacts.txt
- ✅ `logistics_officers` - Should have data from Logistics_Officers.txt

## Troubleshooting

### "Table is empty after seeding"

1. **Check if you ran the correct seed script** - Some tables need separate scripts
2. **Check data files exist** - Ensure `data/*.txt` files are present
3. **Check for errors** - Review console output for import errors
4. **Check database connection** - Verify `DATABASE_URL` is set correctly

### "Manifests not showing"

- Manifests require **Clients** to be seeded first
- Run `npm run db:seed:clients` before importing manifests
- Verify client `companyId` values match manifest data

### "Users not found"

- Legacy users are in a separate script: `npm run db:seed:users`
- This creates users for Delta, Kobra, Inara tenants
- Default password: `TempPassword123!`

## Summary

**Most likely missing tables:**
1. **Clients** - Run `npm run db:seed:clients`
2. **Users** - Run `npm run db:seed:users`  
3. **Manifests** - Run `npm run db:migrate:manifests` or `npm run dmoc:import:active`

These are the most critical tables that are likely empty in your Vercel production database.

