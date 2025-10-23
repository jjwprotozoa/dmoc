# DMOC Step 2: Manifest getById Implementation

## Overview

This step implements the `manifest.getById` tRPC procedure and creates a detailed manifest view page with proper tenant isolation and feature flag gating.

## Implementation Details

### 1. tRPC Router Enhancement

**File**: `src/server/api/routers/manifest.ts`

Enhanced the existing `getById` procedure with:

- **Tenant Isolation**: Enforces `company.organization.tenantId = ctx.session.user.tenantId`
- **Comprehensive Relations**: Includes company, organization, and stops data
- **Error Handling**: Uses TRPCError with proper codes (NOT_FOUND, FORBIDDEN)
- **Input Validation**: Zod schema validation for the ID parameter

```typescript
getById: protectedProcedure
  .input(z.object({ id: z.string().min(1) }))
  .query(async ({ ctx, input }) => {
    const { id } = input;
    const tenantId = ctx.session.user.tenantId;

    // Tenant isolation: only fetch within the signed-in user's tenant
    const manifest = await ctx.db.manifest.findFirst({
      where: {
        id,
        company: {
          organization: {
            tenantId: tenantId
          }
        }
      },
      include: {
        company: {
          include: {
            organization: true
          }
        },
        stops: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!manifest) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Manifest not found" });
    }

    // Double-check (defensive) tenant boundary
    if (manifest.company.organization.tenantId !== tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    return manifest;
  }),
```

### 2. Detail Page Implementation

**File**: `src/app/dashboard/manifests/[id]/page.tsx`

Created a comprehensive manifest detail page featuring:

- **Feature Flag Gating**: Respects `NEXT_PUBLIC_DMOC_MIGRATION=1`
- **Responsive Design**: Desktop and mobile layouts
- **Rich Information Display**:
  - Manifest basic details (title, status, dates)
  - Company and organization information
  - Route stops with location data
  - Timeline with status progression
- **Error Handling**: Loading states, error messages, and not found scenarios
- **Navigation**: Back button to manifest list

#### Key Features:

1. **Status Visualization**: Color-coded badges with icons for different manifest statuses
2. **Route Display**: Interactive stop list with arrival/departure times
3. **Quick Actions**: Edit, view on map, update schedule buttons
4. **Timeline**: Visual progression of manifest lifecycle

### 3. Navigation Integration

**File**: `src/app/dashboard/manifests/page.tsx`

Updated the manifest list page to include navigation links:

- **Desktop Table**: Clickable manifest titles linking to detail pages
- **Mobile Cards**: Clickable titles and dedicated "View" buttons
- **Action Menus**: "View Details" option in dropdown menus

## Security Considerations

### Tenant Isolation

The implementation ensures multi-tenant security through:

1. **Database Query Filtering**: All queries include tenant ID constraints
2. **Defensive Checks**: Additional validation after data retrieval
3. **Error Handling**: Proper error codes for unauthorized access attempts

### Feature Flag Protection

Both the list and detail pages respect the migration feature flag:

```typescript
if (process.env.NEXT_PUBLIC_DMOC_MIGRATION !== "1") {
  return <FeatureDisabledMessage />;
}
```

## Database Schema Dependencies

The implementation relies on the following Prisma schema relationships:

```prisma
model Manifest {
  id          String   @id @default(cuid())
  companyId   String
  title       String
  status      String   @default("SCHEDULED")
  scheduledAt DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  stops   Stop[]
}

model Company {
  id       String   @id @default(cuid())
  orgId    String
  name     String

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  manifests    Manifest[]
}

model Organization {
  id       String   @id @default(cuid())
  tenantId String
  name     String

  tenant   Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  companies Company[]
}
```

## Testing Checklist

### Manual Testing Steps

1. **Valid Access**:
   - Navigate to `/dashboard/manifests`
   - Click on a manifest title or "View Details" button
   - Verify detail page loads with correct information

2. **Tenant Isolation**:
   - Attempt to access a manifest ID from another tenant
   - Verify FORBIDDEN error or no data returned

3. **Feature Flag**:
   - Set `NEXT_PUBLIC_DMOC_MIGRATION=0`
   - Verify both list and detail pages show disabled message

4. **Error Handling**:
   - Navigate to non-existent manifest ID
   - Verify NOT_FOUND error handling

5. **Responsive Design**:
   - Test on desktop and mobile viewports
   - Verify proper layout adaptation

## Files Modified

- `src/server/api/routers/manifest.ts` - Enhanced getById procedure
- `src/app/dashboard/manifests/[id]/page.tsx` - New detail page (created)
- `src/app/dashboard/manifests/page.tsx` - Added navigation links

## Commit Information

**Commit**: `0cfeb6f`  
**Message**: "DMOC Step 2: add manifest.getById (tRPC) + detail page with tenant isolation and feature-flag gating"

## Development Server Setup

### Starting the Development Server

The DMOC application runs both frontend (Next.js) and backend (Socket.IO) services in a single process on port 3000.

#### Recommended Start Method:

```bash
npm run dev:clean
```

This script automatically:

- Kills any existing processes on ports 3000 and 3001
- Waits for ports to be released
- Starts the development server with both frontend and backend

#### Alternative Methods:

```bash
# Standard start (may fail if ports are in use)
npm run dev

# Windows batch file version
npm run dev:clean:win
```

### Environment Variables Required

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_DMOC_MIGRATION=1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-development-only
```

### Troubleshooting

#### Port Already in Use Error

If you get `EADDRINUSE` errors:

1. Use `npm run dev:clean` instead of `npm run dev`
2. Or manually kill processes: `taskkill /f /im node.exe`

#### ChunkLoadError

If you see chunk loading errors:

1. Stop the dev server (`Ctrl+C`)
2. Clear Next.js cache: `Remove-Item -Recurse -Force .next`
3. Restart with `npm run dev:clean`

## Next Steps

This implementation provides the foundation for:

- Manifest editing functionality
- Real-time status updates via Socket.IO
- Advanced filtering and search capabilities
- Integration with tracking and GPS data

The tenant isolation pattern established here should be replicated across all other entity detail pages in the migration process.
