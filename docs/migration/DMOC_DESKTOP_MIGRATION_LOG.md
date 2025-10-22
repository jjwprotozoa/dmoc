# DMOC Desktop Migration Log

This document tracks the incremental migration from the Windows DMOC desktop application to the web-based PWA version.

## Migration Strategy

- **Approach**: Tiny, verifiable increments - one function at a time
- **Each step includes**: (a) files to touch, (b) exact code to paste, (c) a quick test, (d) a one-line migration-log entry
- **Feature flag**: `NEXT_PUBLIC_DMOC_MIGRATION=1` toggles new UI pages
- **Safety**: Routers are additive only, no changes to existing functionality

## Function Order (ascending risk)

1. `manifest.list` (read-only) ✅
2. `manifest.getById`
3. `manifest.create`
4. `manifest.setTripState`
5. `incident.create`
6. `tracking.latest`
7. `pricing.listClientRoute`
8. `billing.generateForManifest`
9. `whatsapp.list`
10. `whatsapp.attachToManifest`
11. `convoy.addManifest` / `convoy.removeManifest`
12. Export endpoints (PDF/XLSX)

---

## Migration Entries

### 2025-10-22 Add manifest.list (read-only) and modernized UI ✅

- **Why:** First safe parity step from legacy `frmMain` manifests grid; low risk, read-only.
- **Added:**
  - src/server/api/routers/manifest.ts (`list` procedure)
  - src/app/dashboard/manifests/page.tsx (modernized UI)
  - src/components/ui/badge.tsx (shadcn component)
  - src/components/ui/card.tsx (shadcn component)
- **tRPC:** `manifest.list(q?, status[], take, skip)`; tenant-scoped via organization relationship
- **Routes:** `/dashboard/manifests` (hidden unless `NEXT_PUBLIC_DMOC_MIGRATION=1`)
- **UI Features:**
  - Responsive design (mobile cards + desktop table)
  - Modern search and filtering interface
  - Status badges with color coding
  - Action dropdowns (view/edit/delete)
  - Stats cards showing manifest counts
  - Proper loading and error states
- **Notes/compat:** additive-only; no changes to existing routers or models.
- **Status:** ✅ Implemented, tested, and modernized successfully
