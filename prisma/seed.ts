// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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

  // Create clients from mock data
  const clients = [
    {
      companyId: 3103,
      name: 'ACCESS',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'ACCESS',
    },
    {
      companyId: 3881,
      name: 'AFRICA WAKAWAKA',
      address: 'TANZANIA',
      entityTypeDescription: 'CLIENT',
      displayValue: 'AFRICA WAKAWAKA',
    },
    {
      companyId: 3300,
      name: 'AFRICLAN',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'AFRICLAN',
    },
    {
      companyId: 4087,
      name: 'CML / NYATI MUFULIRA TO DURBAN',
      address: 'CML / Nyati Mufulira to Durban',
      entityTypeDescription: 'CLIENT',
      displayValue: 'CML / NYATI MUFULIRA TO [',
    },
    {
      companyId: 3725,
      name: 'DELTA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'DELTA',
    },
    {
      companyId: 3726,
      name: 'DELTA FORCE / ZERODEGREES',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'DELTA FORCE / ZERODEGREES',
    },
    {
      companyId: 3727,
      name: 'DELTA PUMA RISK',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'DELTA PUMA RISK',
    },
    {
      companyId: 3728,
      name: 'DELTA ESCORTS/CML KANSANSHI-DAR',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'DELTA ESCORTS/CML KANSANSHI-DAR',
    },
    {
      companyId: 3729,
      name: 'DELTA/POLYTRA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'DELTA/POLYTRA',
    },
    {
      companyId: 3730,
      name: 'GREENDOOR',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'GREENDOOR',
    },
    {
      companyId: 3731,
      name: 'INARA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'INARA',
    },
    {
      companyId: 3732,
      name: 'INARA (LIBERTY)',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'INARA (LIBERTY)',
    },
    {
      companyId: 3733,
      name: 'INARA MOXICO',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'INARA MOXICO',
    },
    {
      companyId: 3734,
      name: 'KOBRACLIENT2',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'KOBRACLIENT2',
    },
    {
      companyId: 3735,
      name: 'LINK AFRICA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'LINK AFRICA',
    },
    {
      companyId: 3736,
      name: 'MYSTICAL',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'MYSTICAL',
    },
    {
      companyId: 3737,
      name: 'RELOAD ADD',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD ADD',
    },
    {
      companyId: 3738,
      name: 'RELOAD CITIC',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD CITIC',
    },
    {
      companyId: 3739,
      name: 'RELOAD CNMC/IXMTRACKING',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD CNMC/IXMTRACKING',
    },
    {
      companyId: 3740,
      name: 'RELOAD DELTA ASK',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD DELTA ASK',
    },
    {
      companyId: 3741,
      name: 'RELOAD KABWE/GRB',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD KABWE/GRB',
    },
    {
      companyId: 3742,
      name: 'RELOAD LCS',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD LCS',
    },
    {
      companyId: 3743,
      name: 'RELOAD TFC ASK',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD TFC ASK',
    },
    {
      companyId: 3744,
      name: 'RELOAD TFC HMC',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD TFC HMC',
    },
    {
      companyId: 3745,
      name: 'RELOAD TFC OCTAGON/RLD-CMS/KCM',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD TFC OCTAGON/RLD-CMS/KCM',
    },
    {
      companyId: 3746,
      name: 'RELOAD TFC RGT',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD TFC RGT',
    },
    {
      companyId: 3747,
      name: 'RELOAD TRAFIGURA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD TRAFIGURA',
    },
    {
      companyId: 3748,
      name: 'RELOAD/DELTA LONSHI TRACKING',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD/DELTA LONSHI TRACKING',
    },
    {
      companyId: 3749,
      name: 'RELOAD/DELTA/TFC/MRI (ZAM_MZ)',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD/DELTA/TFC/MRI (ZAM_MZ)',
    },
    {
      companyId: 3750,
      name: 'RELOAD/MALMOZA/DELTA - TFC',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD/MALMOZA/DELTA - TFC',
    },
    {
      companyId: 3751,
      name: 'RELOAD/ZOPCO/DELTA BLISTERS',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD/ZOPCO/DELTA BLISTERS',
    },
    {
      companyId: 3752,
      name: 'RELOAD/ZOPCO/DELTA CATHODES',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RELOAD/ZOPCO/DELTA CATHODES',
    },
    {
      companyId: 3753,
      name: 'RL/DELTA/ZAM - TN/BBR/GRB',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RL/DELTA/ZAM - TN/BBR/GRB',
    },
    {
      companyId: 3754,
      name: 'RL/DELTA/TFC NDOLA TO DAR',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'RL/DELTA/TFC NDOLA TO DAR',
    },
    {
      companyId: 3755,
      name: 'TEST CLIENT',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'TEST CLIENT',
    },
    {
      companyId: 3756,
      name: 'TEST CLIENT 3',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'TEST CLIENT 3',
    },
    {
      companyId: 3757,
      name: 'TEST CLIENT2',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'TEST CLIENT2',
    },
    {
      companyId: 3758,
      name: 'TESTING CLIENT',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'TESTING CLIENT',
    },
    {
      companyId: 3759,
      name: 'ZALAWI ZAMBIA',
      address: '',
      entityTypeDescription: 'CLIENT',
      displayValue: 'ZALAWI ZAMBIA',
    },
  ];

  for (const clientData of clients) {
    await prisma.client.upsert({
      where: { companyId: clientData.companyId },
      update: {},
      create: {
        tenantId: tenant.id,
        ...clientData,
      },
    });
  }

  console.log('✅ Created', clients.length, 'clients');

  // Create drivers from mock data
  const drivers = [
    {
      driverId: 21677,
      name: 'LONGINO TOLOT',
      contactNr: '255755340307',
      idNumber: 'TAE719089',
      pictureLoaded: false,
      countryOfOrigin: 'TANZANIA',
      displayValue: 'LONGINO TOLOT(TZ)',
    },
    {
      driverId: 19280,
      name: 'OMARY SAID OM',
      contactNr: '0973143403',
      idNumber: '1459820',
      pictureLoaded: false,
      countryOfOrigin: 'TANZANIA',
      displayValue: 'OMARY SAID OM(TZ)',
    },
    {
      driverId: 10797,
      name: 'SALANJE MWADI',
      contactNr: '',
      idNumber: 'TAE049377',
      pictureLoaded: false,
      countryOfOrigin: 'TANZANIA',
      displayValue: 'SALANJE MWADI(TZ)',
    },
    {
      driverId: 19579,
      name: 'ABDALLAH MOH',
      contactNr: '250689078310',
      idNumber: 'TAE684555',
      pictureLoaded: true,
      countryOfOrigin: 'ZAMBIA',
      displayValue: 'ABDALLAH MOH(ZM)',
    },
    {
      driverId: 18432,
      name: 'JOHN DOE',
      contactNr: '1234567890',
      idNumber: 'US123456',
      pictureLoaded: true,
      countryOfOrigin: 'UNKNOWN',
      displayValue: 'JOHN DOE(US)',
    },
    {
      driverId: 34751,
      name: 'DALE JONES MWANACHAMPA',
      contactNr: '260977123456',
      idNumber: 'ZM123456',
      pictureLoaded: false,
      countryOfOrigin: 'ZAMBIA',
      displayValue: 'DALE JONES MWANACHAMPA(ZM)',
    },
    {
      driverId: 15532,
      name: 'DAMAS KASIAN MISUNZA',
      contactNr: '255123456789',
      idNumber: 'TZ789012',
      pictureLoaded: true,
      countryOfOrigin: 'TANZANIA',
      displayValue: 'DAMAS KASIAN MISUNZA(TZ)',
    },
    {
      driverId: 22362,
      name: 'DANIEL AMOS',
      contactNr: '255987654321',
      idNumber: 'TZ345678',
      pictureLoaded: false,
      countryOfOrigin: 'TANZANIA',
      displayValue: 'DANIEL AMOS(TZ)',
    },
  ];

  for (const driverData of drivers) {
    await prisma.driver.upsert({
      where: { driverId: driverData.driverId },
      update: {},
      create: {
        tenantId: tenant.id,
        ...driverData,
      },
    });
  }

  console.log('✅ Created', drivers.length, 'drivers');

  // Create vehicles from mock data
  const vehicles = [
    {
      vehicleId: 4319,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0 (TBA)',
      color: '',
      countryOfOrigin: 'UNKNOWN',
      displayValue: '0 (TBA)',
      mileage: 125000,
      lastServiceDate: new Date('2024-01-15'),
      nextServiceDue: new Date('2024-04-15'),
      status: 'Active',
      currentDriver: 'John Doe',
      location: 'Johannesburg, SA',
      lastSeen: '2 minutes ago',
    },
    {
      vehicleId: 23483,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0057AA21 (DRC)',
      color: '',
      countryOfOrigin: 'CONGO (DRC)',
      displayValue: '0057AA21 (DRC)',
      mileage: 89000,
      lastServiceDate: new Date('2024-02-10'),
      nextServiceDue: new Date('2024-05-10'),
      status: 'In Transit',
      currentDriver: 'Jane Smith',
      location: 'Cape Town, SA',
      lastSeen: '5 minutes ago',
    },
    {
      vehicleId: 23007,
      vehicleTypeId: 10,
      entityTypeDescription: 'TRAILER',
      registration: '0193AE10 (DRC)',
      color: '',
      countryOfOrigin: 'CONGO (DRC)',
      displayValue: '0193AE10 (DRC)',
      mileage: 67000,
      lastServiceDate: new Date('2024-01-20'),
      nextServiceDue: new Date('2024-04-20'),
      status: 'Active',
      currentDriver: 'Mike Johnson',
      location: 'Durban, SA',
      lastSeen: '1 hour ago',
    },
    {
      vehicleId: 15298,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0249AB14 (TBA)',
      color: '',
      countryOfOrigin: 'UNKNOWN',
      displayValue: '0249AB14 (TBA)',
      mileage: 145000,
      lastServiceDate: new Date('2024-02-05'),
      nextServiceDue: new Date('2024-05-05'),
      status: 'Maintenance',
      currentDriver: 'Sarah Wilson',
      location: 'Pretoria, SA',
      lastSeen: '3 hours ago',
    },
    {
      vehicleId: 21873,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0360AQ05 (DRC)',
      color: '',
      countryOfOrigin: 'CONGO (DRC)',
      displayValue: '0360AQ05 (DRC)',
      mileage: 98000,
      lastServiceDate: new Date('2024-01-30'),
      nextServiceDue: new Date('2024-04-30'),
      status: 'Active',
      currentDriver: 'David Brown',
      location: 'Port Elizabeth, SA',
      lastSeen: '10 minutes ago',
    },
    {
      vehicleId: 22962,
      vehicleTypeId: 10,
      entityTypeDescription: 'TRAILER',
      registration: '0362AQ05 (DRC)',
      color: '',
      countryOfOrigin: 'CONGO (DRC)',
      displayValue: '0362AQ05 (DRC)',
      mileage: 45000,
      lastServiceDate: new Date('2024-02-15'),
      nextServiceDue: new Date('2024-05-15'),
      status: 'Active',
      currentDriver: 'Lisa Anderson',
      location: 'Bloemfontein, SA',
      lastSeen: '30 minutes ago',
    },
    {
      vehicleId: 23056,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0365AQ05 (DRC)',
      color: '',
      countryOfOrigin: 'CONGO (DRC)',
      displayValue: '0365AQ05 (DRC)',
      mileage: 112000,
      lastServiceDate: new Date('2024-01-25'),
      nextServiceDue: new Date('2024-04-25'),
      status: 'In Transit',
      currentDriver: 'Robert Taylor',
      location: 'East London, SA',
      lastSeen: '15 minutes ago',
    },
    {
      vehicleId: 29056,
      vehicleTypeId: 8,
      entityTypeDescription: 'HORSE',
      registration: '0777AS01 (ZB)',
      color: '',
      countryOfOrigin: 'ZIMBABWE',
      displayValue: '0777AS01 (ZB)',
      mileage: 76000,
      lastServiceDate: new Date('2024-02-20'),
      nextServiceDue: new Date('2024-05-20'),
      status: 'Active',
      currentDriver: 'Emma Davis',
      location: 'Nelspruit, SA',
      lastSeen: '5 minutes ago',
    },
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { vehicleId: vehicleData.vehicleId },
      update: {},
      create: {
        tenantId: tenant.id,
        ...vehicleData,
      },
    });
  }

  console.log('✅ Created', vehicles.length, 'vehicles');

  // Create fuel entries for horses
  const fuelEntries = [
    {
      vehicleId: 4319,
      date: new Date('2024-03-15'),
      amount: 85,
      cost: 1275,
      driver: 'John Doe',
      odometerReading: 125000,
      location: 'Johannesburg, SA',
    },
    {
      vehicleId: 23483,
      date: new Date('2024-03-12'),
      amount: 95,
      cost: 1425,
      driver: 'Jane Smith',
      odometerReading: 89000,
      location: 'Cape Town, SA',
    },
    {
      vehicleId: 15298,
      date: new Date('2024-03-10'),
      amount: 78,
      cost: 1170,
      driver: 'Sarah Wilson',
      odometerReading: 145000,
      location: 'Pretoria, SA',
    },
    {
      vehicleId: 21873,
      date: new Date('2024-03-08'),
      amount: 88,
      cost: 1320,
      driver: 'David Brown',
      odometerReading: 98000,
      location: 'Port Elizabeth, SA',
    },
    {
      vehicleId: 23056,
      date: new Date('2024-03-05'),
      amount: 92,
      cost: 1380,
      driver: 'Robert Taylor',
      odometerReading: 112000,
      location: 'East London, SA',
    },
    {
      vehicleId: 29056,
      date: new Date('2024-03-14'),
      amount: 76,
      cost: 1140,
      driver: 'Emma Davis',
      odometerReading: 76000,
      location: 'Nelspruit, SA',
    },
  ];

  for (const fuelData of fuelEntries) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicleId: fuelData.vehicleId },
    });

    if (vehicle) {
      await prisma.fuelEntry.create({
        data: {
          vehicleId: vehicle.id,
          date: fuelData.date,
          amount: fuelData.amount,
          cost: fuelData.cost,
          driver: fuelData.driver,
          odometerReading: fuelData.odometerReading,
          location: fuelData.location,
        },
      });
    }
  }

  console.log('✅ Created', fuelEntries.length, 'fuel entries');

  // Create vehicle combinations
  const vehicle4319 = await prisma.vehicle.findUnique({
    where: { vehicleId: 4319 },
  });
  const vehicle23007 = await prisma.vehicle.findUnique({
    where: { vehicleId: 23007 },
  });
  const vehicle23483 = await prisma.vehicle.findUnique({
    where: { vehicleId: 23483 },
  });
  const vehicle22962 = await prisma.vehicle.findUnique({
    where: { vehicleId: 22962 },
  });
  const vehicle23056 = await prisma.vehicle.findUnique({
    where: { vehicleId: 23056 },
  });
  const vehicle21873 = await prisma.vehicle.findUnique({
    where: { vehicleId: 21873 },
  });
  const vehicle15298 = await prisma.vehicle.findUnique({
    where: { vehicleId: 15298 },
  });

  // VehicleCombination models not available in current schema
  // TODO: Add VehicleCombination model to schema if needed
  /*
  if (vehicle4319 && vehicle23007) {
    const combo1 = await prisma.vehicleCombination.create({
      data: {
        tenantId: tenant.id,
        horseId: vehicle4319.id,
        driver: 'John Doe',
        status: 'In Transit',
        startDate: new Date('2024-03-15'),
        cargo: 'Copper Ore',
        route: 'Johannesburg → Cape Town',
      },
    });

    await prisma.vehicleCombinationTrailer.create({
      data: {
        combinationId: combo1.id,
        trailerId: vehicle23007.id,
      },
    });
  }

  if (vehicle23483 && vehicle22962 && vehicle23056) {
    const combo2 = await prisma.vehicleCombination.create({
      data: {
        tenantId: tenant.id,
        horseId: vehicle23483.id,
        driver: 'Jane Smith',
        status: 'Loading',
        startDate: new Date('2024-03-16'),
        cargo: 'Agricultural Products',
        route: 'Cape Town → Durban',
      },
    });

    await prisma.vehicleCombinationTrailer.createMany({
      data: [
        { combinationId: combo2.id, trailerId: vehicle22962.id },
        { combinationId: combo2.id, trailerId: vehicle23056.id },
      ],
    });
  }

  if (vehicle21873 && vehicle15298) {
    const combo3 = await prisma.vehicleCombination.create({
      data: {
        tenantId: tenant.id,
        horseId: vehicle21873.id,
        driver: 'David Brown',
        status: 'Active',
        startDate: new Date('2024-03-14'),
        cargo: 'General Freight',
        route: 'Port Elizabeth → Bloemfontein',
      },
    });

    await prisma.vehicleCombinationTrailer.create({
      data: {
        combinationId: combo3.id,
        trailerId: vehicle15298.id,
      },
    });
  }
  */

  console.log('✅ Skipped vehicle combinations (model not in schema)');

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@digiwize.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@digiwize.com',
      passwordHash:
        '$2b$10$e/YMqCHUJXoCqEeN.Ei6N.1G8vBm/KTX/6g9A89J0y6rimfh1fRRG', // 'admin123'
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create Manifest Core seed data
  console.log('🌱 Creating Manifest Core seed data...');

  // Create user roles
  const adminRole = await prisma.userRole.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: { name: "Admin", code: "ADMIN" },
  });

  const opsRole = await prisma.userRole.upsert({
    where: { code: "OPS" },
    update: {},
    create: { name: "Operations", code: "OPS" },
  });

  console.log('✅ Created user roles');

  // Create invoice states
  const newState = await prisma.invoiceState.upsert({
    where: { code: "NEW" },
    update: {},
    create: { name: "New", code: "NEW" },
  });

  const sentState = await prisma.invoiceState.upsert({
    where: { code: "SENT" },
    update: {},
    create: { name: "Sent", code: "SENT" },
  });

  const paidState = await prisma.invoiceState.upsert({
    where: { code: "PAID" },
    update: {},
    create: { name: "Paid", code: "PAID" },
  });

  console.log('✅ Created invoice states');

  // Create routes
  const route1 = await prisma.route.upsert({
    where: { id: "route-1" },
    update: { tenantId: tenant.id, name: "Cape Town → Durban" },
    create: { tenantId: tenant.id, name: "Cape Town → Durban" },
  });

  const route2 = await prisma.route.upsert({
    where: { id: "route-2" },
    update: { tenantId: tenant.id, name: "Johannesburg → Cape Town" },
    create: { tenantId: tenant.id, name: "Johannesburg → Cape Town" },
  });

  console.log('✅ Created routes');

  // Create locations
  const location1 = await prisma.location.create({
    data: {
      tenantId: tenant.id,
      name: "Cape Town Depot",
      description: "Main depot in Cape Town",
      latitude: -33.9249,
      longitude: 18.4241,
    } as any, // TypeScript language server cache issue - name field exists in LocationUncheckedCreateInput
  });

  const location2 = await prisma.location.create({
    data: {
      tenantId: tenant.id,
      name: "Durban Port",
      description: "Port of Durban",
      latitude: -29.8587,
      longitude: 31.0218,
    } as any,
  });

  const location3 = await prisma.location.create({
    data: {
      tenantId: tenant.id,
      name: "Johannesburg Hub",
      description: "Main hub in Johannesburg",
      latitude: -26.2041,
      longitude: 28.0473,
    } as any,
  });

  console.log('✅ Created locations');

  // Create demo manifests
  const manifest1 = await prisma.manifest.create({
    data: {
      tenantId: tenant.id,
      title: "Cape Town to Johannesburg Route",
      status: "IN_PROGRESS",
      scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      trackingId: "TRK-001",
      routeId: route1.id,
      locationId: location1.id,
      invoiceStateId: newState.id,
      rmn: "RMN-001",
      jobNumber: "JOB-001",
    },
  });

  const manifest2 = await prisma.manifest.create({
    data: {
      tenantId: tenant.id,
      title: "Durban to Pretoria Route",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      trackingId: "TRK-002",
      routeId: route2.id,
      locationId: location3.id,
      invoiceStateId: sentState.id,
      rmn: "RMN-002",
      jobNumber: "JOB-002",
    },
  });

  console.log('✅ Created manifests');

  // Create manifest locations (tracking data)
  await prisma.manifestLocation.createMany({
    data: [
      {
        tenantId: tenant.id,
        manifestId: manifest1.id,
        latitude: -33.92,
        longitude: 18.42,
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        tenantId: tenant.id,
        manifestId: manifest1.id,
        latitude: -34.0,
        longitude: 19.0,
        recordedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        tenantId: tenant.id,
        manifestId: manifest1.id,
        latitude: -34.5,
        longitude: 19.5,
        recordedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        tenantId: tenant.id,
        manifestId: manifest2.id,
        latitude: -26.2,
        longitude: 28.0,
        recordedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        tenantId: tenant.id,
        manifestId: manifest2.id,
        latitude: -26.5,
        longitude: 27.5,
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ],
  });

  console.log('✅ Created manifest locations');

  // Create WhatsApp data with sample media
  const whatsappData1 = await prisma.whatsappData.create({
    data: {
      tenantId: tenant.id,
      manifestId: manifest1.id,
    },
  });

  const whatsappData2 = await prisma.whatsappData.create({
    data: {
      tenantId: tenant.id,
      manifestId: manifest2.id,
    },
  });

  // Create sample WhatsApp files
  await prisma.whatsappFile.createMany({
    data: [
      {
        tenantId: tenant.id,
        whatsappDataId: whatsappData1.id,
        fileName: "delivery_confirmation.pdf",
        uri: "https://example.com/files/delivery_confirmation.pdf",
        mimeType: "application/pdf",
        sizeBytes: 245760,
        checksum: "sha256:abc123def456",
      },
      {
        tenantId: tenant.id,
        whatsappDataId: whatsappData1.id,
        fileName: "route_photo.jpg",
        uri: "https://example.com/files/route_photo.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1024000,
        checksum: "sha256:def456ghi789",
      },
    ],
  });

  // Create sample WhatsApp media
  await prisma.whatsappMedia.createMany({
    data: [
      {
        tenantId: tenant.id,
        whatsappDataId: whatsappData2.id,
        extension: "mp4",
        uri: "https://example.com/media/delivery_video.mp4",
        mimeType: "video/mp4",
        sizeBytes: 5242880,
        checksum: "sha256:ghi789jkl012",
      },
    ],
  });

  // Create sample WhatsApp locations
  await prisma.whatsappLocation.createMany({
    data: [
      {
        tenantId: tenant.id,
        whatsappDataId: whatsappData1.id,
        latitude: -33.9250,
        longitude: 18.4242,
        thumbnailUri: "https://example.com/thumbnails/location_thumb.jpg",
      },
      {
        tenantId: tenant.id,
        whatsappDataId: whatsappData2.id,
        latitude: -26.2042,
        longitude: 28.0474,
        thumbnailUri: "https://example.com/thumbnails/location_thumb2.jpg",
      },
    ],
  });

  console.log('✅ Created WhatsApp data');

  // Create audit entries
  await prisma.manifestAudit.createMany({
    data: [
      {
        tenantId: tenant.id,
        manifestId: manifest1.id,
        action: "create",
        oldValues: "{}",
        newValues: JSON.stringify({
          trackingId: "TRK-001",
          routeId: route1.id,
          locationId: location1.id,
        }),
      },
      {
        tenantId: tenant.id,
        manifestId: manifest1.id,
        action: "location_update",
        oldValues: JSON.stringify({ latitude: -33.92, longitude: 18.42 }),
        newValues: JSON.stringify({ latitude: -34.0, longitude: 19.0 }),
      },
      {
        tenantId: tenant.id,
        manifestId: manifest2.id,
        action: "create",
        oldValues: "{}",
        newValues: JSON.stringify({
          trackingId: "TRK-002",
          routeId: route2.id,
          locationId: location3.id,
        }),
      },
    ],
  });

  console.log('✅ Created audit entries');

  console.log('🎉 Manifest Core seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
