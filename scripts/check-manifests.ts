// scripts/check-manifests.ts
// Quick script to check if manifests exist in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkManifests() {
  try {
    console.log('🔍 Checking manifests in database...\n');

    // Check total manifests
    const totalManifests = await prisma.manifest.count();
    console.log(`📊 Total manifests in database: ${totalManifests}\n`);

    if (totalManifests === 0) {
      console.log('❌ No manifests found in database!');
      console.log('💡 You may need to seed the database with manifests.\n');
      
      // Check if tenant exists
      const tenants = await prisma.tenant.findMany();
      console.log(`🏢 Tenants in database: ${tenants.length}`);
      tenants.forEach(t => {
        console.log(`   - ${t.name} (${t.slug}) - ID: ${t.id}`);
      });
      
      await prisma.$disconnect();
      return;
    }

    // Get manifests by tenant
    const tenants = await prisma.tenant.findMany();
    console.log('📦 Manifests by tenant:');
    for (const tenant of tenants) {
      const count = await prisma.manifest.count({
        where: { tenantId: tenant.id }
      });
      console.log(`   ${tenant.name} (${tenant.slug}): ${count} manifests`);
    }
    console.log();

    // Get sample manifests
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
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    console.log('📋 Sample manifests (latest 5):');
    sampleManifests.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title || 'No title'} (${m.trackingId || 'No tracking ID'})`);
      console.log(`      Status: ${m.status}, Tenant: ${m.tenant.name} (${m.tenant.slug})`);
    });

    // Check admin user
    console.log('\n👤 Checking admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@digiwize.com' },
      include: { tenant: true }
    });

    if (adminUser) {
      console.log(`   ✅ Admin user found:`);
      console.log(`      Email: ${adminUser.email}`);
      console.log(`      Role: ${adminUser.role}`);
      console.log(`      Tenant: ${adminUser.tenant.name} (${adminUser.tenant.slug})`);
      console.log(`      Tenant ID: ${adminUser.tenantId}`);
      
      // Check if admin can see manifests (no tenant filter)
      const adminManifests = await prisma.manifest.count();
      console.log(`\n   📊 Manifests admin should see (all tenants): ${adminManifests}`);
      
      // Check if admin's tenant has manifests
      const tenantManifests = await prisma.manifest.count({
        where: { tenantId: adminUser.tenantId }
      });
      console.log(`   📊 Manifests in admin's tenant: ${tenantManifests}`);
    } else {
      console.log('   ❌ Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Error checking manifests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkManifests();

