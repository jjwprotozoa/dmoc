// prisma/seed-users.ts
// Seed script to import all users from legacy Windows system
// Matches the user list provided for Delta, Kobra, Inara, and Digiwize tenants

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface UserData {
  username: string;
  role: string;
  isActive: boolean;
  tenantSlug: 'delta' | 'kobra' | 'inara' | 'digiwize';
  email?: string; // Optional email, will be generated if not provided
}

// All users from the legacy system
const users: UserData[] = [
  // Delta Tenant Users
  { username: 'MUWEMA EUGINE', role: 'ADMINISTRATOR', isActive: false, tenantSlug: 'delta' },
  { username: 'Accounts', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'admin', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'AdminDelta', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'AdminInara', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'Ben Ojuka', role: 'VIEWER', isActive: true, tenantSlug: 'delta' },
  { username: 'BLESSING SIKAONA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'BLESSINGS MUSUKWA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'BWALYA ELIAS', role: 'ADMINISTRATOR', isActive: false, tenantSlug: 'delta' },
  { username: 'Callum', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'CHAMA NEWTON', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'CHAMA WILSON', role: 'CONTROLLER', isActive: false, tenantSlug: 'delta' },
  { username: 'CHARLES SIMWANZA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'CHIBUYE ANDREW', role: 'ADMINISTRATOR', isActive: false, tenantSlug: 'delta' },
  { username: 'CHIPUNGA NELSON', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'CHULU GREVAZIO', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'COMFORT PHIRI', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Controller', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'DANNY KAZAMBA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'DeltaAccounts', role: 'ACCOUNTS', isActive: true, tenantSlug: 'delta' },
  { username: 'DERICK MUNKONDYA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'dirk@digiwize.tech', role: 'VIEWER', isActive: true, tenantSlug: 'delta', email: 'dirk@digiwize.tech' },
  { username: 'DONATIEN', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'EUGINE MUWEMA', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'EMMA SILOMBA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'JAYSON OTALA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'JENNIPHER NAMUKOKO', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'JOHNSON MULEKA', role: 'ADMINISTRATOR', isActive: false, tenantSlug: 'delta' },
  { username: 'JOSEPH BANDA', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'JOSHUA ALBERT KYUNGU', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Justin', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'JUSTIN KAIMBI', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'KAMPAMBWE GIVEN', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'KANGWA KEDRICK', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'KALLUM', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'KATOTA GLENN', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'keith@digiwize.tech', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta', email: 'keith@digiwize.tech' },
  { username: 'KarlDelta', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'Lida Dias', role: 'ACCOUNTS', isActive: true, tenantSlug: 'delta' },
  { username: 'MALAMBO BENKEL HAMAKANDO', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Manager', role: 'MANAGER', isActive: true, tenantSlug: 'delta' },
  { username: 'MONDAY LUMBYA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MWENYA JACOB', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MWILA HARRISON', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MUMBI KENNEDY', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MUSA NJERENJE', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MUSONDA INNOCENT', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MUSONDA RODGERS', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MUSOSA AMOS', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'MUTALE BWALYA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'MWABA DANIEL', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'MWING\'AMBA MAURICE', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Nicke', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'NoUser', role: 'VIEWER', isActive: false, tenantSlug: 'delta' },
  { username: 'NTONONGELA PAUL', role: 'CONTROLLER', isActive: false, tenantSlug: 'delta' },
  { username: 'OTAILA JAYSON', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Philbert', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Philbert Reload', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'Raqeeb Ahamed', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'Reload', role: 'VIEWER', isActive: true, tenantSlug: 'delta' },
  { username: 'Saiiath', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'SIMANONCA SEEMS PROSPER', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'SIMON MABVUTO KAPOKO', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'SIMUKOKO KAMYALILE', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'SIMUKOKO LUCKY', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'SIMWANZA LAMECK', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'Stephan Mdolo', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'test2', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'delta' },
  { username: 'TZControl', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'VALENTINE SIKAONA', role: 'CONTROLLER', isActive: true, tenantSlug: 'delta' },
  { username: 'VALENTINE SIKAONA', role: 'VIEWER', isActive: true, tenantSlug: 'delta', email: 'valentine.sikaona.viewer@delta.local' }, // Duplicate username, different role - use unique email

  // Kobra Tenant Users
  { username: 'AdminKobra', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'kobra' },
  { username: 'GIFT KABWE', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },
  { username: 'GIFT NGANDU', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },
  { username: 'KarlKobra', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },
  { username: 'KeithKobra', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'kobra' },
  { username: 'Kobra', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },
  { username: 'KAPAMBWE GIVEN', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },
  { username: 'KATANDA GIFT', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'kobra' },
  { username: 'MAUNGWE EMMANUEL', role: 'CONTROLLER', isActive: true, tenantSlug: 'kobra' },

  // Inara Tenant Users
  { username: 'AdminInara', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'inara' },

  // Digiwize Tenant Users
  { username: 'dirk@digiwize.tech', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'digiwize', email: 'dirk@digiwize.tech' },
  { username: 'keith@digiwize.tech', role: 'ADMINISTRATOR', isActive: true, tenantSlug: 'digiwize', email: 'keith@digiwize.tech' },
];

/**
 * Generate email from username if not provided
 */
function generateEmail(username: string, tenantSlug: string): string {
  // If username is already an email, use it
  if (username.includes('@')) {
    return username.toLowerCase();
  }
  // Otherwise generate: username@tenant.local
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanUsername}@${tenantSlug}.local`;
}

async function main() {
  // Check if we should reset passwords for existing users
  // Set RESET_PASSWORDS=true environment variable to reset all user passwords
  const resetPasswords = process.env.RESET_PASSWORDS === 'true';
  
  if (resetPasswords) {
    console.log('⚠️  RESET_PASSWORDS=true - Will reset passwords for existing users\n');
  }
  
  console.log('🌱 Starting user seed from legacy Windows system...\n');

  // Ensure all tenants exist
  const tenants = await Promise.all([
    prisma.tenant.upsert({
      where: { slug: 'delta' },
      update: {},
      create: {
        name: 'Delta',
        slug: 'delta',
        settings: '{}',
      },
    }),
    prisma.tenant.upsert({
      where: { slug: 'kobra' },
      update: {},
      create: {
        name: 'Kobra',
        slug: 'kobra',
        settings: '{}',
      },
    }),
    prisma.tenant.upsert({
      where: { slug: 'inara' },
      update: {},
      create: {
        name: 'Inara',
        slug: 'inara',
        settings: '{}',
      },
    }),
    prisma.tenant.upsert({
      where: { slug: 'digiwize' },
      update: {},
      create: {
        name: 'Digiwize',
        slug: 'digiwize',
        settings: '{}',
      },
    }),
  ]);

  console.log('✅ Created/verified tenants:', tenants.map((t) => t.name).join(', '));

  // Create a map of tenant slugs to IDs
  const tenantMap = new Map(tenants.map((t) => [t.slug, t]));

  // Default password for all users (should be changed on first login)
  const defaultPassword = 'TempPassword123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  let created = 0;
  let updated = 0;
  let errors = 0;

  // Process each user
  for (const userData of users) {
    try {
      const tenant = tenantMap.get(userData.tenantSlug);
      if (!tenant) {
        console.error(`❌ Tenant not found: ${userData.tenantSlug}`);
        errors++;
        continue;
      }

      const email = userData.email || generateEmail(userData.username, userData.tenantSlug);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { email },
          data: {
            name: userData.username,
            role: userData.role,
            isActive: userData.isActive,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            // Reset password if RESET_PASSWORDS flag is set
            ...(resetPasswords ? { passwordHash } : {}),
          },
        });
        updated++;
        console.log(
          `   ↻ Updated: ${userData.username} (${userData.role}) - ${tenant.name}${
            resetPasswords ? ' [password reset]' : ''
          }`
        );
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            email,
            name: userData.username,
            passwordHash,
            role: userData.role,
            isActive: userData.isActive,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
          },
        });
        created++;
        console.log(`   ✓ Created: ${userData.username} (${userData.role}) - ${tenant.name}`);
      }
    } catch (error: any) {
      errors++;
      console.error(`   ✗ Error creating user ${userData.username}:`, error.message);
    }
  }

  console.log(`\n✅ User seed complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n⚠️  Default password for all users: ${defaultPassword}`);
  console.log(`   Users should change their password on first login.`);
  if (!resetPasswords && updated > 0) {
    console.log(`\n💡 Tip: To reset passwords for existing users, run:`);
    console.log(`   RESET_PASSWORDS=true npx tsx prisma/seed-users.ts`);
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

