// prisma/create-admin-user.ts
// Create admin@digiwize.com user if it doesn't exist
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Find Digiwize tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'digiwize' },
  });

  if (!tenant) {
    console.error('❌ Digiwize tenant not found');
    process.exit(1);
  }

  // Check if admin user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@digiwize.com' },
  });

  if (existingUser) {
    console.log('✅ Admin user already exists:', existingUser.email);
    console.log('   Resetting password to admin123...');
    
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.user.update({
      where: { email: 'admin@digiwize.com' },
      data: { passwordHash },
    });
    
    console.log('✅ Password reset to: admin123');
  } else {
    console.log('📝 Creating admin user...');
    
    const passwordHash = await bcrypt.hash('admin123', 12);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'admin@digiwize.com',
        name: 'Admin',
        passwordHash,
        role: 'ADMINISTRATOR',
        tenantSlug: 'digiwize',
        isActive: true,
      },
    });
    
    console.log('✅ Admin user created:', user.email);
    console.log('   Password: admin123');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

