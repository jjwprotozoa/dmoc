// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Digiwize Logistics',
      slug: 'digiwize',
      settings: JSON.stringify({
        theme: 'blue',
        features: {
          alpr: true,
          biometrics: true,
          whatsapp: true,
        },
      }),
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      tenantId: tenant.id,
      name: 'Delta Transport',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create company
  const company = await prisma.company.create({
    data: {
      orgId: organization.id,
      name: 'Delta Fleet Services',
    },
  });

  console.log('✅ Created company:', company.name);

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@digiwize.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create driver
  const driver = await prisma.driver.create({
    data: {
      companyId: company.id,
      name: 'John Smith',
      licenseNo: 'DL123456789',
      active: true,
    },
  });

  console.log('✅ Created driver:', driver.name);

  // Create vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      companyId: company.id,
      plate: 'ABC-123',
      make: 'Ford',
      model: 'Transit',
      color: 'White',
    },
  });

  console.log('✅ Created vehicle:', vehicle.plate);

  // Create device
  const device = await prisma.device.create({
    data: {
      tenantId: tenant.id,
      externalId: 'traccar-device-001',
      lastPingAt: new Date(),
    },
  });

  console.log('✅ Created device:', device.externalId);

  // Create manifest
  const manifest = await prisma.manifest.create({
    data: {
      companyId: company.id,
      title: 'Morning Delivery Route',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  });

  console.log('✅ Created manifest:', manifest.title);

  // Create stops
  const stops = await Promise.all([
    prisma.stop.create({
      data: {
        manifestId: manifest.id,
        order: 1,
        location: JSON.stringify({ lat: -26.2041, lng: 28.0473 }), // Johannesburg
      },
    }),
    prisma.stop.create({
      data: {
        manifestId: manifest.id,
        order: 2,
        location: JSON.stringify({ lat: -26.1715, lng: 28.0416 }), // Sandton
      },
    }),
  ]);

  console.log('✅ Created stops:', stops.length);

  // Create sample location pings
  const pings = await Promise.all([
    prisma.locationPing.create({
      data: {
        deviceId: device.id,
        lat: -26.2041,
        lng: 28.0473,
        speed: 45.5,
        heading: 180,
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    }),
    prisma.locationPing.create({
      data: {
        deviceId: device.id,
        lat: -26.1950,
        lng: 28.0440,
        speed: 52.3,
        heading: 175,
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    }),
    prisma.locationPing.create({
      data: {
        deviceId: device.id,
        lat: -26.1850,
        lng: 28.0400,
        speed: 38.7,
        heading: 170,
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
    }),
  ]);

  console.log('✅ Created location pings:', pings.length);

  // Create sample offense
  const offense = await prisma.offense.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      kind: 'SPEEDING',
      severity: 'MINOR',
      notes: 'Exceeded speed limit by 10km/h',
    },
  });

  console.log('✅ Created offense:', offense.kind);

  // Create sample webhook event
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      source: 'whatsapp',
      payload: JSON.stringify({
        message: 'Driver reported delay due to traffic',
        timestamp: new Date().toISOString(),
        phone: '+27123456789',
      }),
      status: 'PENDING',
    },
  });

  console.log('✅ Created webhook event:', webhookEvent.source);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`- Organization: ${organization.name}`);
  console.log(`- Company: ${company.name}`);
  console.log(`- Admin User: ${adminUser.email} (password: admin123)`);
  console.log(`- Driver: ${driver.name}`);
  console.log(`- Vehicle: ${vehicle.plate}`);
  console.log(`- Manifest: ${manifest.title}`);
  console.log(`- Stops: ${stops.length}`);
  console.log(`- Location Pings: ${pings.length}`);
  console.log(`- Offense: ${offense.kind}`);
  console.log(`- Webhook Event: ${webhookEvent.source}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
