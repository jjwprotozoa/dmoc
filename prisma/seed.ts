// prisma/seed.ts
// Comprehensive data import from .txt files for all models
import { PrismaClient } from '@prisma/client';
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

// Helper to parse date strings (format: "M/D/YYYY H:MM AM/PM")
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
  console.log('🌱 Starting comprehensive database seed from .txt files...');

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

  console.log('✅ Created/verified tenant:', tenant.name);
  const tenantId = tenant.id;

  // ========== 1. Import Countries ==========
  console.log('\n📊 Importing Countries...');
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
    // Column order: CountryID, Name, Abbreviation, DateTimeAdded, ID, DisplayValue
    const countryId = parseIntSafe(row[0]); // CountryID
    if (!countryId) continue;

    const country = {
      id: countryId,
      name: row[1] || '', // Name
      abbreviation: row[2] || '', // Abbreviation
      displayValue: row[5] || row[1] || '', // DisplayValue (fallback to Name)
      dateTimeAdded: parseDate(row[3]), // DateTimeAdded
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

  // ========== 2. Import Locations ==========
  console.log('\n📊 Importing Locations...');
  const locationsContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'locations.txt'),
    'utf-8'
  );
  const locationsData = parseTSV(locationsContent);
  let locationCount = 0;
  let skippedCount = 0;

  for (const row of locationsData.rows) {
    // Column order: LocationID, CoutryID, CountryName, Description, DateTimeAdded, ID, DisplayValue
    const locationId = parseIntSafe(row[0]); // LocationID
    if (!locationId) continue;

    const locationName = row[3] || row[6] || ''; // Description or DisplayValue
    if (!locationName) continue;

    const location = {
      tenantId,
      locationId,
      countryId: parseIntSafe(row[1]) || undefined, // CoutryID (typo in data)
      name: locationName,
      description: row[3] || undefined, // Description
      createdAt: parseDate(row[4]) || undefined, // DateTimeAdded
      updatedAt: parseDate(row[4]) || undefined,
    };

    try {
      // First try to find by locationId (unique field)
      const existing = await prisma.location.findUnique({
        where: { locationId },
      });

      if (existing) {
        // Update existing location
        await prisma.location.update({
          where: { id: existing.id },
          data: location,
        });
        locationCount++;
      } else {
        // Try to find by tenantId + name (unique constraint)
        const existingByName = await prisma.location.findFirst({
          where: {
            tenantId,
            name: locationName,
          },
        });

        if (existingByName) {
          // Update existing location with same name
          await prisma.location.update({
            where: { id: existingByName.id },
            data: {
              ...location,
              locationId, // Update locationId if it's different
            },
          });
          locationCount++;
        } else {
          // Create new location
          await prisma.location.create({
            data: location,
          });
          locationCount++;
        }
      }
    } catch (error: any) {
      // Skip duplicates silently or log if it's a different error
      if (error?.code === 'P2002') {
        skippedCount++;
        if (skippedCount % 10 === 0) {
          console.log(`   Skipped ${skippedCount} duplicate locations...`);
        }
      } else {
        console.warn(
          `⚠️  Failed to import location ${locationId}:`,
          error.message
        );
      }
    }
  }
  console.log(
    `✅ Imported ${locationCount} locations (skipped ${skippedCount} duplicates)`
  );

  // ========== 3. Import Contacts ==========
  console.log('\n📊 Importing Contacts...');
  const contactsContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'contacts.txt'),
    'utf-8'
  );
  const contactsData = parseTSV(contactsContent);
  let contactCount = 0;

  for (const row of contactsData.rows) {
    // Column order: Name, ContactNr, IDNumber, PictureLoaded, CountryOfOrigin, DateTimeAdded, ID, DisplayValue
    const contactId = parseIntSafe(row[6]); // ID column
    if (!contactId) continue;

    const contact = {
      tenantId,
      contactId,
      name: row[0] || '', // Name
      contactNr: row[1] || '', // ContactNr
      idNumber: row[2] || '', // IDNumber
      pictureLoaded: parseBoolean(row[3]), // PictureLoaded
      countryOfOrigin: row[4] || 'UNKNOWN', // CountryOfOrigin
      displayValue: row[7] || row[0] || '', // DisplayValue (fallback to Name)
      createdAt: parseDate(row[5]) || undefined, // DateTimeAdded
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

  // ========== 4. Import Logistics Officers ==========
  console.log('\n📊 Importing Logistics Officers...');
  const officersContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'Logistics_Officers.txt'),
    'utf-8'
  );
  const officersData = parseTSV(officersContent);
  let officerCount = 0;

  for (const row of officersData.rows) {
    // Column order: Name, ContactNr, IDNumber, PictureLoaded, CountryOfOrigin, DateTimeAdded, ID, DisplayValue
    const officerId = parseIntSafe(row[6]); // ID column
    if (!officerId) continue;

    const officer = {
      tenantId,
      logisticsOfficerId: officerId,
      name: row[0] || '', // Name
      contactNr: row[1] || undefined, // ContactNr
      idNumber: row[2] || undefined, // IDNumber
      pictureLoaded: parseBoolean(row[3]), // PictureLoaded
      countryOfOrigin: row[4] || undefined, // CountryOfOrigin
      displayValue: row[7] || row[0] || undefined, // DisplayValue (fallback to Name)
      isActive: true,
      createdAt: parseDate(row[5]) || undefined, // DateTimeAdded
      updatedAt: parseDate(row[5]) || undefined,
    };

    if (!officer.name) continue;

    try {
      await prisma.logisticsOfficer.upsert({
        where: { logisticsOfficerId: officerId },
        update: officer,
        create: officer,
      });
      officerCount++;
    } catch (error) {
      console.warn(
        `⚠️  Failed to import logistics officer ${officerId}:`,
        error
      );
    }
  }
  console.log(`✅ Imported ${officerCount} logistics officers`);

  // ========== 5. Import Vehicles ==========
  console.log('\n📊 Importing Vehicles...');
  const vehiclesContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'vehicles.txt'),
    'utf-8'
  );
  const vehiclesData = parseTSV(vehiclesContent);
  const CHUNK_SIZE = 50; // Reduced chunk size for SQLite compatibility
  const totalVehicles = vehiclesData.rows.length;
  let vehicleCount = 0;
  let errorCount = 0;

  console.log(
    `   Processing ${totalVehicles} vehicles sequentially (SQLite optimized)...`
  );

  // Process vehicles sequentially to avoid SQLite lock contention
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
      // Only log every 10th error to avoid spam
      if (errorCount % 10 === 0) {
        console.warn(
          `⚠️  Failed to import vehicle ${vehicleId} (${errorCount} total errors):`,
          error.message
        );
      }
    }

    // Progress update every CHUNK_SIZE vehicles
    if ((i + 1) % CHUNK_SIZE === 0 || i === vehiclesData.rows.length - 1) {
      const progress = ((i + 1) / totalVehicles) * 100;
      console.log(
        `   Progress: ${i + 1}/${totalVehicles} vehicles processed (${progress.toFixed(1)}% complete)`
      );
    }
  }

  console.log(`✅ Imported ${vehicleCount} vehicles (${errorCount} errors)`);

  // ========== 6. Import Manifests (from active_manifests.txt) ==========
  console.log('\n📊 Importing Manifests...');
  const manifestsContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'active_manifests.txt'),
    'utf-8'
  );
  const manifestsData = parseTSV(manifestsContent);
  let manifestCount = 0;
  let manifestSkippedCount = 0;

  // Map column indices (0-indexed from header row)
  // ID, Client, Transporter, Officer, Driver, Horse, Tracker, WAConnected, ANPRDetect,
  // Accuracy, LocationMethod, TrackerTime, Battery, TrackerAddress, Status, Location,
  // Trailer1, Type1, Seal1, Weight1, Trailer2, Type2, Seal2, Weight2, Country,
  // ForeignHorseAndDriver, Park, Route, RMN, JobNumber, Comment, Convoy, Started, Updated, Ended

  for (const row of manifestsData.rows) {
    const manifestId = parseIntSafe(row[0]); // ID
    if (!manifestId) {
      manifestSkippedCount++;
      continue;
    }

    // Parse dates
    const started = parseDate(row[31]); // Started
    const updated = parseDate(row[32]); // Updated
    const ended = parseDate(row[33]); // Ended

    // Map status
    let status: string = 'SCHEDULED';
    const statusStr = (row[14] || '').toUpperCase();
    if (statusStr.includes('ACTIVE')) status = 'IN_PROGRESS';
    else if (statusStr.includes('COMPLETED') || statusStr.includes('ENDED'))
      status = 'COMPLETED';
    else if (statusStr.includes('CANCELLED')) status = 'CANCELLED';

    // Find or create route if needed
    let routeId: string | null = null;
    const routeName = row[27]; // Route
    if (routeName && routeName.trim() !== '' && routeName.trim() !== 'TBA') {
      try {
        const route = await prisma.route.upsert({
          where: {
            tenantId_name: {
              tenantId,
              name: routeName.trim(),
            },
          },
          update: {},
          create: {
            tenantId,
            name: routeName.trim(),
            description: null,
          },
        });
        routeId = route.id;
      } catch (error) {
        console.warn(`⚠️  Failed to create route "${routeName}":`, error);
      }
    }

    // Find location by name
    let locationId: string | null = null;
    const locationName = row[15]; // Location
    if (
      locationName &&
      locationName.trim() !== '' &&
      locationName.trim() !== 'TBA'
    ) {
      try {
        const location = await prisma.location.findFirst({
          where: {
            tenantId,
            name: { contains: locationName.trim() },
          },
        });
        if (location) locationId = location.id;
      } catch (error) {
        // Location not found, that's okay
      }
    }

    const manifest = {
      tenantId,
      title: `${row[1] || 'Manifest'} - ${row[28] || manifestId}`, // Client - RMN
      status,
      trackingId: row[28] || undefined, // RMN
      rmn: row[28] || undefined,
      jobNumber: row[29] || undefined,
      routeId: routeId || undefined,
      locationId: locationId || undefined,
      scheduledAt: started || undefined,
      dateTimeAdded: started || new Date(),
      dateTimeUpdated: updated || undefined,
      dateTimeEnded: ended || undefined,
    };

    try {
      await prisma.manifest.create({
        data: manifest,
      });
      manifestCount++;
    } catch (error) {
      // If manifest exists (by trackingId), update it
      if (manifest.trackingId) {
        try {
          await prisma.manifest.updateMany({
            where: {
              tenantId,
              trackingId: manifest.trackingId,
            },
            data: manifest,
          });
          manifestCount++;
        } catch (updateError) {
          console.warn(
            `⚠️  Failed to import/update manifest ${manifestId}:`,
            error
          );
        }
      } else {
        console.warn(`⚠️  Failed to import manifest ${manifestId}:`, error);
      }
    }
  }
  console.log(
    `✅ Imported ${manifestCount} manifests (skipped ${manifestSkippedCount} empty rows)`
  );

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
