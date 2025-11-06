# Multi-Tenant Architecture

## Overview

DMOC Web uses a multi-tenant architecture where a single instance serves multiple logistics clients (Delta, Cobra, etc.) under Digiwize. Each tenant's data is logically isolated using `tenantId` fields on all tenant-scoped models.

## Core Principles

1. **Tenant Isolation**: All tenant-scoped data must include `tenantId` and be filtered using `buildTenantWhere(ctx, ...)`
2. **Admin Bypass**: Users with `ADMIN` role can see data across all tenants
3. **Centralized Logic**: All tenant filtering logic is centralized in `src/server/api/utils/tenant.ts`
4. **Write Enforcement**: All mutations must use `getTenantId(ctx)` to enforce tenant on writes

## Implementation

### Shared Tenant Utilities

**Location**: `src/server/api/utils/tenant.ts`

#### `buildTenantWhere(ctx, extra?)`

Builds a Prisma where clause with tenant isolation:
- **Admin users**: Returns `extra` only (no tenant filter, can see all tenants)
- **Regular users**: Returns `{ tenantId: user.tenantId, ...extra }`

```typescript
// Example usage
const where = buildTenantWhere(ctx, { status: 'ACTIVE' });
// Admin: { status: 'ACTIVE' }
// Regular user: { tenantId: 'tenant-a', status: 'ACTIVE' }
```

#### `getTenantId(ctx)`

Gets and validates the current user's `tenantId` for mutations. Throws `TRPCError` if missing.

```typescript
// Example usage in mutations
const tenantId = getTenantId(ctx);
await db.model.create({
  data: {
    tenantId,
    ...input,
  },
});
```

### Standardized Routers

All routers MUST use `buildTenantWhere` instead of hardcoding tenant filtering:

- ✅ `manifest.ts` - Manifest router
- ✅ `vehicles.ts` - Vehicles router
- ✅ `contacts.ts` - Contacts router
- ✅ `logistics-officers.ts` - Logistics officers router
- ✅ `clients.ts` - Clients router
- ✅ `drivers.ts` - Drivers router
- ✅ `locations.ts` - Locations router
- ✅ `vehicle-combinations.ts` - Vehicle combinations router
- ✅ `offenses.ts` - Offenses router (special cross-tenant visibility)

### Mutation Requirements

All mutations (create, update, upsert) MUST:
1. Use `getTenantId(ctx)` to get tenantId
2. Include `tenantId` in the data payload
3. Add comment: `// enforce tenant on write`

**Example:**
```typescript
create: protectedProcedure
  .input(...)
  .mutation(async ({ ctx, input }) => {
    // enforce tenant on write
    const tenantId = getTenantId(ctx);
    
    return await db.model.create({
      data: {
        tenantId,
        ...input,
      },
    });
  }),
```

## Special Cases

### Offenses Cross-Tenant Visibility

Offenses are filtered by the driver/vehicle's **current** tenant, not the offense's `tenantId`. This allows offense history to follow drivers/vehicles when they move between tenants.

**Example:**
1. Driver John has offenses in Tenant A (Cobra)
2. Driver John moves to Tenant B (Delta)
3. Tenant B can now see all of John's offenses (including those from Tenant A)

**Implementation:**
```typescript
// Filter by driver/vehicle's current tenant, not offense.tenantId
if (userRole !== 'ADMIN' && tenantId) {
  where.OR = [
    { driver: { tenantId } },
    { vehicle: { tenantId } },
  ];
}
```

## Database Schema

### Tenant-Scoped Models

All tenant-scoped models must have:
- `tenantId String` field
- `tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)`
- Relation added to `Tenant` model: `modelName ModelName[]`

**Models with tenantId:**
- ✅ `Organization`
- ✅ `User`
- ✅ `Client`
- ✅ `Driver`
- ✅ `Vehicle`
- ✅ `VehicleCombination`
- ✅ `Manifest`
- ✅ `ManifestLocation`
- ✅ `Route`
- ✅ `Location`
- ✅ `WhatsappData`
- ✅ `WhatsappFile`
- ✅ `WhatsappLocation`
- ✅ `WhatsappMedia`
- ✅ `UserProfile`
- ✅ `ManifestAudit`
- ✅ `Offense`
- ✅ `Contact`
- ✅ `LogisticsOfficer`
- ✅ `Device`

**Models without tenantId (by design):**
- `Company` - Scoped through Organization
- `VehicleCombinationTrailer` - Scoped through VehicleCombination
- `FuelEntry` - Scoped through Vehicle
- `Attachment` - Not tenant-scoped
- `WebhookEvent` - Not tenant-scoped
- `InvoiceState` - Global reference data
- `Country` - Global reference data
- `UserRole` - Global reference data

## Testing

### Integration Tests

**Location**: `tests/tenant-isolation.test.ts`

Tests verify:
- Regular users only see their tenant's data
- Admin users can see all tenants' data
- All routers properly use `buildTenantWhere`

### Cross-Tenant Regression Test

**Location**: `tests/offenses-cross-tenant.test.ts`

Tests verify that offenses follow drivers/vehicles when they move between tenants.

## Debugging

### Development Debug Endpoint

**Endpoint**: `debug.tenantView`

Only available in `NODE_ENV=development`. Returns:
- Current session info (role, tenantId, tenantSlug)
- Applied tenant filter
- Admin bypass status

**Usage:**
```typescript
const result = await trpc.debug.tenantView.useQuery();
console.log(result);
```

### UI Debug Badge

**Component**: `TenantBadge`

Development-only badge showing:
- **Admin**: "Admin: cross-tenant view" (yellow badge)
- **Regular user**: "Tenant: {slug} (scoped)" (blue badge)

Add to pages:
```tsx
import { TenantBadge } from '@/components/dashboard/TenantBadge';

export default function MyPage() {
  return (
    <>
      <TenantBadge />
      {/* ... rest of page */}
    </>
  );
}
```

## Migration Checklist

When adding a new tenant-scoped model:

1. ✅ Add `tenantId String` to model
2. ✅ Add `tenant Tenant @relation(...)` relation
3. ✅ Add `modelName ModelName[]` to Tenant model
4. ✅ Create migration with backfill logic if needed
5. ✅ Update router to use `buildTenantWhere(ctx, ...)`
6. ✅ Ensure mutations use `getTenantId(ctx)`
7. ✅ Add integration tests
8. ✅ Update this documentation

## Best Practices

1. **Never hardcode tenant filtering**: Always use `buildTenantWhere(ctx, ...)`
2. **Always enforce tenant on writes**: Use `getTenantId(ctx)` in mutations
3. **Test both admin and regular user flows**: Verify admin bypass works
4. **Document special cases**: If a model doesn't use standard tenant filtering, document why
5. **Keep tenant utilities centralized**: All tenant logic should be in `src/server/api/utils/tenant.ts`

## Common Pitfalls

1. ❌ Hardcoding `{ tenantId: ctx.session.user.tenantId }` - Use `buildTenantWhere` instead
2. ❌ Forgetting to add `tenantId` to mutations - Use `getTenantId(ctx)`
3. ❌ Not testing admin bypass - Admin should see all tenants
4. ❌ Missing tenantId on child models - Child models should inherit tenant through parent relation
5. ❌ Forgetting to update all three schema files - Update `schema.prisma`, `schema-dev.prisma`, and `schema-prod.prisma`

## References

- Tenant utilities: `src/server/api/utils/tenant.ts`
- tRPC context: `src/server/api/trpc.ts`
- Integration tests: `tests/tenant-isolation.test.ts`
- Cross-tenant test: `tests/offenses-cross-tenant.test.ts`
- Debug endpoint: `src/server/api/routers/debug.ts`

