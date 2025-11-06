// scripts/verify-seed.ts
// Script to verify that seed data exists in the database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
  try {
    console.log('🔍 Verifying seed data...\n');

    // Check tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            vehicles: true,
            drivers: true,
            manifests: true,
          },
        },
      },
    });

    console.log(`📋 Found ${tenants.length} tenant(s):`);
    tenants.forEach((tenant) => {
      console.log(`  - ${tenant.name} (${tenant.slug})`);
      console.log(`    ID: ${tenant.id}`);
      console.log(`    Vehicles: ${tenant._count.vehicles}`);
      console.log(`    Drivers: ${tenant._count.drivers}`);
      console.log(`    Manifests: ${tenant._count.manifests}`);
      console.log('');
    });

    // Check vehicles for first tenant (if exists)
    if (tenants.length > 0) {
      const firstTenant = tenants[0];
      console.log(`🚗 Vehicles for tenant "${firstTenant.name}":`);
      
      const vehicles = await prisma.vehicle.findMany({
        where: { tenantId: firstTenant.id },
        take: 10,
        select: {
          id: true,
          vehicleId: true,
          registration: true,
          entityTypeDescription: true,
          status: true,
          countryOfOrigin: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`  Total: ${await prisma.vehicle.count({ where: { tenantId: firstTenant.id } })}`);
      console.log(`  Sample (first 10):`);
      vehicles.forEach((v) => {
        console.log(`    - ${v.registration} (${v.entityTypeDescription}) - Status: ${v.status} - ID: ${v.id.slice(-8)}`);
      });

      // Check status distribution
      const statusCounts = await prisma.vehicle.groupBy({
        by: ['status'],
        where: { tenantId: firstTenant.id },
        _count: true,
      });

      console.log(`\n  Status distribution:`);
      statusCounts.forEach((s) => {
        console.log(`    - ${s.status || 'NULL'}: ${s._count}`);
      });

      // Check type distribution
      const typeCounts = await prisma.vehicle.groupBy({
        by: ['entityTypeDescription'],
        where: { tenantId: firstTenant.id },
        _count: true,
      });

      console.log(`\n  Type distribution:`);
      typeCounts.forEach((t) => {
        console.log(`    - ${t.entityTypeDescription}: ${t._count}`);
      });
    }

    // Overall counts
    console.log(`\n📊 Overall Database Counts:`);
    console.log(`  Tenants: ${await prisma.tenant.count()}`);
    console.log(`  Total Vehicles: ${await prisma.vehicle.count()}`);
    console.log(`  Total Drivers: ${await prisma.driver.count()}`);
    console.log(`  Total Manifests: ${await prisma.manifest.count()}`);
    console.log(`  Total Companies: ${await prisma.company.count()}`);

  } catch (error: any) {
    console.error('❌ Error verifying seed data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed()
  .then(() => {
    console.log('\n✅ Seed verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed verification failed:', error);
    process.exit(1);
  });




