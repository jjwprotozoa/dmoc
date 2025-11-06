// prisma/verify-password.ts
// Utility script to verify a user's password hash
// Usage: npx tsx prisma/verify-password.ts <email-or-username> <password>

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];
  const passwordToTest = process.argv[3];

  if (!identifier || !passwordToTest) {
    console.error('❌ Please provide an email/username and password to test');
    console.log('Usage: npx tsx prisma/verify-password.ts <email-or-username> <password>');
    process.exit(1);
  }

  const isEmail = identifier.includes('@');

  let user;
  if (isEmail) {
    user = await prisma.user.findUnique({
      where: { email: identifier.toLowerCase() },
    });
  } else {
    // Find by username (name field)
    const users = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users WHERE name IS NOT NULL AND LOWER(name) = LOWER(${identifier}) LIMIT 1
    `;
    if (users.length > 0) {
      user = await prisma.user.findUnique({
        where: { id: users[0].id },
      });
    }
  }

  if (!user) {
    console.error(`❌ User not found: ${identifier}`);
    process.exit(1);
  }

  console.log(`\n🔍 Verifying password for user:`);
  console.log(`   Name: ${user.name || 'N/A'}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Has password hash: ${user.passwordHash ? 'Yes' : 'No'}`);
  console.log(`   Is active: ${user.isActive}`);

  if (!user.passwordHash) {
    console.error(`\n❌ User has no password hash!`);
    process.exit(1);
  }

  const isValid = await bcrypt.compare(passwordToTest, user.passwordHash);
  
  console.log(`\n🔐 Password verification:`);
  console.log(`   Password tested: ${passwordToTest}`);
  console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

  if (!isValid) {
    console.log(`\n💡 The password hash in the database does not match the provided password.`);
    console.log(`   Run: npx tsx prisma/reset-user-password.ts ${identifier}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

