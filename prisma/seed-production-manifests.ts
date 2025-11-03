// prisma/seed-production-manifests.ts
// Import manifest data from local SQLite to production PostgreSQL

import { PrismaClient as PostgresPrismaClient, PrismaClient as SQLitePrismaClient } from '@prisma/client';

// Create two separate Prisma clients
// SQLite for source (local dev database)
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: { url: 'file:./dev.db' }
  }
}) as any; // Type assertion to bypass type checking

// PostgreSQL for destination (production database)  
const prisma = new PostgresPrismaClient();

async function main() {
  console.log('🌱 Starting manifest data migration to production...');

  try {
    // Get all manifests from local SQLite database
    console.log('📥 Fetching manifests from local database...');
    const localManifests = await sqliteClient.manifest.findMany({
      include: {
        company: true,
        route: true,
        location: true,
        parkLocation: true,
        invoiceState: true,
      }
    });

    console.log(`📊 Found ${localManifests.length} manifests to migrate`);

    if (localManifests.length === 0) {
      console.log('⚠️  No manifests found in local database');
      return;
    }

    // Get or create the tenant
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' }
    });

    if (!tenant) {
      console.log('⚠️  Tenant "digiwize" not found, creating it...');
      // Get the tenant from local database to copy it
      const localTenant = await sqliteClient.tenant.findUnique({
        where: { slug: 'digiwize' }
      });
      
      if (localTenant) {
        tenant = await prisma.tenant.create({
          data: {
            id: localTenant.id, // Use same ID to match
            name: localTenant.name,
            slug: localTenant.slug,
            settings: localTenant.settings,
          }
        });
        console.log(`✅ Created tenant: ${tenant.name} (${tenant.id})`);
      } else {
        console.error('❌ Tenant "digiwize" not found in local database either');
        return;
      }
    } else {
      console.log(`✅ Using existing tenant: ${tenant.name} (${tenant.id})`);
      
      // Check if we should update tenant ID to match local
      const localTenant = await sqliteClient.tenant.findUnique({
        where: { slug: 'digiwize' }
      });
      
      if (localTenant && localTenant.id !== tenant.id) {
        console.log(`⚠️  Tenant ID mismatch: Local=${localTenant.id}, Prod=${tenant.id}`);
        console.log(`💡 Migrating manifests to use local tenant ID: ${localTenant.id}`);
        // We'll use local tenant ID for migration
      }
    }

    // Get local tenant to match IDs - CRITICAL for proper data sync
    const localTenant = await sqliteClient.tenant.findUnique({
      where: { slug: 'digiwize' }
    });
    
    const targetTenantId = localTenant?.id || tenant.id;
    
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


    for (const manifest of localManifests) {
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
        const localLocations = await sqliteClient.manifestLocation.findMany({
          where: { manifestId: manifest.id }
        });

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
  } finally {
    await sqliteClient.$disconnect();
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

