// prisma/seed-production.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seed...');

  // Create a default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'digiwize' },
    update: {},
    create: {
      name: 'Digiwize',
      slug: 'digiwize',
      settings: {
        theme: 'amber',
        features: {
          fuelTracking: true,
          vehicleLogbook: true,
          biometrics: true,
          anpr: true,
        },
      },
    },
  });

  console.log('✅ Created tenant:', tenant.name);

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

  // Create some sample companies
  const companies = [
    {
      name: 'DELTA',
      description: 'Delta Logistics',
    },
    {
      name: 'RELOAD',
      description: 'Reload Transport',
    },
    {
      name: 'TEST CLIENT',
      description: 'Test Client Company',
    },
  ];

  for (const companyData of companies) {
    await prisma.company.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: companyData.name,
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        ...companyData,
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

  console.log('✅ Created', locations.length, 'locations');

  // Create some sample invoice states
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
        tenantId_code: {
          tenantId: tenant.id,
          code: stateData.code,
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
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