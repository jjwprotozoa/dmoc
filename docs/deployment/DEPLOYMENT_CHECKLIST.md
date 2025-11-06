# Production Deployment Checklist

Use this checklist to ensure all local changes are properly deployed to production.

## Pre-Deployment

- [ ] **Code is tested locally** - All features work in development
- [ ] **Code is committed** - Changes are committed to git
- [ ] **Schema changes reviewed** - Any schema changes are intentional and tested
- [ ] **Environment variables ready** - Production DATABASE_URL is accessible

## Deployment Steps

### Option A: Automated (Recommended)

- [ ] Run `npm run schema:compare` to check schema sync
- [ ] Run `npm run deploy:production:auto` for full automated deployment
- [ ] Review output for any errors or warnings

### Option B: Manual

- [ ] **Compare schemas**: `npm run schema:compare`
- [ ] **Sync schemas** (if needed): Review differences and sync manually
- [ ] **Pull environment**: `vercel env pull .env.production`
- [ ] **Switch to prod schema**: `npm run db:prod`
- [ ] **Push schema**: `npm run db:push`
- [ ] **Seed database**: `npm run db:seed:prod`
- [ ] **Switch back to dev**: `npm run db:dev`

## Post-Deployment

- [ ] **Code deployed**: Push to git or deploy via Vercel CLI
- [ ] **Verify deployment**: Check Vercel deployment logs
- [ ] **Test production app**: Visit production URL
- [ ] **Sign in**: Test with `admin@digiwize.com` / `admin123`
- [ ] **Verify features**:
  - [ ] Vehicles page loads and searches work
  - [ ] Contacts page displays correctly
  - [ ] Logistics Officers page works
  - [ ] Countries and Locations display
  - [ ] Manifests page functions correctly
  - [ ] Routes are accessible

## Troubleshooting

If something doesn't work:

1. **Check Vercel logs** - Look for build or runtime errors
2. **Verify DATABASE_URL** - Ensure it's set correctly in Vercel
3. **Compare schemas** - Run `npm run schema:compare`
4. **Re-run deployment** - `npm run deploy:production:auto`
5. **Check database** - Verify data exists in production database

## Quick Reference

```bash
# Compare schemas
npm run schema:compare

# Full automated deployment
npm run deploy:production:auto

# Manual deployment steps
vercel env pull .env.production
npm run db:prod
npm run db:push
npm run db:seed:prod
npm run db:dev

# Deploy code to Vercel
git push origin main
# Or
vercel --prod
```

## Common Issues

### Schema Mismatch
**Symptom**: Deployment script reports schema differences  
**Fix**: Run `npm run schema:compare` and sync schemas manually

### Database Connection Error
**Symptom**: Cannot connect to production database  
**Fix**: Verify DATABASE_URL in `.env.production` or Vercel environment variables

### Missing Data
**Symptom**: Production app shows empty pages  
**Fix**: Re-run `npm run db:seed:prod` to seed the database

### Old Data Showing
**Symptom**: Production shows cached or outdated data  
**Fix**: Clear browser cache, verify DATABASE_URL, re-run schema push

