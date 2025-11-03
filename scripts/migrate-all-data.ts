// scripts/migrate-all-data.ts
// Comprehensive data migration from local SQLite to production PostgreSQL
// Migrates ALL data, not just manifests

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Use better-sqlite3 for direct SQLite access (avoids schema switching)
const sqlite = require('better-sqlite3');
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Local database not found at:', dbPath);
  process.exit(1);
}

const sqliteDb = sqlite(dbPath);

// Load production environment
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

const dbUrl = process.env.dmoc_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ No DATABASE_URL found in .env.production');
  sqliteDb.close();
  process.exit(1);
}

// Create PostgreSQL client
const postgresClient = new PrismaClient({
  datasources: {
    db: { url: dbUrl }
  }
});

interface MigrationStats {
  [key: string]: { migrated: number; skipped: number; errors: number };
}

async function migrateAllData() {
  console.log('🚀 Starting comprehensive data migration...\n');
  
  const stats: MigrationStats = {};

  try {
    // 1. Tenants (must be first - other data depends on it)
    console.log('📋 Migrating Tenants...');
    const localTenants = sqliteDb.prepare('SELECT * FROM tenants').all() as any[];
    stats.tenants = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const tenant of localTenants) {
      try {
        await postgresClient.tenant.upsert({
          where: { id: tenant.id },
          update: {
            ...tenant,
            createdAt: typeof tenant.createdAt === 'number' ? new Date(tenant.createdAt) : (tenant.createdAt ? new Date(tenant.createdAt) : new Date()),
            updatedAt: typeof tenant.updatedAt === 'number' ? new Date(tenant.updatedAt) : (tenant.updatedAt ? new Date(tenant.updatedAt) : new Date()),
          },
          create: {
            ...tenant,
            createdAt: typeof tenant.createdAt === 'number' ? new Date(tenant.createdAt) : (tenant.createdAt ? new Date(tenant.createdAt) : new Date()),
            updatedAt: typeof tenant.updatedAt === 'number' ? new Date(tenant.updatedAt) : (tenant.updatedAt ? new Date(tenant.updatedAt) : new Date()),
          },
        });
        stats.tenants.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.tenants.skipped++;
        } else {
          console.error(`   Error migrating tenant ${tenant.id}:`, error.message);
          stats.tenants.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.tenants.migrated}, Skipped: ${stats.tenants.skipped}, Errors: ${stats.tenants.errors}\n`);

    // 2. Organizations
    console.log('🏢 Migrating Organizations...');
    const localOrgs = sqliteDb.prepare('SELECT * FROM organizations').all() as any[];
    stats.organizations = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const org of localOrgs) {
      try {
        await postgresClient.organization.upsert({
          where: { id: org.id },
          update: org,
          create: org,
        });
        stats.organizations.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.organizations.skipped++;
        } else {
          stats.organizations.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.organizations.migrated}, Skipped: ${stats.organizations.skipped}, Errors: ${stats.organizations.errors}\n`);

    // 3. Users
    console.log('👥 Migrating Users...');
    const localUsers = sqliteDb.prepare('SELECT * FROM users').all() as any[];
    stats.users = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const user of localUsers) {
      try {
        await postgresClient.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
        stats.users.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.users.skipped++;
        } else {
          stats.users.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.users.migrated}, Skipped: ${stats.users.skipped}, Errors: ${stats.users.errors}\n`);

    // 4. Companies
    console.log('🏭 Migrating Companies...');
    const localCompanies = sqliteDb.prepare('SELECT * FROM companies').all() as any[];
    stats.companies = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const company of localCompanies) {
      try {
        await postgresClient.company.upsert({
          where: { id: company.id },
          update: company,
          create: company,
        });
        stats.companies.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.companies.skipped++;
        } else {
          stats.companies.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.companies.migrated}, Skipped: ${stats.companies.skipped}, Errors: ${stats.companies.errors}\n`);

    // 5. Routes
    console.log('🛣️  Migrating Routes...');
    const localRoutes = sqliteDb.prepare('SELECT * FROM routes').all() as any[];
    stats.routes = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const route of localRoutes) {
      try {
        await postgresClient.route.upsert({
          where: { 
            tenantId_name: {
              tenantId: route.tenantId,
              name: route.name,
            }
          },
          update: route,
          create: route,
        });
        stats.routes.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.routes.skipped++;
        } else {
          stats.routes.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.routes.migrated}, Skipped: ${stats.routes.skipped}, Errors: ${stats.routes.errors}\n`);

    // 6. Countries
    console.log('🌍 Migrating Countries...');
    const localCountries = sqliteDb.prepare('SELECT * FROM countries').all() as any[];
    stats.countries = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const country of localCountries) {
      try {
        await postgresClient.country.upsert({
          where: { id: country.id },
          update: country,
          create: country,
        });
        stats.countries.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.countries.skipped++;
        } else {
          stats.countries.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.countries.migrated}, Skipped: ${stats.countries.skipped}, Errors: ${stats.countries.errors}\n`);

    // 7. Locations
    console.log('📍 Migrating Locations...');
    const localLocations = sqliteDb.prepare('SELECT * FROM locations').all() as any[];
    stats.locations = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const location of localLocations) {
      try {
        await postgresClient.location.upsert({
          where: { locationId: location.locationId },
          update: location,
          create: location,
        });
        stats.locations.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.locations.skipped++;
        } else {
          stats.locations.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.locations.migrated}, Skipped: ${stats.locations.skipped}, Errors: ${stats.locations.errors}\n`);

    // 8. Contacts
    console.log('📞 Migrating Contacts...');
    const localContacts = sqliteDb.prepare('SELECT * FROM contacts').all() as any[];
    stats.contacts = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const contact of localContacts) {
      try {
        await postgresClient.contact.upsert({
          where: { contactId: contact.contactId },
          update: contact,
          create: contact,
        });
        stats.contacts.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.contacts.skipped++;
        } else {
          stats.contacts.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.contacts.migrated}, Skipped: ${stats.contacts.skipped}, Errors: ${stats.contacts.errors}\n`);

    // 9. Logistics Officers
    console.log('👮 Migrating Logistics Officers...');
    const localOfficers = sqliteDb.prepare('SELECT * FROM logisticsOfficers').all() as any[];
    stats.logisticsOfficers = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const officer of localOfficers) {
      try {
        await postgresClient.logisticsOfficer.upsert({
          where: { logisticsOfficerId: officer.logisticsOfficerId },
          update: officer,
          create: officer,
        });
        stats.logisticsOfficers.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.logisticsOfficers.skipped++;
        } else {
          stats.logisticsOfficers.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.logisticsOfficers.migrated}, Skipped: ${stats.logisticsOfficers.skipped}, Errors: ${stats.logisticsOfficers.errors}\n`);

    // 10. Vehicles
    console.log('🚛 Migrating Vehicles...');
    const localVehicles = sqliteDb.prepare('SELECT * FROM vehicles').all() as any[];
    stats.vehicles = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const vehicle of localVehicles) {
      try {
        await postgresClient.vehicle.upsert({
          where: { vehicleId: vehicle.vehicleId },
          update: vehicle,
          create: vehicle,
        });
        stats.vehicles.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.vehicles.skipped++;
        } else {
          stats.vehicles.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.vehicles.migrated}, Skipped: ${stats.vehicles.skipped}, Errors: ${stats.vehicles.errors}\n`);

    // 11. Drivers
    console.log('🚗 Migrating Drivers...');
    const localDrivers = sqliteDb.prepare('SELECT * FROM drivers').all() as any[];
    stats.drivers = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const driver of localDrivers) {
      try {
        await postgresClient.driver.upsert({
          where: { driverId: driver.driverId },
          update: driver,
          create: driver,
        });
        stats.drivers.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.drivers.skipped++;
        } else {
          stats.drivers.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.drivers.migrated}, Skipped: ${stats.drivers.skipped}, Errors: ${stats.drivers.errors}\n`);

    // 12. Invoice States
    console.log('💳 Migrating Invoice States...');
    const localInvoiceStates = sqliteDb.prepare('SELECT * FROM invoiceStates').all() as any[];
    stats.invoiceStates = { migrated: 0, skipped: 0, errors: 0 };
    
    for (const state of localInvoiceStates) {
      try {
        await postgresClient.invoiceState.upsert({
          where: { code: state.code },
          update: state,
          create: state,
        });
        stats.invoiceStates.migrated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          stats.invoiceStates.skipped++;
        } else {
          stats.invoiceStates.errors++;
        }
      }
    }
    console.log(`   ✅ Migrated: ${stats.invoiceStates.migrated}, Skipped: ${stats.invoiceStates.skipped}, Errors: ${stats.invoiceStates.errors}\n`);

    // 13. Manifests (with relations)
    console.log('📦 Migrating Manifests...');
    const localManifests = sqliteDb.prepare('SELECT * FROM Manifest').all() as any[];
    
    // Get related data for mapping
    const sqliteCompanies = sqliteDb.prepare('SELECT id, name FROM companies').all() as any[];
    const sqliteRoutes = sqliteDb.prepare('SELECT id, name FROM routes').all() as any[];
    const sqliteLocations = sqliteDb.prepare('SELECT id, name, description FROM locations').all() as any[];
    
    // Create lookup maps
    const sqliteCompanyMap = new Map(sqliteCompanies.map(c => [c.id, c]));
    const sqliteRouteMap = new Map(sqliteRoutes.map(r => [r.id, r]));
    const sqliteLocationMap = new Map(sqliteLocations.map(l => [l.id, l]));
    stats.manifests = { migrated: 0, skipped: 0, errors: 0 };
    
    // Get mappings for production IDs
    const prodCompanies = await postgresClient.company.findMany();
    const prodRoutes = await postgresClient.route.findMany();
    const prodLocations = await postgresClient.location.findMany();
    
    const companyMap = new Map(prodCompanies.map(c => [c.name, c.id]));
    const routeMap = new Map(prodRoutes.map(r => [r.name, r.id]));
    const locationMap = new Map(prodLocations.map(l => [l.name, l.id]));
    
    for (const manifest of localManifests) {
      try {
        const existing = await postgresClient.manifest.findFirst({
          where: {
            tenantId: manifest.tenantId,
            trackingId: manifest.trackingId || manifest.trackingID,
          }
        });

        if (existing) {
          stats.manifests.skipped++;
          continue;
        }

        const companyId = manifest.company_name ? companyMap.get(manifest.company_name) : null;
        const routeId = manifest.route_name ? routeMap.get(manifest.route_name) : null;
        const locationId = manifest.location_description ? 
          locationMap.get(manifest.location_description) : null;
        const parkLocationId = manifest.parkLocation_description ? 
          locationMap.get(manifest.parkLocation_description) : null;

        await postgresClient.manifest.create({
          data: {
            id: manifest.id,
            tenantId: manifest.tenantId,
            title: manifest.title,
            status: manifest.status,
            trackingId: manifest.trackingId || manifest.trackingID || undefined,
            tripStateId: manifest.tripStateId || manifest.tripStateID || undefined,
            routeId: routeId || undefined,
            companyId: companyId || manifest.companyID || undefined,
            locationId: locationId || manifest.locationID || undefined,
            parkLocationId: parkLocationId || manifest.parkLocationID || undefined,
            countryId: manifest.countryId || manifest.countryID || undefined,
            invoiceStateId: manifest.invoiceStateId || manifest.invoiceStateID || undefined,
            invoiceNumber: manifest.invoiceNumber || undefined,
            rmn: manifest.rmn || undefined,
            jobNumber: manifest.jobNumber || undefined,
            scheduledAt: manifest.scheduledAt ? new Date(manifest.scheduledAt) : undefined,
            dateTimeAdded: manifest.dateTimeAdded ? new Date(manifest.dateTimeAdded) : new Date(),
            dateTimeUpdated: manifest.dateTimeUpdated ? new Date(manifest.dateTimeUpdated) : undefined,
            dateTimeEnded: manifest.dateTimeEnded ? new Date(manifest.dateTimeEnded) : undefined,
          },
        });
        stats.manifests.migrated++;
        
        if (stats.manifests.migrated % 10 === 0) {
          console.log(`   Progress: ${stats.manifests.migrated}/${localManifests.length} manifests...`);
        }
      } catch (error: any) {
        console.error(`   Error migrating manifest ${manifest.trackingId || manifest.trackingID || manifest.id}:`, error.message);
        stats.manifests.errors++;
      }
    }
    console.log(`   ✅ Migrated: ${stats.manifests.migrated}, Skipped: ${stats.manifests.skipped}, Errors: ${stats.manifests.errors}\n`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    for (const [model, stat] of Object.entries(stats)) {
      console.log(`${model}: ${stat.migrated} migrated, ${stat.skipped} skipped, ${stat.errors} errors`);
      totalMigrated += stat.migrated;
      totalSkipped += stat.skipped;
      totalErrors += stat.errors;
    }
    
    console.log('='.repeat(60));
    console.log(`TOTAL: ${totalMigrated} migrated, ${totalSkipped} skipped, ${totalErrors} errors`);
    console.log('='.repeat(60));
    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await postgresClient.$disconnect();
  }
}

migrateAllData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

