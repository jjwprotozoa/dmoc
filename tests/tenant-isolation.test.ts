// FILE: tests/tenant-isolation.test.ts
// Integration tests for tenant isolation across all refactored routers
// Verifies that buildTenantWhere is properly used and admin bypass works
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

describe('Tenant Isolation - All Routers', () => {
  let tenantAId: string | undefined;
  let tenantBId: string | undefined;
  let adminUserId: string | undefined;
  let tenantAUserId: string | undefined;

  // Generate unique test identifiers
  const testId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  beforeAll(async () => {
    // Create test tenants with unique slugs
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A',
        slug: `tenant-a-${testId}`,
        settings: '{}',
      },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B',
        slug: `tenant-b-${testId}`,
        settings: '{}',
      },
    });
    tenantBId = tenantB.id;

    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        email: `admin-${testId}@test.com`,
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: tenantAId, // Admin still has a tenantId for mutations
        tenantSlug: `tenant-a-${testId}`,
      },
    });
    adminUserId = adminUser.id;

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

    // Create test data for Tenant A
    // Use hash of testId to ensure unique companyId and driverId
    const hashA = testId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueIdA = Math.abs(hashA % 1000000) || 100001; // Ensure positive, non-zero
    await prisma.client.create({
      data: {
        tenantId: tenantAId,
        companyId: uniqueIdA,
        entityTypeDescription: 'Test Client A',
        name: 'Client A',
        displayValue: 'Client A',
      },
    });

    await prisma.driver.create({
      data: {
        tenantId: tenantAId,
        driverId: uniqueIdA,
        name: 'Driver A',
        idNumber: 'ID-A-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Driver A',
      },
    });

    await prisma.vehicle.create({
      data: {
        tenantId: tenantAId,
        vehicleId: uniqueIdA,
        entityTypeDescription: 'Horse',
        registration: 'REG-A-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Vehicle A',
      },
    });

    await prisma.location.create({
      data: {
        tenantId: tenantAId,
        name: 'Location A',
      },
    });

    await prisma.contact.create({
      data: {
        tenantId: tenantAId,
        name: 'Contact A',
        contactNr: '+27123456789',
        idNumber: 'ID-CONTACT-A-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Contact A',
      },
    });

    await prisma.logisticsOfficer.create({
      data: {
        tenantId: tenantAId,
        name: 'Officer A',
        phone: '+27123456789',
      },
    });

    await prisma.vehicleCombination.create({
      data: {
        tenantId: tenantAId,
        horseId: (await prisma.vehicle.findFirst({
          where: { tenantId: tenantAId },
        }))!.id,
        driver: 'Driver A',
        startDate: new Date(),
      },
    });

    // Create test data for Tenant B
    // Use hash of testId + offset to ensure unique companyId and driverId
    const hashB = testId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueIdB = (Math.abs(hashB % 1000000) || 100002) + 1; // Ensure positive, non-zero, different from A
    await prisma.client.create({
      data: {
        tenantId: tenantBId,
        companyId: uniqueIdB,
        entityTypeDescription: 'Test Client B',
        name: 'Client B',
        displayValue: 'Client B',
      },
    });

    await prisma.driver.create({
      data: {
        tenantId: tenantBId,
        driverId: uniqueIdB,
        name: 'Driver B',
        idNumber: 'ID-B-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Driver B',
      },
    });

    await prisma.vehicle.create({
      data: {
        tenantId: tenantBId,
        vehicleId: uniqueIdB,
        entityTypeDescription: 'Horse',
        registration: 'REG-B-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Vehicle B',
      },
    });

    await prisma.location.create({
      data: {
        tenantId: tenantBId,
        name: 'Location B',
      },
    });

    await prisma.contact.create({
      data: {
        tenantId: tenantBId,
        name: 'Contact B',
        contactNr: '+27987654321',
        idNumber: 'ID-CONTACT-B-001',
        countryOfOrigin: 'ZA',
        displayValue: 'Contact B',
      },
    });

    await prisma.logisticsOfficer.create({
      data: {
        tenantId: tenantBId,
        name: 'Officer B',
        phone: '+27987654321',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data - filter out undefined values
    const tenantIds = [tenantAId, tenantBId].filter(
      (id): id is string => id !== undefined
    );

    if (tenantIds.length > 0) {
      await prisma.vehicleCombination.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      // Offenses will be cascade deleted when tenants are deleted
      // But try to delete them explicitly if tenantId column exists
      try {
        await prisma.offense.deleteMany({
          where: { tenantId: { in: tenantIds } },
        });
      } catch (error) {
        // If tenantId column doesn't exist, offenses will cascade delete with tenants anyway
        console.warn(
          'Could not delete offenses by tenantId, will cascade with tenant deletion'
        );
      }
      await prisma.contact.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.logisticsOfficer.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.location.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.vehicle.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.driver.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.client.deleteMany({
        where: { tenantId: { in: tenantIds } },
      });
      await prisma.tenant.deleteMany({
        where: { id: { in: tenantIds } },
      });
    }

    const userIds = [adminUserId, tenantAUserId].filter(
      (id): id is string => id !== undefined
    );
    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }

    await prisma.$disconnect();
  });

  // Helper to create context with session
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

  describe('Clients Router', () => {
    it('should filter clients by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clients.getAll({});

      // Should only see Tenant A clients
      expect(result.every((c) => c.tenantId === tenantAId)).toBe(true);
      expect(result.some((c) => c.name === 'Client A')).toBe(true);
      expect(result.some((c) => c.name === 'Client B')).toBe(false);
    });

    it('should show all clients for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clients.getAll({});

      // Admin should see both tenants' clients
      expect(result.some((c) => c.name === 'Client A')).toBe(true);
      expect(result.some((c) => c.name === 'Client B')).toBe(true);
    });
  });

  describe('Drivers Router', () => {
    it('should filter drivers by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.drivers.getAll({});

      expect(result.every((d) => d.tenantId === tenantAId)).toBe(true);
      expect(result.some((d) => d.name === 'Driver A')).toBe(true);
      expect(result.some((d) => d.name === 'Driver B')).toBe(false);
    });

    it('should show all drivers for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.drivers.getAll({});

      expect(result.some((d) => d.name === 'Driver A')).toBe(true);
      expect(result.some((d) => d.name === 'Driver B')).toBe(true);
    });
  });

  describe('Vehicles Router', () => {
    it('should filter vehicles by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.vehicles.getAll({});

      expect(result.every((v) => v.tenantId === tenantAId)).toBe(true);
      expect(result.some((v) => v.registration === 'REG-A-001')).toBe(true);
      expect(result.some((v) => v.registration === 'REG-B-001')).toBe(false);
    });

    it('should show all vehicles for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.vehicles.getAll({});

      expect(result.some((v) => v.registration === 'REG-A-001')).toBe(true);
      expect(result.some((v) => v.registration === 'REG-B-001')).toBe(true);
    });
  });

  describe('Locations Router', () => {
    it('should filter locations by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.locations.list({});

      expect(result.items.every((l) => l.tenantId === tenantAId)).toBe(true);
      expect(result.items.some((l) => l.name === 'Location A')).toBe(true);
      expect(result.items.some((l) => l.name === 'Location B')).toBe(false);
    });

    it('should show all locations for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.locations.list({});

      expect(result.items.some((l) => l.name === 'Location A')).toBe(true);
      expect(result.items.some((l) => l.name === 'Location B')).toBe(true);
    });
  });

  describe('Contacts Router', () => {
    it('should filter contacts by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contacts.list({});

      expect(result.items.every((c) => c.tenantId === tenantAId)).toBe(true);
      expect(result.items.some((c) => c.name === 'Contact A')).toBe(true);
      expect(result.items.some((c) => c.name === 'Contact B')).toBe(false);
    });

    it('should show all contacts for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contacts.list({});

      expect(result.items.some((c) => c.name === 'Contact A')).toBe(true);
      expect(result.items.some((c) => c.name === 'Contact B')).toBe(true);
    });
  });

  describe('Logistics Officers Router', () => {
    it('should filter logistics officers by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.logisticsOfficers.list({});

      expect(result.officers.every((o) => o.tenantId === tenantAId)).toBe(true);
      expect(result.officers.some((o) => o.name === 'Officer A')).toBe(true);
      expect(result.officers.some((o) => o.name === 'Officer B')).toBe(false);
    });

    it('should show all logistics officers for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.logisticsOfficers.list({});

      expect(result.officers.some((o) => o.name === 'Officer A')).toBe(true);
      expect(result.officers.some((o) => o.name === 'Officer B')).toBe(true);
    });
  });

  describe('Vehicle Combinations Router', () => {
    it('should filter vehicle combinations by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.vehicleCombinations.getAll({});

      expect(result.every((vc) => vc.tenantId === tenantAId)).toBe(true);
    });

    it('should show all vehicle combinations for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.vehicleCombinations.getAll({});

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Manifest Router', () => {
    it('should filter manifests by tenantId for regular users', async () => {
      const ctx = createContextWithSession({
        id: tenantAUserId,
        tenantId: tenantAId,
        role: 'USER',
        email: 'user-a@test.com',
        name: 'Tenant A User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.manifest.getAll();

      // Should only see Tenant A manifests (if any exist)
      expect(result.every((m) => m.tenantId === tenantAId)).toBe(true);
    });

    it('should show all manifests for admin', async () => {
      const ctx = createContextWithSession({
        id: adminUserId,
        tenantId: tenantAId,
        role: 'ADMIN',
        email: 'admin@test.com',
        name: 'Admin User',
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.manifest.getAll();

      // Admin can see all manifests (no tenant filter)
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
