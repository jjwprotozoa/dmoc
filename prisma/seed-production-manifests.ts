// prisma/seed-production-manifests.ts
// Import manifest data from local SQLite to production PostgreSQL
// 
// NOTE: This script requires switching between SQLite and PostgreSQL schemas.
// For a simpler approach, use: npm run dmoc:import:active (reads from file)

import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// PostgreSQL for destination (production database)  
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting manifest data migration to production...');
  console.log('💡 Tip: For a simpler approach, use: npm run dmoc:import:active (reads from file)');

  try {
    // Check if dev.db exists
    const devDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(devDbPath)) {
      throw new Error(
        `Local SQLite database not found at ${devDbPath}.\n` +
        `Please run local seed first OR use file-based import:\n` +
        `  npm run dmoc:import:active`
      );
    }

    // Use better-sqlite3 to read directly from SQLite (no Prisma schema switching needed)
    console.log('📥 Reading manifests from local SQLite database...');
    const db = new Database(devDbPath, { readonly: true });
    
    // Query manifests directly with SQL
    const manifestRows = db.prepare(`
      SELECT 
        m.*,
        c.name as company_name,
        r.name as route_name,
        l.description as location_description,
        pl.description as park_location_description,
        i.code as invoice_state_code
      FROM manifests m
      LEFT JOIN companies c ON m.companyId = c.id
      LEFT JOIN routes r ON m.routeId = r.id
      LEFT JOIN locations l ON m.locationId = l.id
      LEFT JOIN locations pl ON m.parkLocationId = pl.id
      LEFT JOIN invoicestates i ON m.invoiceStateId = i.id
    `).all() as any[];
    
    console.log(`📊 Found ${manifestRows.length} manifests to migrate`);

    if (manifestRows.length === 0) {
      console.log('⚠️  No manifests found in local database');
      db.close();
      return;
    }

    // Get or create the tenant
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' }
    });

    if (!tenant) {
      console.log('⚠️  Tenant "digiwize" not found, creating it...');
      // Get the tenant from local database to copy it
      const localTenantRow = db.prepare('SELECT * FROM tenants WHERE slug = ?').get('digiwize') as any;
      
      if (localTenantRow) {
        tenant = await prisma.tenant.create({
          data: {
            id: localTenantRow.id, // Use same ID to match
            name: localTenantRow.name,
            slug: localTenantRow.slug,
            settings: localTenantRow.settings,
          }
        });
        console.log(`✅ Created tenant: ${tenant.name} (${tenant.id})`);
      } else {
        console.error('❌ Tenant "digiwize" not found in local database either');
        db.close();
        return;
      }
    } else {
      console.log(`✅ Using existing tenant: ${tenant.name} (${tenant.id})`);
      
      // Check if we should update tenant ID to match local
      const localTenantRow = db.prepare('SELECT * FROM tenants WHERE slug = ?').get('digiwize') as any;
      
      if (localTenantRow && localTenantRow.id !== tenant.id) {
        console.log(`⚠️  Tenant ID mismatch: Local=${localTenantRow.id}, Prod=${tenant.id}`);
        console.log(`💡 Migrating manifests to use local tenant ID: ${localTenantRow.id}`);
        // We'll use local tenant ID for migration
      }
    }

    // Get local tenant to match IDs - CRITICAL for proper data sync
    const localTenantRow = db.prepare('SELECT * FROM tenants WHERE slug = ?').get('digiwize') as any;
    
    const targetTenantId = localTenantRow?.id || tenant.id;
    
    // If tenant IDs don't match, we need to update existing tenant or migrate data
    if (tenant.id !== targetTenantId) {
      console.log(`⚠️  Tenant ID mismatch detected!`);
      console.log(`   Production tenant: ${tenant.id}`);
      console.log(`   Local tenant: ${targetTenantId}`);
      console.log(`   Will migrate manifests to match local tenant ID`);
    }

    // Get all companies, routes, and locations from production
    // Note: InvoiceState is global (no tenantId), Company uses orgId
    // Use TARGET tenant ID (local) to find associated data
    const organization = await prisma.organization.findFirst({
      where: { tenantId: targetTenantId }
    });
    
    const [companies, routes, locations, invoiceStates] = await Promise.all([
      organization ? prisma.company.findMany({ where: { orgId: organization.id } }) : [],
      prisma.route.findMany({ where: { tenantId: targetTenantId } }),
      prisma.location.findMany({ where: { tenantId: targetTenantId } }),
      prisma.invoiceState.findMany(), // Global table, no tenantId
    ]);

    // Create maps for quick lookup
    const companyMap = new Map(companies.map(c => [c.name, c]));
    const routeMap = new Map(routes.map(r => [r.name, r]));
    const locationMap = new Map(locations.map(l => [l.name, l]));
    const invoiceStateMap = new Map(invoiceStates.map(s => [s.code, s]));

    console.log(`📦 Found in production:`);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Invoice States: ${invoiceStates.length}`);

    let migrated = 0;
    let skipped = 0;


    for (const manifestRow of manifestRows) {
      const manifest = {
        id: manifestRow.id,
        tenantId: manifestRow.tenantId,
        title: manifestRow.title,
        status: manifestRow.status,
        trackingId: manifestRow.trackingId,
        tripStateId: manifestRow.tripStateId,
        companyId: manifestRow.companyId,
        routeId: manifestRow.routeId,
        locationId: manifestRow.locationId,
        parkLocationId: manifestRow.parkLocationId,
        countryId: manifestRow.countryId,
        invoiceStateId: manifestRow.invoiceStateId,
        invoiceNumber: manifestRow.invoiceNumber,
        rmn: manifestRow.rmn,
        jobNumber: manifestRow.jobNumber,
        scheduledAt: manifestRow.scheduledAt ? new Date(manifestRow.scheduledAt) : null,
        dateTimeAdded: manifestRow.dateTimeAdded ? new Date(manifestRow.dateTimeAdded) : null,
        dateTimeUpdated: manifestRow.dateTimeUpdated ? new Date(manifestRow.dateTimeUpdated) : null,
        dateTimeEnded: manifestRow.dateTimeEnded ? new Date(manifestRow.dateTimeEnded) : null,
        company: manifestRow.company_name ? { name: manifestRow.company_name } : null,
        route: manifestRow.route_name ? { name: manifestRow.route_name } : null,
        location: manifestRow.location_description ? { description: manifestRow.location_description } : null,
        parkLocation: manifestRow.park_location_description ? { description: manifestRow.park_location_description } : null,
        invoiceState: manifestRow.invoice_state_code ? { code: manifestRow.invoice_state_code } : null,
      };
      try {
        // Check if manifest already exists (by trackingId, regardless of tenant)
        const existing = await prisma.manifest.findFirst({
          where: {
            trackingId: manifest.trackingId,
          }
        });

        if (existing) {
          // Update existing manifest to match local data (especially titles!)
          const needsUpdate = 
            existing.title !== manifest.title ||
            existing.status !== manifest.status ||
            existing.tenantId !== targetTenantId;

          if (needsUpdate) {
            console.log(`🔄 Updating ${manifest.trackingId || manifest.id.slice(-8)}`);
            await prisma.manifest.update({
              where: { id: existing.id },
              data: {
                tenantId: targetTenantId,
                title: manifest.title,
                status: manifest.status,
                scheduledAt: manifest.scheduledAt,
                dateTimeAdded: manifest.dateTimeAdded,
                dateTimeUpdated: manifest.dateTimeUpdated,
                dateTimeEnded: manifest.dateTimeEnded,
                tripStateId: manifest.tripStateId,
                rmn: manifest.rmn,
                jobNumber: manifest.jobNumber,
                invoiceNumber: manifest.invoiceNumber,
              }
            });
            migrated++; // Count as migrated since we updated it
          } else {
            skipped++;
          }
          continue;
        }

        // Map related IDs if they exist
        const companyId = manifest.company?.name ? companyMap.get(manifest.company.name)?.id : null;
        const routeId = manifest.route?.name ? routeMap.get(manifest.route.name)?.id : null;
        const locationId = manifest.location?.description ? 
          locationMap.get(manifest.location.description)?.id : null;
        const parkLocationId = manifest.parkLocation?.description ? 
          locationMap.get(manifest.parkLocation.description)?.id : null;
        const invoiceStateId = manifest.invoiceState?.code ? 
          invoiceStateMap.get(manifest.invoiceState.code)?.id : null;

        // Create manifest in production (use local tenant ID to match)
        await prisma.manifest.create({
          data: {
            id: manifest.id,
            tenantId: targetTenantId, // Use local tenant ID
            title: manifest.title,
            status: manifest.status,
            trackingId: manifest.trackingId,
            tripStateId: manifest.tripStateId,
            routeId: routeId || undefined,
            companyId: companyId || undefined,
            locationId: locationId || undefined,
            parkLocationId: parkLocationId || undefined,
            countryId: manifest.countryId || undefined,
            invoiceStateId: invoiceStateId || undefined,
            invoiceNumber: manifest.invoiceNumber || undefined,
            rmn: manifest.rmn || undefined,
            jobNumber: manifest.jobNumber || undefined,
            scheduledAt: manifest.scheduledAt,
            dateTimeAdded: manifest.dateTimeAdded,
            dateTimeUpdated: manifest.dateTimeUpdated,
            dateTimeEnded: manifest.dateTimeEnded,
          },
        });

        migrated++;
        if (migrated % 10 === 0) {
          console.log(`✅ Migrated ${migrated} manifests...`);
        }

        // Migrate manifest locations if they exist
        const localLocations = db.prepare('SELECT * FROM manifest_locations WHERE manifestId = ?').all(manifest.id) as any[];

        if (localLocations.length > 0) {
          await prisma.manifestLocation.createMany({
            data: localLocations.map(loc => ({
              id: loc.id,
              tenantId: tenant.id,
              manifestId: manifest.id,
              latitude: loc.latitude,
              longitude: loc.longitude,
              recordedAt: loc.recordedAt,
            })),
            skipDuplicates: true,
          });
        }

      } catch (error) {
        console.error(`❌ Error migrating manifest ${manifest.trackingId}:`, error);
      }
    }

    console.log('\n🎉 Manifest migration completed!');
    console.log(`✅ Migrated: ${migrated} manifests`);
    console.log(`⏭️  Skipped: ${skipped} manifests (already exist)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n💡 Alternative: Use file-based import instead:');
    console.error('   npm run dmoc:import:active');
    throw error;
  } finally {
    if (typeof db !== 'undefined' && db) {
      db.close();
    }
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

