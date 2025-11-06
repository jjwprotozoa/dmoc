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

  // Limit for testing (default 100, set SEED_TEST_LIMIT=null to process all)
  const VEHICLE_TEST_LIMIT =
    process.env.SEED_TEST_LIMIT === 'null' || process.env.SEED_TEST_LIMIT === ''
      ? null
      : process.env.SEED_TEST_LIMIT
        ? parseInt(process.env.SEED_TEST_LIMIT, 10)
        : 100;
  const vehiclesToProcess = VEHICLE_TEST_LIMIT
    ? vehiclesData.rows.slice(0, VEHICLE_TEST_LIMIT)
    : vehiclesData.rows;

  if (VEHICLE_TEST_LIMIT) {
    console.log(
      `   ⚠️  TEST MODE: Processing only first ${VEHICLE_TEST_LIMIT} vehicles (set SEED_TEST_LIMIT=null to process all)`
    );
  } else {
    console.log(`   📊 Processing all ${vehiclesData.rows.length} vehicles`);
  }

  // Pre-check existing vehicles by vehicleId for efficiency
  console.log('   🔍 Checking existing vehicles...');
  const existingVehicles = await prisma.vehicle.findMany({
    where: { tenantId },
    select: { vehicleId: true },
  });
  const existingVehicleIds = new Set(existingVehicles.map((v) => v.vehicleId));
  console.log(
    `   ✅ Found ${existingVehicleIds.size} existing vehicles in database`
  );

  const CHUNK_SIZE = 50; // Reduced chunk size for SQLite compatibility
  const totalVehicles = vehiclesToProcess.length;
  let vehicleCount = 0;
  let errorCount = 0;

  console.log(
    `   Processing ${totalVehicles} vehicles sequentially (SQLite optimized)...`
  );

  // Process vehicles sequentially to avoid SQLite lock contention
  for (let i = 0; i < vehiclesToProcess.length; i++) {
    const row = vehiclesToProcess[i];
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

    // Check if vehicle already exists
    const exists = existingVehicleIds.has(vehicleId);

    if (exists) {
      // Update existing vehicle
      try {
        await prisma.vehicle.updateMany({
          where: {
            tenantId,
            vehicleId,
          },
          data: vehicle,
        });
        vehicleCount++;
      } catch (updateError: any) {
        errorCount++;
        if (errorCount % 10 === 0) {
          console.warn(
            `⚠️  Failed to update vehicle ${vehicleId} (${errorCount} total errors):`,
            updateError.message
          );
        }
      }
    } else {
      // Create new vehicle
      try {
        await prisma.vehicle.create({
          data: vehicle,
        });
        vehicleCount++;
        // Add to existing set to avoid duplicate checks
        existingVehicleIds.add(vehicleId);
      } catch (error: any) {
        // If error is due to unique constraint (vehicleId), try update instead
        if (error?.code === 'P2002') {
          try {
            await prisma.vehicle.updateMany({
              where: {
                tenantId,
                vehicleId,
              },
              data: vehicle,
            });
            vehicleCount++;
            existingVehicleIds.add(vehicleId);
          } catch (updateError: any) {
            errorCount++;
            if (errorCount % 10 === 0) {
              console.warn(
                `⚠️  Failed to import/update vehicle ${vehicleId} (${errorCount} total errors):`,
                updateError.message
              );
            }
          }
        } else {
          errorCount++;
          // Only log every 10th error to avoid spam
          if (errorCount % 10 === 0) {
            console.warn(
              `⚠️  Failed to import vehicle ${vehicleId} (${errorCount} total errors):`,
              error.message
            );
          }
        }
      }
    }

    // Progress update every CHUNK_SIZE vehicles
    if ((i + 1) % CHUNK_SIZE === 0 || i === vehiclesToProcess.length - 1) {
      const progress = ((i + 1) / totalVehicles) * 100;
      console.log(
        `   Progress: ${i + 1}/${totalVehicles} vehicles processed (${progress.toFixed(1)}% complete)`
      );
    }
  }

  console.log(
    `✅ Processed ${vehicleCount} vehicles (created/updated), ${errorCount} errors`
  );
  if (VEHICLE_TEST_LIMIT) {
    console.log(
      `   ℹ️  Test mode: Only processed first ${VEHICLE_TEST_LIMIT} vehicles. Set SEED_TEST_LIMIT=null to process all ${vehiclesData.rows.length} vehicles.`
    );
  }

  // ========== 6. Import Manifests (from active_manifests.txt) ==========
  console.log('\n📊 Importing Manifests...');
  const manifestsContent = fs.readFileSync(
    path.join(process.cwd(), 'data', 'active_manifests.txt'),
    'utf-8'
  );
  const manifestsData = parseTSV(manifestsContent);

  // Filter out narrative lines (lines that don't start with a numeric ID)
  // The file has narrative text between manifest rows that we need to skip
  const validManifestRows = manifestsData.rows.filter((row) => {
    const firstCell = row[0]?.trim();
    // Check if first cell is a valid number (manifest ID)
    return firstCell && !isNaN(Number(firstCell)) && Number(firstCell) > 0;
  });

  console.log(
    `   📋 Found ${manifestsData.rows.length} total rows, ${validManifestRows.length} valid manifest rows (filtered out ${manifestsData.rows.length - validManifestRows.length} narrative/empty lines)`
  );

  let manifestCount = 0;
  let manifestSkippedCount = 0;

  // Get or create organization for tenant (needed for companies)
  let organization = await prisma.organization.findFirst({
    where: { tenantId },
  });
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        tenantId,
        name: `${tenant.name} Organization`,
      },
    });
  }

  // Pre-load lookup maps for performance
  const [companies, vehicles, countries, allClients] = await Promise.all([
    prisma.company.findMany({ where: { orgId: organization.id } }),
    prisma.vehicle.findMany({ where: { tenantId } }),
    prisma.country.findMany(),
    prisma.client.findMany({ where: { tenantId } }),
  ]);

  const companyMap = new Map(companies.map((c) => [c.name.toUpperCase(), c]));
  const vehicleMap = new Map(
    vehicles.map((v) => [v.registration?.toUpperCase() || '', v])
  );
  const countryNameMap = new Map(
    countries.map((c) => [c.name.toUpperCase(), c])
  );
  const clientMap = new Map(allClients.map((c) => [c.name.toUpperCase(), c]));

  console.log(
    `   Loaded ${companies.length} companies, ${vehicles.length} vehicles, ${countries.length} countries, ${allClients.length} clients for lookups`
  );

  // Map column indices (0-indexed from header row)
  // 0: ID, 1: Client, 2: Transporter, 3: Officer, 4: Driver, 5: Horse, 6: Tracker,
  // 7: WAConnected, 8: ANPRDetect, 9: Accuracy, 10: LocationMethod, 11: TrackerTime,
  // 12: Battery, 13: TrackerAddress, 14: Status, 15: Location, 16: Trailer1,
  // 17: Type1, 18: Seal1, 19: Weight1, 20: Trailer2, 21: Type2, 22: Seal2,
  // 23: Weight2, 24: Country, 25: ForeignHorseAndDriver, 26: Park, 27: Route,
  // 28: RMN, 29: JobNumber, 30: Comment, 31: Convoy, 32: Started, 33: Updated,
  // 34: Ended, 35: SinceLastUpdate, 36: TripDuration, 37: Controller

  // Limit for testing (default 100, set SEED_TEST_LIMIT=null to process all)
  const TEST_LIMIT =
    process.env.SEED_TEST_LIMIT === 'null' || process.env.SEED_TEST_LIMIT === ''
      ? null
      : process.env.SEED_TEST_LIMIT
        ? parseInt(process.env.SEED_TEST_LIMIT, 10)
        : 100;
  const rowsToProcess = TEST_LIMIT
    ? validManifestRows.slice(0, TEST_LIMIT)
    : validManifestRows;

  if (TEST_LIMIT) {
    console.log(
      `   ⚠️  TEST MODE: Processing only first ${TEST_LIMIT} manifests (set SEED_TEST_LIMIT=null to process all)`
    );
  } else {
    console.log(`   📊 Processing all ${manifestsData.rows.length} manifests`);
  }

  // Pre-check existing manifests by trackingId for efficiency
  console.log('   🔍 Checking existing manifests...');
  const existingManifests = await prisma.manifest.findMany({
    where: { tenantId },
    select: { trackingId: true },
  });
  const existingTrackingIds = new Set(
    existingManifests
      .map((m) => m.trackingId)
      .filter((id): id is string => id !== null)
  );
  console.log(
    `   ✅ Found ${existingTrackingIds.size} existing manifests in database`
  );

  for (const row of rowsToProcess) {
    const manifestId = parseIntSafe(row[0]); // ID
    if (!manifestId) {
      manifestSkippedCount++;
      continue;
    }

    // Parse dates (corrected indices)
    const started = parseDate(row[32]); // Started (was row[31] - Convoy)
    const updated = parseDate(row[33]); // Updated (was row[32] - Started)
    const ended = parseDate(row[34]); // Ended (was row[33] - Updated)

    // Map status
    let status: string = 'SCHEDULED';
    const statusStr = (row[14] || '').toUpperCase();
    if (statusStr.includes('ACTIVE')) status = 'IN_PROGRESS';
    else if (statusStr.includes('COMPLETED') || statusStr.includes('ENDED'))
      status = 'COMPLETED';
    else if (statusStr.includes('CANCELLED')) status = 'CANCELLED';

    // Find or create company by Client name (column 1)
    let companyId: string | null = null;
    const clientName = row[1]; // Client
    if (clientName && clientName.trim() !== '' && clientName.trim() !== 'TBA') {
      const clientNameUpper = clientName.trim().toUpperCase();
      let company = companyMap.get(clientNameUpper);

      if (!company) {
        // Try to find by partial match
        company = companies.find(
          (c) =>
            c.name.toUpperCase().includes(clientNameUpper) ||
            clientNameUpper.includes(c.name.toUpperCase())
        );
      }

      if (!company) {
        // Create company if not found
        try {
          company = await prisma.company.create({
            data: {
              orgId: organization.id,
              name: clientName.trim(),
            },
          });
          companyMap.set(clientNameUpper, company);
          companies.push(company);
        } catch (error) {
          console.warn(`⚠️  Failed to create company "${clientName}":`, error);
        }
      }

      if (company) companyId = company.id;
    }

    // Find vehicle (horse) by registration (column 5: Horse, format: "T944DLJ(TZ)")
    let horseId: string | null = null;
    const horseStr = row[5]; // Horse
    if (horseStr && horseStr.trim() !== '' && horseStr.trim() !== 'TBA') {
      // Extract registration (e.g., "T944DLJ" from "T944DLJ(TZ)")
      const registrationMatch = horseStr.match(/^([A-Z0-9]+)/);
      if (registrationMatch) {
        const registration = registrationMatch[1].toUpperCase();
        const vehicle = vehicleMap.get(registration);
        if (vehicle) {
          horseId = vehicle.id;
        } else {
          // Try to find by partial match
          const foundVehicle = vehicles.find(
            (v) => v.registration?.toUpperCase() === registration
          );
          if (foundVehicle) {
            horseId = foundVehicle.id;
            vehicleMap.set(registration, foundVehicle);
          }
        }
      }
    }

    // Find country by name (column 24: Country - was incorrectly row[23] which is Weight2)
    let countryId: number | null = null;
    const countryName = row[24]; // Country (corrected from row[23])
    if (
      countryName &&
      countryName.trim() !== '' &&
      countryName.trim() !== 'TBA'
    ) {
      const countryNameUpper = countryName.trim().toUpperCase();
      const country = countryNameMap.get(countryNameUpper);
      if (country) {
        countryId = country.id;
      } else {
        // Try to find by partial match
        const foundCountry = countries.find(
          (c) =>
            c.name.toUpperCase().includes(countryNameUpper) ||
            countryNameUpper.includes(c.name.toUpperCase())
        );
        if (foundCountry) {
          countryId = foundCountry.id;
          countryNameMap.set(countryNameUpper, foundCountry);
        }
      }
    }

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

    // Find park location by name (column 26: Park)
    let parkLocationId: string | null = null;
    const parkName = row[26]; // Park
    if (parkName && parkName.trim() !== '' && parkName.trim() !== 'TBA') {
      try {
        const parkLocation = await prisma.location.findFirst({
          where: {
            tenantId,
            name: { contains: parkName.trim() },
          },
        });
        if (parkLocation) parkLocationId = parkLocation.id;
      } catch (error) {
        // Park location not found, that's okay
      }
    }

    // Find trailer1 by registration (column 16: Trailer1, format: "T873BEP")
    let trailerId1: string | null = null;
    const trailer1Str = row[16]; // Trailer1
    if (
      trailer1Str &&
      trailer1Str.trim() !== '' &&
      trailer1Str.trim() !== 'TBA'
    ) {
      const registrationMatch = trailer1Str.match(/^([A-Z0-9]+)/);
      if (registrationMatch) {
        const registration = registrationMatch[1].toUpperCase();
        const vehicle = vehicleMap.get(registration);
        if (vehicle) {
          trailerId1 = vehicle.id;
        } else {
          const foundVehicle = vehicles.find(
            (v) => v.registration?.toUpperCase() === registration
          );
          if (foundVehicle) {
            trailerId1 = foundVehicle.id;
            vehicleMap.set(registration, foundVehicle);
          }
        }
      }
    }

    // Find trailer2 by registration (column 20: Trailer2, format: "T397DVA")
    let trailerId2: string | null = null;
    const trailer2Str = row[20]; // Trailer2
    if (
      trailer2Str &&
      trailer2Str.trim() !== '' &&
      trailer2Str.trim() !== 'TBA'
    ) {
      const registrationMatch = trailer2Str.match(/^([A-Z0-9]+)/);
      if (registrationMatch) {
        const registration = registrationMatch[1].toUpperCase();
        const vehicle = vehicleMap.get(registration);
        if (vehicle) {
          trailerId2 = vehicle.id;
        } else {
          const foundVehicle = vehicles.find(
            (v) => v.registration?.toUpperCase() === registration
          );
          if (foundVehicle) {
            trailerId2 = foundVehicle.id;
            vehicleMap.set(registration, foundVehicle);
          }
        }
      }
    }

    // Find transporter (column 2) - map to Client if it exists, or store as string
    // For now, we'll try to find it as a Client, otherwise skip (transporterId field exists but may need Client lookup)
    let transporterId: string | null = null;
    const transporterName = row[2]; // Transporter
    if (
      transporterName &&
      transporterName.trim() !== '' &&
      transporterName.trim() !== 'TBA'
    ) {
      // Try to find transporter as a Client (some transporters might be clients)
      const transporterNameUpper = transporterName.trim().toUpperCase();
      // Try to find transporter as a Client (use pre-loaded client map)
      let transporterClient = clientMap.get(transporterNameUpper);
      if (!transporterClient) {
        // Try partial match
        transporterClient = allClients.find(
          (c) =>
            c.name.toUpperCase().includes(transporterNameUpper) ||
            transporterNameUpper.includes(c.name.toUpperCase())
        );
        if (transporterClient) {
          clientMap.set(transporterNameUpper, transporterClient);
        }
      }
      if (transporterClient) {
        transporterId = transporterClient.id;
      }
      // Note: If transporterId field in Manifest is for Client ID, this works
      // Otherwise, we might need a separate Transporter model
    }

    const trackingId = row[28] || undefined; // RMN
    const manifest = {
      tenantId,
      title: `${row[1] || 'Manifest'} - ${trackingId || manifestId}`, // Client - RMN
      status,
      trackingId,
      rmn: trackingId,
      jobNumber: row[29] || undefined,
      companyId: companyId || undefined,
      transporterId: transporterId || undefined,
      horseId: horseId || undefined,
      trailerId1: trailerId1 || undefined,
      trailerId2: trailerId2 || undefined,
      countryId: countryId || undefined,
      routeId: routeId || undefined,
      locationId: locationId || undefined,
      parkLocationId: parkLocationId || undefined,
      scheduledAt: started || undefined,
      dateTimeAdded: started || new Date(),
      dateTimeUpdated: updated || undefined,
      dateTimeEnded: ended || undefined,
    };

    // Check if manifest already exists (by trackingId if available, or by title)
    const exists = trackingId ? existingTrackingIds.has(trackingId) : false;

    if (exists) {
      // Update existing manifest
      try {
        if (trackingId) {
          await prisma.manifest.updateMany({
            where: {
              tenantId,
              trackingId,
            },
            data: manifest,
          });
          manifestCount++;
        }
      } catch (updateError) {
        console.warn(
          `⚠️  Failed to update manifest ${manifestId} (${trackingId}):`,
          updateError
        );
      }
    } else {
      // Create new manifest
      try {
        await prisma.manifest.create({
          data: manifest,
        });
        manifestCount++;
        // Add to existing set to avoid duplicate checks
        if (trackingId) {
          existingTrackingIds.add(trackingId);
        }
      } catch (error: any) {
        // If error is due to unique constraint (trackingId), try update instead
        if (error?.code === 'P2002' && trackingId) {
          try {
            await prisma.manifest.updateMany({
              where: {
                tenantId,
                trackingId,
              },
              data: manifest,
            });
            manifestCount++;
            existingTrackingIds.add(trackingId);
          } catch (updateError) {
            console.warn(
              `⚠️  Failed to import/update manifest ${manifestId} (${trackingId}):`,
              updateError
            );
          }
        } else {
          console.warn(`⚠️  Failed to import manifest ${manifestId}:`, error);
        }
      }
    }
  }
  console.log(
    `✅ Processed ${manifestCount} manifests (created/updated), skipped ${manifestSkippedCount} empty rows`
  );
  if (TEST_LIMIT) {
    console.log(
      `   ℹ️  Test mode: Only processed first ${TEST_LIMIT} valid manifests. Set SEED_TEST_LIMIT=null to process all ${validManifestRows.length} valid manifests.`
    );
  }

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
