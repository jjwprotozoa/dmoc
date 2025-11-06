// prisma/check-user.ts
// Quick script to check if a user exists and their details
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'justin@delta.local';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenant: true,
      clientAccess: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!user) {
    console.log('❌ User not found:', email);
  } else {
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Is Active:', user.isActive);
    console.log('   Has Password Hash:', !!user.passwordHash);
    console.log('   Tenant ID:', user.tenantId);
    console.log('   Tenant Slug:', user.tenantSlug);
    console.log('   Tenant Name:', user.tenant?.name);
    console.log('   Role:', user.role);
    console.log('   Client Access:', user.clientAccess.length, 'clients');
    user.clientAccess.forEach(uc => {
      console.log(`     - ${uc.client.name} (${uc.clientId})`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

