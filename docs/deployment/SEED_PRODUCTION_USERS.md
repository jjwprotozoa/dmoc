# Seed Production Database with All Users

## Overview

The production database currently only has the basic admin user (`admin@digiwize.com`). To add all users from the legacy Windows system (including "Justin"), you need to run the user seed script against the production database.

## Quick Steps

### 1. Pull Production Environment Variables

```bash
# Link to your Vercel project (if not already linked)
vercel link

# Pull production environment variables
vercel env pull .env.production
```

This will create a `.env.production` file with your production `DATABASE_URL`.

### 2. Switch to Production Schema

```bash
# Switch Prisma to use production PostgreSQL schema
npm run db:prod
```

### 3. Seed All Users

```bash
# Run the user seed script against production database
npm run db:seed:users
```

This will:
- Create/update all tenants (Delta, Kobra, Inara, Digiwize)
- Import ~80 users from the legacy system
- Set default password: `TempPassword123!` for all users
- Preserve existing users (won't overwrite passwords unless `RESET_PASSWORDS=true`)

### 4. Verify Users Were Created

You can verify by:
1. Logging into your production app
2. Going to `/dashboard/admin/users` (if you're an admin)
3. Or checking the database directly:

```bash
# Open Prisma Studio connected to production
npx prisma studio
```

## What Users Get Created

The seed script creates users for all tenants:

- **Delta**: ~70 users (including "Justin", "admin", "Accounts", etc.)
- **Kobra**: 9 users
- **Inara**: 1 user
- **Digiwize**: 2 users

## Default Password

All users get the default password: `TempPassword123!`

Users should change their password on first login.

## Reset Passwords (Optional)

If you want to reset passwords for existing users:

```bash
RESET_PASSWORDS=true npm run db:seed:users
```

## Troubleshooting

### Error: "Database connection not available"

Make sure you:
1. Ran `vercel env pull .env.production` to get the production DATABASE_URL
2. The `.env.production` file exists and has a valid DATABASE_URL

### Error: "Tenant not found"

The seed script creates tenants automatically, but if you see this error, make sure:
1. The database schema is up to date: `npm run db:push`
2. You're using the production schema: `npm run db:prod`

### Users Not Showing Up

1. Check that the seed script completed successfully
2. Verify you're looking at the correct tenant in the admin panel
3. Check that users are marked as `isActive: true`

## After Seeding

Once users are seeded, you should be able to:
- Log in with username "Justin" (or email: `justin@delta.local`)
- Use password: `TempPassword123!`
- Access the app as an ADMINISTRATOR for the Delta tenant

