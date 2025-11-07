// prisma/seed-production.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper to parse tab-separated values
function parseTSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content
    .trim()
    .split('\n')
    .filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0]
    .split('\t')
    .map((h) => h.trim())
    .filter((h) => h !== '');
  const rows = lines.slice(1).map((line) => {
    const cells = line.split('\t').map((cell) => cell.trim());
    // Remove leading empty cell if present (files start with tab)
    return cells[0] === '' ? cells.slice(1) : cells;
  });

  return { headers, rows };
}

// Helper to parse date strings
function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === '-1') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// Helper to parse boolean from string
function parseBoolean(val: string | undefined | null): boolean {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

// Helper to parse integer
function parseIntSafe(val: string | undefined | null): number | null {
  if (!val || val.trim() === '' || val === '-1') return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
}

async function main() {
  console.log('🌱 Starting production database seed...');

  // Create a default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'digiwize' },
    update: {},
    create: {
      name: 'Digiwize',
      slug: 'digiwize',
      settings: JSON.stringify({
        theme: 'amber',
        features: {
          fuelTracking: true,
          vehicleLogbook: true,
          biometrics: true,
          anpr: true,
        },
      }),
    },
  });

  console.log('✅ Created tenant:', tenant.name);
  const tenantId = tenant.id;

  // Create a default admin user with proper password hashing
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@digiwize.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@digiwize.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      tenantSlug: 'digiwize',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create a test driver user for quick sign-in
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@test.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'driver@test.com',
      name: 'Test Driver',
      passwordHash: driverPassword,
      role: 'DRIVER',
      tenantSlug: 'digiwize',
      isActive: true,
    },
  });

  console.log('✅ Created driver user:', driverUser.email);

  // Create an organization for the tenant
  const organization = await prisma.organization.upsert({
    where: { id: tenant.id },
    update: {},
    create: {
      id: tenant.id,
      tenantId: tenant.id,
      name: 'Digiwize Organization',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create some sample companies (Company model uses orgId, not tenantId)
  const companies = [
    {
      name: 'DELTA',
    },
    {
      name: 'RELOAD',
    },
    {
      name: 'TEST CLIENT',
    },
  ];

  for (const companyData of companies) {
    await prisma.company.upsert({
      where: { 
        id: `${organization.id}-${companyData.name}`,
      },
      update: {},
      create: {
        id: `${organization.id}-${companyData.name}`,
        orgId: organization.id,
        name: companyData.name,
      },
    });
  }

  console.log('✅ Created', companies.length, 'companies');

  // Create some sample routes
  const routes = [
    {
      name: 'Johannesburg to Cape Town',
      description: 'Main route from Johannesburg to Cape Town',
      startPoint: 'Johannesburg',
      endPoint: 'Cape Town',
      distance: 1400,
    },
    {
      name: 'Durban to Port Elizabeth',
      description: 'Coastal route from Durban to Port Elizabeth',
      startPoint: 'Durban',
      endPoint: 'Port Elizabeth',
      distance: 800,
    },
  ];

  for (const routeData of routes) {
    await prisma.route.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: routeData.name,
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        ...routeData,
      },
    });
  }

  console.log('✅ Created', routes.length, 'routes');

  // Create some sample locations
  const locations = [
    {
      name: 'Johannesburg Depot',
      description: 'Main depot in Johannesburg',
      latitude: -26.2041,
      longitude: 28.0473,
      address: 'Johannesburg, South Africa',
    },
    {
      name: 'Cape Town Terminal',
      description: 'Terminal in Cape Town',
      latitude: -33.9249,
      longitude: 18.4241,
      address: 'Cape Town, South Africa',
    },
  ];

  for (const locationData of locations) {
    await prisma.location.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: locationData.name,
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        ...locationData,
      },
    });
  }

  console.log('✅ Created', locations.length, 'sample locations');

  // ========== Import Countries from data file ==========
  console.log('\n📊 Importing Countries from data file...');
  try {
    const countriesContent = fs.readFileSync(
      path.join(process.cwd(), 'data', 'countries.txt'),
      'utf-8'
    );
    const countriesData = parseTSV(countriesContent);
    const countryMap = new Map<
      number,
      { id: number; name: string; abbreviation: string; displayValue: string }
    >();

    for (const row of countriesData.rows) {
      const countryId = parseIntSafe(row[0]); // CountryID
      if (!countryId) continue;

      const country = {
        id: countryId,
        name: row[1] || '',
        abbreviation: row[2] || '',
        displayValue: row[5] || row[1] || '',
        flag: undefined,
        dateTimeAdded: parseDate(row[3]),
      };

      try {
        await prisma.country.upsert({
          where: { id: country.id },
          update: country,
          create: country,
        });
        countryMap.set(country.id, country);
      } catch (error) {
        console.warn(`⚠️  Failed to import country ${country.id}:`, error);
      }
    }
    console.log(`✅ Imported ${countryMap.size} countries`);
  } catch (error) {
    console.warn('⚠️  Could not import countries:', error);
  }

  // ========== Import Locations from data file ==========
  console.log('\n📊 Importing Locations from data file...');
  try {
    const locationsContent = fs.readFileSync(
      path.join(process.cwd(), 'data', 'locations.txt'),
      'utf-8'
    );
    const locationsData = parseTSV(locationsContent);
    let locationCount = 0;
    let skippedCount = 0;

    for (const row of locationsData.rows) {
      const locationId = parseIntSafe(row[0]); // LocationID
      if (!locationId) continue;

      const locationName = row[3] || row[6] || '';
      if (!locationName) continue;

      const location = {
        tenantId,
        locationId,
        countryId: parseIntSafe(row[1]) || undefined,
        name: locationName,
        description: row[3] || undefined,
        createdAt: parseDate(row[4]) || undefined,
        updatedAt: parseDate(row[4]) || undefined,
      };

      try {
        const existing = await prisma.location.findUnique({
          where: { locationId },
        });

        if (existing) {
          await prisma.location.update({
            where: { id: existing.id },
            data: location,
          });
          locationCount++;
        } else {
          const existingByName = await prisma.location.findFirst({
            where: {
              tenantId,
              name: locationName,
            },
          });

          if (existingByName) {
            await prisma.location.update({
              where: { id: existingByName.id },
              data: { ...location, locationId },
            });
            locationCount++;
          } else {
            await prisma.location.create({ data: location });
            locationCount++;
          }
        }
      } catch (error: any) {
        if (error?.code === 'P2002') {
          skippedCount++;
        } else {
          console.warn(`⚠️  Failed to import location ${locationId}:`, error.message);
        }
      }
    }
    console.log(`✅ Imported ${locationCount} locations (skipped ${skippedCount} duplicates)`);
  } catch (error) {
    console.warn('⚠️  Could not import locations:', error);
  }

  // ========== Import Contacts from data file ==========
  console.log('\n📊 Importing Contacts from data file...');
  try {
    const contactsContent = fs.readFileSync(
      path.join(process.cwd(), 'data', 'contacts.txt'),
      'utf-8'
    );
    const contactsData = parseTSV(contactsContent);
    let contactCount = 0;

    for (const row of contactsData.rows) {
      const contactId = parseIntSafe(row[6]); // ID column
      if (!contactId) continue;

      const contact = {
        tenantId,
        contactId,
        name: row[0] || '',
        contactNr: row[1] || '',
        idNumber: row[2] || '',
        pictureLoaded: parseBoolean(row[3]),
        countryOfOrigin: row[4] || 'UNKNOWN',
        displayValue: row[7] || row[0] || '',
        createdAt: parseDate(row[5]) || undefined,
        updatedAt: parseDate(row[5]) || undefined,
      };

      if (!contact.name) continue;

      try {
        await prisma.contact.upsert({
          where: { contactId },
          update: contact,
          create: contact,
        });
        contactCount++;
      } catch (error) {
        console.warn(`⚠️  Failed to import contact ${contactId}:`, error);
      }
    }
    console.log(`✅ Imported ${contactCount} contacts`);
  } catch (error) {
    console.warn('⚠️  Could not import contacts:', error);
  }

  // ========== Import Logistics Officers from data file ==========
  console.log('\n📊 Importing Logistics Officers from data file...');
  try {
    const officersFilePath = path.join(process.cwd(), 'data', 'Logistics_Officers.txt');
    
    // Check if file exists
    if (!fs.existsSync(officersFilePath)) {
      console.warn('⚠️  Logistics_Officers.txt not found, skipping import');
    } else {
      const officersContent = fs.readFileSync(officersFilePath, 'utf-8');
      const officersData = parseTSV(officersContent);
      const totalOfficers = officersData.rows.length;
      let officerCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      console.log(`   Processing ${totalOfficers} logistics officers...`);

      for (let i = 0; i < officersData.rows.length; i++) {
        const row = officersData.rows[i];
        const officerId = parseIntSafe(row[6]); // ID column
        
        if (!officerId) {
          skippedCount++;
          continue;
        }

        const officer = {
          tenantId,
          logisticsOfficerId: officerId,
          name: row[0] || '',
          contactNr: row[1] || undefined,
          idNumber: row[2] || undefined,
          pictureLoaded: parseBoolean(row[3]),
          countryOfOrigin: row[4] || undefined,
          displayValue: row[7] || row[0] || undefined,
          isActive: true,
          createdAt: parseDate(row[5]) || undefined,
          updatedAt: parseDate(row[5]) || undefined,
        };

        if (!officer.name) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.logisticsOfficer.upsert({
            where: { logisticsOfficerId: officerId },
            update: officer,
            create: officer,
          });
          officerCount++;
        } catch (error: any) {
          errorCount++;
          if (errorCount % 10 === 0) {
            console.warn(`⚠️  Failed to import logistics officer ${officerId} (${errorCount} total errors):`, error?.message || error);
          }
        }

        // Show progress every 50 records or at the end
        if ((i + 1) % 50 === 0 || i === officersData.rows.length - 1) {
          const progress = ((i + 1) / totalOfficers) * 100;
          console.log(`   Progress: ${i + 1}/${totalOfficers} officers (${progress.toFixed(1)}%) - ${officerCount} imported, ${errorCount} errors, ${skippedCount} skipped`);
        }
      }
      console.log(`✅ Imported ${officerCount} logistics officers (${errorCount} errors, ${skippedCount} skipped)`);
    }
  } catch (error) {
    console.warn('⚠️  Could not import logistics officers:', error);
    console.warn('   Continuing with rest of seed...');
  }

  // ========== Import Vehicles from data file ==========
  console.log('\n📊 Importing Vehicles from data file...');
  try {
    const vehiclesContent = fs.readFileSync(
      path.join(process.cwd(), 'data', 'vehicles.txt'),
      'utf-8'
    );
    const vehiclesData = parseTSV(vehiclesContent);
    const totalVehicles = vehiclesData.rows.length;
    let vehicleCount = 0;
    let errorCount = 0;

    console.log(`   Processing ${totalVehicles} vehicles...`);

    for (let i = 0; i < vehiclesData.rows.length; i++) {
      const row = vehiclesData.rows[i];
      const vehicleId = parseIntSafe(row[0]); // VehicleID

      if (!vehicleId) {
        errorCount++;
        continue;
      }

      const vehicle = {
        tenantId,
        vehicleId,
        vehicleTypeId: parseIntSafe(row[1]) || undefined,
        entityTypeDescription: row[2] || 'UNKNOWN',
        registration: row[4] || '',
        color: row[5] || undefined,
        countryOfOrigin: row[6] || 'UNKNOWN',
        displayValue: row[10] || row[4] || '',
        status: 'Active' as const,
        createdAt: parseDate(row[7]) || undefined,
        updatedAt: parseDate(row[7]) || undefined,
      };

      if (!vehicle.registration) {
        errorCount++;
        continue;
      }

      try {
        await prisma.vehicle.upsert({
          where: { vehicleId },
          update: vehicle,
          create: vehicle,
        });
        vehicleCount++;
      } catch (error: any) {
        errorCount++;
        if (errorCount % 10 === 0) {
          console.warn(`⚠️  Failed to import vehicle ${vehicleId} (${errorCount} total errors):`, error.message);
        }
      }

      if ((i + 1) % 50 === 0 || i === vehiclesData.rows.length - 1) {
        const progress = ((i + 1) / totalVehicles) * 100;
        console.log(`   Progress: ${i + 1}/${totalVehicles} vehicles (${progress.toFixed(1)}%)`);
      }
    }

    console.log(`✅ Imported ${vehicleCount} vehicles (${errorCount} errors)`);
  } catch (error) {
    console.warn('⚠️  Could not import vehicles:', error);
  }

  // Create some sample invoice states (InvoiceState uses code as unique, not tenantId_code)
  const invoiceStates = [
    {
      name: 'Pending',
      code: 'PENDING',
    },
    {
      name: 'Paid',
      code: 'PAID',
    },
    {
      name: 'Overdue',
      code: 'OVERDUE',
    },
  ];

  for (const stateData of invoiceStates) {
    await prisma.invoiceState.upsert({
      where: { 
        code: stateData.code,
      },
      update: {},
      create: {
        ...stateData,
      },
    });
  }

  console.log('✅ Created', invoiceStates.length, 'invoice states');

  console.log('🎉 Production database seeding completed successfully!');
  console.log('📧 Admin login: admin@digiwize.com');
  console.log('🔑 Admin password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during production seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });