// FILE: tests/offenses-cross-tenant.test.ts
// Regression test: Offenses should follow drivers/vehicles when they move between tenants
// This documents the intended behavior so future refactors don't "simplify" it away.
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

describe('Offenses Cross-Tenant Visibility', () => {
  let tenantAId: string | undefined;
  let tenantBId: string | undefined;
  let tenantAUserId: string | undefined;
  let tenantBUserId: string | undefined;
  let driverId: string | undefined;
  let offenseId: string | undefined;

  // Generate unique test identifiers
  const testId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  beforeAll(async () => {
    // Create test tenants with unique slugs
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A (Cobra)',
        slug: `tenant-a-${testId}`,
        settings: '{}',
      },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B (Delta)',
        slug: `tenant-b-${testId}`,
        settings: '{}',
      },
    });
    tenantBId = tenantB.id;

    // Create test users
    const tenantAUser = await prisma.user.create({
      data: {
        email: `user-a-${testId}@test.com`,
        name: 'Tenant A User',
        role: 'USER',
        tenantId: tenantAId,
        tenantSlug: `tenant-a-${testId}`,
      },
    });
    tenantAUserId = tenantAUser.id;

    const tenantBUser = await prisma.user.create({
      data: {
        email: `user-b-${testId}@test.com`,
        name: 'Tenant B User',
        role: 'USER',
        tenantId: tenantBId,
        tenantSlug: `tenant-b-${testId}`,
      },
    });
    tenantBUserId = tenantBUser.id;

    // Create a driver in Tenant A
    // Use hash of testId to ensure unique driverId
    const hashDriverId = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueDriverId = Math.abs(hashDriverId % 1000000) || 100001;
    const driver = await prisma.driver.create({
      data: {
        tenantId: tenantAId,
        driverId: uniqueDriverId,
        name: 'John Driver',
        idNumber: 'ID-001',
        countryOfOrigin: 'ZA',
        displayValue: 'John Driver',
      },
    });
    driverId = driver.id;

    // Create an offense tied to that driver in Tenant A
    const offense = await prisma.offense.create({
      data: {
        tenantId: tenantAId, // Created in Tenant A
        driverId: driverId,
        kind: 'SPEEDING',
        severity: 'MODERATE',
        notes: 'Test offense created in Tenant A',
      },
    });
    offenseId = offense.id;
  });

  afterAll(async () => {
    // Clean up - filter out undefined values
    if (offenseId) {
      await prisma.offense.deleteMany({
        where: { id: offenseId },
      });
    }
    if (driverId) {
      await prisma.driver.deleteMany({
        where: { id: driverId },
      });
    }
    const userIds = [tenantAUserId, tenantBUserId].filter((id): id is string => id !== undefined);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    const tenantIds = [tenantAId, tenantBId].filter((id): id is string => id !== undefined);
    if (tenantIds.length > 0) {
      await prisma.tenant.deleteMany({
        where: { id: { in: tenantIds } },
      });
    }
    await prisma.$disconnect();
  });

  const createContextWithSession = (user: {
    id: string;
    tenantId: string;
    role: string;
    email: string;
    name: string;
    tenantSlug?: string;
  }) => {
    const ctx = createTRPCContext();
    ctx.session = {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
        name: user.name,
        tenantSlug: user.tenantSlug || `tenant-a-${testId}`,
      },
    } as any;
    return ctx;
  };

  it('should show offense to Tenant A before driver moves', async () => {
    const ctx = createContextWithSession({
      id: tenantAUserId!,
      tenantId: tenantAId!,
      role: 'USER',
      email: `user-a-${testId}@test.com`,
      name: 'Tenant A User',
      tenantSlug: `tenant-a-${testId}`,
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.offenses.getAll({});

    // Tenant A should see the offense (driver is in Tenant A)
    const offense = result.find((o) => o.id === offenseId);
    expect(offense).toBeDefined();
    expect(offense?.notes).toBe('Test offense created in Tenant A');
  });

  it('should NOT show offense to Tenant B before driver moves', async () => {
    const ctx = createContextWithSession({
      id: tenantBUserId!,
      tenantId: tenantBId!,
      role: 'USER',
      email: `user-b-${testId}@test.com`,
      name: 'Tenant B User',
      tenantSlug: `tenant-b-${testId}`,
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.offenses.getAll({});

    // Tenant B should NOT see the offense (driver is still in Tenant A)
    const offense = result.find((o) => o.id === offenseId);
    expect(offense).toBeUndefined();
  });

  it('should show offense to Tenant B after driver moves to Tenant B', async () => {
    // Move the driver from Tenant A to Tenant B
    await prisma.driver.update({
      where: { id: driverId },
      data: { tenantId: tenantBId },
    });

    const ctx = createContextWithSession({
      id: tenantBUserId!,
      tenantId: tenantBId!,
      role: 'USER',
      email: `user-b-${testId}@test.com`,
      name: 'Tenant B User',
      tenantSlug: `tenant-b-${testId}`,
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.offenses.getAll({});

    // Tenant B should now see the offense (driver is now in Tenant B)
    // This is the key behavior: offenses follow mobile drivers across tenants
    const offense = result.find((o) => o.id === offenseId);
    expect(offense).toBeDefined();
    expect(offense?.notes).toBe('Test offense created in Tenant A');
    expect(offense?.driver?.tenantId).toBe(tenantBId); // Driver is now in Tenant B
  });

  it('should NOT show offense to Tenant A after driver moves', async () => {
    const ctx = createContextWithSession({
      id: tenantAUserId!,
      tenantId: tenantAId!,
      role: 'USER',
      email: `user-a-${testId}@test.com`,
      name: 'Tenant A User',
      tenantSlug: `tenant-a-${testId}`,
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.offenses.getAll({});

    // Tenant A should NOT see the offense anymore (driver moved to Tenant B)
    const offense = result.find((o) => o.id === offenseId);
    expect(offense).toBeUndefined();
  });

  it('should show offense history when querying by driverId', async () => {
    const ctx = createContextWithSession({
      id: tenantBUserId!,
      tenantId: tenantBId!,
      role: 'USER',
      email: `user-b-${testId}@test.com`,
      name: 'Tenant B User',
      tenantSlug: `tenant-b-${testId}`,
    });
    const caller = appRouter.createCaller(ctx);

    // Query offenses for the specific driver
    const result = await caller.offenses.getAll({
      driverId: driverId,
    });

    // Should see the offense even though it was created in Tenant A
    expect(result.some((o) => o.id === offenseId)).toBe(true);
    expect(result.some((o) => o.notes === 'Test offense created in Tenant A')).toBe(true);
  });
});

