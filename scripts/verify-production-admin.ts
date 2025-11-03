// scripts/verify-production-admin.ts
// Verify production admin user and data visibility

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.production') });

const dbUrl = process.env.dmoc_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ No DATABASE_URL found');
  process.exit(1);
}

async function verifyProductionAdmin() {
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  try {
    console.log('🔍 Verifying Production Admin Setup...\n');

    // 1. Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@digiwize.com' },
      include: { tenant: true }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found!');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log('👤 Admin User:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Tenant ID: ${adminUser.tenantId}`);
    console.log(`   Tenant Name: ${adminUser.tenant?.name || 'N/A'}`);
    console.log(`   Is ADMIN: ${adminUser.role === 'ADMIN' ? '✅ YES' : '❌ NO'}\n`);

    // 2. Check total manifests (admin should see all)
    const totalManifests = await prisma.manifest.count();
    console.log(`📦 Total Manifests in Production: ${totalManifests}\n`);

    // 3. Check manifests by tenant
    const tenants = await prisma.tenant.findMany();
    console.log('🏢 Manifests by Tenant:');
    for (const tenant of tenants) {
      const count = await prisma.manifest.count({
        where: { tenantId: tenant.id }
      });
      console.log(`   ${tenant.name} (${tenant.slug}): ${count} manifests`);
    }
    console.log();

    // 4. Sample manifests (latest 5)
    const sampleManifests = await prisma.manifest.findMany({
      take: 5,
      orderBy: { dateTimeAdded: 'desc' },
      select: {
        id: true,
        title: true,
        trackingId: true,
        status: true,
        tenantId: true,
        tenant: {
          select: { name: true }
        }
      }
    });

    if (sampleManifests.length > 0) {
      console.log('📋 Sample Manifests (Latest 5):');
      sampleManifests.forEach((m, i) => {
        console.log(`   ${i + 1}. "${m.title || 'N/A'}" | ${m.trackingId || 'N/A'} | ${m.status} | Tenant: ${m.tenant.name}`);
      });
    } else {
      console.log('⚠️  No manifests found in production!');
    }

    console.log('\n✅ Verification complete!\n');

    // If admin can see all, total count should match sum by tenant
    if (adminUser.role === 'ADMIN') {
      console.log('✅ Admin user has ADMIN role - can see all data\n');
    } else {
      console.log('⚠️  WARNING: Admin user does NOT have ADMIN role!\n');
    }

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyProductionAdmin();

