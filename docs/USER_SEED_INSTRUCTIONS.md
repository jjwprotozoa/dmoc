# User Seed Instructions

## Overview

This document explains how to seed the database with all users from the legacy Windows system.

## Prerequisites

1. Database must be set up and accessible
2. Prisma client must be generated
3. All tenants (Delta, Kobra, Inara, Digiwize) will be created automatically if they don't exist

## Steps

### 1. Run Database Migration

First, create and apply the migration for the new `isActive` field:

```bash
npx prisma migrate dev --name add_user_is_active
```

Or if using production database:

```bash
npx prisma migrate deploy
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run User Seed Script

```bash
npx tsx prisma/seed-users.ts
```

Or using ts-node:

```bash
npx ts-node prisma/seed-users.ts
```

## What Gets Created

The seed script will:

1. **Create/Verify Tenants:**
   - Delta
   - Kobra
   - Inara
   - Digiwize

2. **Import All Users:**
   - ~70 users for Delta tenant
   - 9 users for Kobra tenant
   - 1 user for Inara tenant
   - 2 users for Digiwize tenant

3. **Set Default Password:**
   - All users get default password: `TempPassword123!`
   - Users should change password on first login

4. **Preserve Existing Users:**
   - If a user already exists (by email), it will be updated instead of created
   - Passwords of existing users are NOT changed

## User Data Structure

Each user includes:
- **Username**: Display name (e.g., "MUWEMA EUGINE", "Accounts", "admin")
- **Email**: Generated from username if not provided (e.g., "muwemaeugine@delta.local")
- **Role**: ADMINISTRATOR, CONTROLLER, VIEWER, MANAGER, ACCOUNTS, DRIVER, or DIGIWIZE_ADMIN
- **Active Status**: ✅ (true) or ❌ (false)
- **Tenant**: Delta, Kobra, Inara, or Digiwize

## Verification

After running the seed, verify users are imported:

1. Log in as Digiwize admin
2. Navigate to `/dashboard/admin/users`
3. You should see all users listed by tenant

## Troubleshooting

### Error: "Unique constraint failed on email"

This means a user with that email already exists. The script will update the existing user instead of creating a new one.

### Error: "Tenant not found"

The script automatically creates tenants, but if this error occurs, check that the tenant slugs match: 'delta', 'kobra', 'inara', 'digiwize'.

### Users not showing up

1. Check that you're logged in as a Digiwize admin
2. Verify the users were created: Check database directly or check the seed script output
3. Ensure the tenant slugs match exactly (case-sensitive)

## Notes

- The seed script is idempotent - you can run it multiple times safely
- Existing users will be updated with new data (except password)
- New users will be created with default password
- Duplicate usernames are handled by generating unique emails

