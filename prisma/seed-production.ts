// prisma/seed-production.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seed...');

  try {
    // Check if tenant already exists
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' },
    });

    if (!tenant) {
      // Create tenant
      tenant = await prisma.tenant.create({
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
    } else {
      console.log('✅ Tenant already exists:', tenant.name);
    }

    // Check if admin user already exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@digiwize.com' },
    });

    if (!adminUser) {
      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@digiwize.com',
          passwordHash,
          role: 'ADMIN',
        },
      });
      console.log('✅ Created admin user:', adminUser.email);
    } else {
      console.log('✅ Admin user already exists:', adminUser.email);
    }

    console.log('🎉 Production database seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`- Admin User: ${adminUser.email} (password: admin123)`);

  } catch (error) {
    console.error('❌ Production seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
