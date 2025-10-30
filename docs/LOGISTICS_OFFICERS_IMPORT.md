# Logistics Officers Import & Management Guide

## Purpose

Guide for onboarding, normalizing, and seeding logistics staff ("officers") into the DMOC app from Windows legacy/exported data located at `docs/Logistics_Officers.txt`. Also includes patterns for privacy compliance and UI best practices.

---

## Data Source

- **File:** `docs/Logistics_Officers.txt`
- **Format:** Tabular export (TSV, can be converted to CSV/JSON for programmatic import)
- **Columns Used:**
  - `Name` → `name` (officer's full name)
  - `ContactNr` → `phone`
  - `CountryOfOrigin` → tenant/country mapping
  - `PictureLoaded` → `isActive` (boolean)
  - `IDNumber`, `DateTimeAdded`, `ID`, `DisplayValue` (legacy/auxiliary)

---

## Prisma Model Mapping

```
model LogisticsOfficer {
  id         String   @id @default(cuid())
  tenantId   String
  name       String
  role       String? // always set: "Officer"
  email      String? // set: null
  phone      String?
  isActive   Boolean  @default(true) // from PictureLoaded
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([tenantId, name])
  @@map("logistics_officers")
}
```

---

## Data Seeding Checklist

1. **Parse File:**
   - Required fields: name, phone, tenant/country, pictureLoaded (isActive)
2. **Map Tenants:**
   - ZAMBIA → `tenant_cobra`
   - ZIMBABWE → `tenant_delta`
   - TANZANIA → `tenant_tanzania`
   - (Add more as needed)
3. **Field Defaulting:**
   - `role`: "Officer"
   - `email`: null
   - `isActive`: Boolean(`PictureLoaded`)
4. **Do NOT Trim:**
   - Retain field whitespace per user instruction.
5. **Create Import Array:**
   - Each row →
     ```json
     {
       "tenantId": "tenant_cobra",
       "name": "AMOS SIKAONA",
       "role": "Officer",
       "email": null,
       "phone": "260774539404",
       "isActive": true
     }
     ```
6. **Bulk-Insert with Prisma:**
   - `prisma.logisticsOfficer.createMany({ data: officersArray })`
7. **Verify Counts:**
   - Ensure record count matches source rows.

---

## Sensitive Data & POPIA Compliance

- Officer cards in the UI mask personal/sensitive fields for non-admin/non-manager roles.
- Include `<PrivacyNotice userRole={role} />` on detail modals for awareness.
- Only allow authorized users to view full details (auto-masked for all others).
- Use `MaskSensitive` utility (to be created) for fields shown in card and modal.

---

## UI Pattern Checklist

- **Cards, not table:**
  - Minimal card: name (masked if needed), country/tenant, phone (masked), active status chip.
  - Card click → opens modal with full details (image support, more fields, PrivacyNotice, unmask on permission)
  - Filters: tenant, country, search bar
  - Paginated for usability

---

## Support/Maintainance

- Update `docs/Logistics_Officers.txt` as new officers join (format: add new row)
- Regenerate Prisma client & run seeder as needed
- Update tenant/country mapping table if additional tenants/countries join system
