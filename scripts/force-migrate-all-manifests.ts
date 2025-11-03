// scripts/force-migrate-all-manifests.ts
// Force migrate all manifests from local to production, ensuring they exist regardless of tenant mismatch

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Database from 'better-sqlite3';

dotenv.config({ path: path.join(process.cwd(), '.env.production') });

const dbUrl = process.env.dmoc_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ No DATABASE_URL found');
  process.exit(1);
}

async function forceMigrateManifests() {
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  // Use better-sqlite3 for local reads (avoids schema switching issues)
  const sqliteDb = new Database('prisma/dev.db', { readonly: true });

  try {
    console.log('🔄 Force Migrating All Manifests from Local to Production...\n');

    // Read all manifests from local SQLite
    const localManifests = sqliteDb.prepare('SELECT * FROM manifests').all() as any[];
    console.log(`📥 Found ${localManifests.length} manifests in local database\n`);

    if (localManifests.length === 0) {
      console.log('⚠️  No manifests to migrate');
      sqliteDb.close();
      await prisma.$disconnect();
      return;
    }

    // Get or create production tenant
    let prodTenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' }
    });

    if (!prodTenant) {
      const localTenant = sqliteDb.prepare('SELECT * FROM tenants WHERE slug = ?').get('digiwize') as any;
      if (localTenant) {
        prodTenant = await prisma.tenant.create({
          data: {
            id: localTenant.id,
            name: localTenant.name,
            slug: localTenant.slug,
            settings: localTenant.settings,
            createdAt: typeof localTenant.createdAt === 'number' 
              ? new Date(localTenant.createdAt) 
              : new Date(localTenant.createdAt || Date.now()),
            updatedAt: typeof localTenant.updatedAt === 'number' 
              ? new Date(localTenant.updatedAt) 
              : new Date(localTenant.updatedAt || Date.now()),
          }
        });
        console.log(`✅ Created production tenant: ${prodTenant.name}\n`);
      } else {
        console.error('❌ Local tenant not found');
        sqliteDb.close();
        await prisma.$disconnect();
        process.exit(1);
      }
    }

    // Get mapping for related entities
    const companies = await prisma.company.findMany();
    const companyMap = new Map(companies.map(c => [c.name, c.id]));

    const routes = await prisma.route.findMany();
    const routeMap = new Map(routes.map(r => [r.name, r.id]));

    const locations = await prisma.location.findMany();
    const locationMap = new Map(locations.map(l => [l.description, l.id]));

    const invoiceStates = await prisma.invoiceState.findMany();
    const invoiceStateMap = new Map(invoiceStates.map(s => [s.code, s.id]));

    let migrated = 0;
    let updated = 0;
    let errors = 0;

    console.log('📦 Migrating manifests...\n');

    for (const manifest of localManifests) {
      try {
        // Convert SQLite date integers to Date objects
        const scheduledAt = manifest.scheduledAt ? (
          typeof manifest.scheduledAt === 'number' 
            ? new Date(manifest.scheduledAt) 
            : new Date(manifest.scheduledAt)
        ) : null;

        const dateTimeAdded = manifest.dateTimeAdded ? (
          typeof manifest.dateTimeAdded === 'number' 
            ? new Date(manifest.dateTimeAdded) 
            : new Date(manifest.dateTimeAdded)
        ) : null;

        const dateTimeUpdated = manifest.dateTimeUpdated ? (
          typeof manifest.dateTimeUpdated === 'number' 
            ? new Date(manifest.dateTimeUpdated) 
            : new Date(manifest.dateTimeUpdated)
        ) : null;

        const dateTimeEnded = manifest.dateTimeEnded ? (
          typeof manifest.dateTimeEnded === 'number' 
            ? new Date(manifest.dateTimeEnded) 
            : new Date(manifest.dateTimeEnded)
        ) : null;

        // Map related IDs
        const companyId = manifest.companyId ? (
          companies.find(c => c.id === manifest.companyId)?.id || null
        ) : null;

        const routeId = manifest.routeId ? (
          routes.find(r => r.id === manifest.routeId)?.id || null
        ) : null;

        const locationId = manifest.locationId ? (
          locations.find(l => l.id === manifest.locationId)?.id || null
        ) : null;

        const parkLocationId = manifest.parkLocationId ? (
          locations.find(l => l.id === manifest.parkLocationId)?.id || null
        ) : null;

        const invoiceStateId = manifest.invoiceStateId ? (
          invoiceStates.find(s => s.id === manifest.invoiceStateId)?.id || null
        ) : null;

        // Check if exists by ID or trackingId
        const existing = await prisma.manifest.findFirst({
          where: {
            OR: [
              { id: manifest.id },
              { trackingId: manifest.trackingId }
            ]
          }
        });

        const manifestData: any = {
          id: manifest.id,
          tenantId: prodTenant.id, // Use production tenant ID
          title: manifest.title,
          status: manifest.status,
          trackingId: manifest.trackingId,
          tripStateId: manifest.tripStateId,
          rmn: manifest.rmn || undefined,
          jobNumber: manifest.jobNumber || undefined,
          invoiceNumber: manifest.invoiceNumber || undefined,
          scheduledAt: scheduledAt || undefined,
          dateTimeAdded: dateTimeAdded || undefined,
          dateTimeUpdated: dateTimeUpdated || undefined,
          dateTimeEnded: dateTimeEnded || undefined,
        };

        // Only add optional fields if they exist
        if (companyId) manifestData.companyId = companyId;
        if (routeId) manifestData.routeId = routeId;
        if (locationId) manifestData.locationId = locationId;
        if (parkLocationId) manifestData.parkLocationId = parkLocationId;
        if (invoiceStateId) manifestData.invoiceStateId = invoiceStateId;

        if (existing) {
          // Update existing
          await prisma.manifest.update({
            where: { id: existing.id },
            data: manifestData
          });
          updated++;
          if (updated % 50 === 0) {
            console.log(`   ✅ Updated ${updated} manifests...`);
          }
        } else {
          // Create new
          await prisma.manifest.create({
            data: manifestData
          });
          migrated++;
          if (migrated % 50 === 0) {
            console.log(`   ✅ Created ${migrated} manifests...`);
          }
        }
      } catch (error: any) {
        errors++;
        if (errors <= 10) {
          console.error(`   ❌ Error migrating manifest ${manifest.id}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Migration Complete:`);
    console.log(`   📦 Created: ${migrated}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}\n`);

    // Verify
    const totalManifests = await prisma.manifest.count();
    console.log(`📊 Total manifests in production: ${totalManifests}\n`);

    sqliteDb.close();
    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    sqliteDb.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

forceMigrateManifests();

