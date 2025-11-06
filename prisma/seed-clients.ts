// prisma/seed-clients.ts
// Seed script to populate Client table with company data
// Run with: npm run db:seed:clients

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Company list from user requirements
const companies = [
  { companyId: 3103, name: 'ACCESS' },
  { companyId: 3881, name: 'AFRICA WAKAWAKA' },
  { companyId: 3300, name: 'AFRICLAN' },
  { companyId: 4087, name: 'CML / NYATI MUFULIRA TO DURBAN' },
  { companyId: 3725, name: 'DELTA' },
  { companyId: 3376, name: 'DELTA FORCE / ZERODEGREES' },
  { companyId: 3225, name: 'DELTA PUMA RISK' },
  { companyId: 3952, name: 'DELTA ESCORTS / CML KANSANSHI - DAR' },
  { companyId: 3491, name: 'DELTA / POLYTRA' },
  { companyId: 3070, name: 'GREENDOOR' },
  { companyId: 3074, name: 'INARA' },
  { companyId: 3976, name: 'INARA (LIBERTY)' },
  { companyId: 3255, name: 'INARA MOXICO' },
  { companyId: 3301, name: 'KOBRACLIENT2' },
  { companyId: 3630, name: 'LINK AFRICA' },
  { companyId: 3095, name: 'MYSTICAL' },
  { companyId: 3360, name: 'RELOAD ADD' },
  { companyId: 3041, name: 'RELOAD CITIC' },
  { companyId: 3243, name: 'RELOAD CNMC / IXMTRACKING' },
  { companyId: 3427, name: 'RELOAD DELTA ASK' },
  { companyId: 3421, name: 'RELOAD KABWE / GRB' },
];

async function main() {
  console.log('🌱 Seeding clients...');

  // Get or create Digiwize tenant (clients are typically global or tenant-specific)
  // For now, we'll create them under Digiwize tenant, but they can be accessed by all tenants
  let digiwizeTenant = await prisma.tenant.findUnique({
    where: { slug: 'digiwize' },
  });

  if (!digiwizeTenant) {
    digiwizeTenant = await prisma.tenant.create({
      data: {
        name: 'Digiwize',
        slug: 'digiwize',
      },
    });
    console.log('✅ Created Digiwize tenant');
  }

  // Create or update clients
  for (const company of companies) {
    const existing = await prisma.client.findUnique({
      where: { companyId: company.companyId },
    });

    if (existing) {
      await prisma.client.update({
        where: { companyId: company.companyId },
        data: {
          name: company.name,
          displayValue: company.name,
          entityTypeDescription: 'Client Company',
        },
      });
      console.log(`✅ Updated client: ${company.name} (${company.companyId})`);
    } else {
      await prisma.client.create({
        data: {
          tenantId: digiwizeTenant.id,
          companyId: company.companyId,
          name: company.name,
          displayValue: company.name,
          entityTypeDescription: 'Client Company',
        },
      });
      console.log(`✅ Created client: ${company.name} (${company.companyId})`);
    }
  }

  console.log(`\n✨ Seeded ${companies.length} clients successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding clients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

