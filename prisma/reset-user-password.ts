// prisma/reset-user-password.ts
// Utility script to reset a specific user's password to TempPassword123!
// Usage: npx tsx prisma/reset-user-password.ts <email-or-username>

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('❌ Please provide an email or username');
    console.log(
      'Usage: npx tsx prisma/reset-user-password.ts <email-or-username>'
    );
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

  const tempPassword = 'TempPassword123!';
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log(`✅ Password reset for user: ${user.name || user.email}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Temporary password: ${tempPassword}`);
  console.log(`   ⚠️  User should change password on first login.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
