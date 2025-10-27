// prisma/seed-production-simple-manifests.ts
// Create sample manifest data for production

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating sample manifest data...');

  try {
    // Get the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' }
    });

    if (!tenant) {
      console.error('❌ Tenant not found');
      return;
    }

    console.log(`✅ Using tenant: ${tenant.name}`);

    // Get companies, routes, and locations
    const [companies, routes, locations] = await Promise.all([
      prisma.company.findMany({ where: { tenantId: tenant.id } }),
      prisma.route.findMany({ where: { tenantId: tenant.id } }),
      prisma.location.findMany({ where: { tenantId: tenant.id } }),
    ]);

    console.log(`📦 Found ${companies.length} companies, ${routes.length} routes, ${locations.length} locations`);

    // Create sample manifests
    const sampleManifests = [
      {
        trackingId: '54125',
        title: 'RELOAD CNMC/IXMTRACKING',
        status: 'IN_PROGRESS',
        rmn: 'DL1316478',
        companyId: companies[0]?.id,
        routeId: routes[0]?.id,
        locationId: locations[0]?.id,
      },
      {
        trackingId: '59071',
        title: 'RELOAD CNMC/IXMTRACKING',
        status: 'IN_PROGRESS',
        rmn: 'TBA',
        companyId: companies[0]?.id,
        routeId: routes[0]?.id,
        locationId: locations[1]?.id,
      },
      {
        trackingId: '55906',
        title: 'RELOAD CNMC/IXMTRACKING',
        status: 'SCHEDULED',
        rmn: 'DL1336274',
        companyId: companies[0]?.id,
        routeId: routes[0]?.id,
      },
      {
        trackingId: '55908',
        title: 'RELOAD CNMC/IXMTRACKING',
        status: 'IN_PROGRESS',
        rmn: 'DL1336282',
        companyId: companies[0]?.id,
        routeId: routes[0]?.id,
      },
      {
        trackingId: '58889',
        title: 'RELOAD TFC OCTAGON',
        status: 'IN_PROGRESS',
        rmn: 'TBA',
        companyId: companies[1]?.id,
        routeId: routes[1]?.id,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const manifestData of sampleManifests) {
      try {
        const existing = await prisma.manifest.findUnique({
          where: { trackingId: manifestData.trackingId }
        });

        if (existing) {
          console.log(`⏭️  Skipping ${manifestData.trackingId} (already exists)`);
          skipped++;
          continue;
        }

        await prisma.manifest.create({
          data: {
            tenantId: tenant.id,
            ...manifestData,
            dateTimeAdded: new Date(),
            dateTimeUpdated: new Date(),
          }
        });

        created++;
        console.log(`✅ Created manifest ${manifestData.trackingId}`);
      } catch (error) {
        console.error(`❌ Error creating manifest ${manifestData.trackingId}:`, error);
      }
    }

    console.log('\n🎉 Manifest creation completed!');
    console.log(`✅ Created: ${created} manifests`);
    console.log(`⏭️  Skipped: ${skipped} manifests`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

