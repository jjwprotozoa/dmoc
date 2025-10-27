// FILE: tests/manifest.router.test.ts
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

describe('Manifest Router', () => {
  let testTenantId: string;
  let testManifestId: string;

  beforeAll(async () => {
    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        slug: 'test-tenant',
        settings: '{}',
      },
    });
    testTenantId = tenant.id;

    // Create test invoice state
    const invoiceState = await prisma.invoiceState.create({
      data: {
        name: 'Test State',
        code: 'TEST',
      },
    });

    // Create test manifest
    const manifest = await prisma.manifest.create({
      data: {
        tenantId: testTenantId,
        trackingId: 'TEST-TRK-001',
        invoiceStateId: invoiceState.id,
        rmn: 'TEST-RMN-001',
        jobNumber: 'TEST-JOB-001',
      },
    });
    testManifestId = manifest.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.manifestAudit.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.manifestLocation.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.whatsappFile.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.whatsappMedia.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.whatsappLocation.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.whatsappData.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.manifest.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.invoiceState.deleteMany({
      where: { code: 'TEST' },
    });
    await prisma.tenant.delete({
      where: { id: testTenantId },
    });
    await prisma.$disconnect();
  });

  it('should list manifests', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.list({ take: 10 });
    
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    
    const manifest = result.items.find(m => m.id === testManifestId);
    expect(manifest).toBeDefined();
    expect(manifest?.trackingId).toBe('TEST-TRK-001');
  });

  it('should get manifest by id', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.getById({ id: testManifestId });
    
    expect(result).toBeDefined();
    expect(result.id).toBe(testManifestId);
    expect(result.trackingId).toBe('TEST-TRK-001');
    expect(result.invoiceState).toBeDefined();
    expect(result.invoiceState?.name).toBe('Test State');
  });

  it('should create a new manifest', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.create({
      trackingId: 'TEST-TRK-002',
      rmn: 'TEST-RMN-002',
      jobNumber: 'TEST-JOB-002',
    });
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    
    // Verify the manifest was created
    const created = await prisma.manifest.findUnique({
      where: { id: result.id },
    });
    expect(created).toBeDefined();
    expect(created?.trackingId).toBe('TEST-TRK-002');
    
    // Clean up
    await prisma.manifest.delete({
      where: { id: result.id },
    });
  });

  it('should add location to manifest', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.addLocation({
      manifestId: testManifestId,
      latitude: -33.9249,
      longitude: 18.4241,
    });
    
    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    
    // Verify the location was added
    const locations = await prisma.manifestLocation.findMany({
      where: { manifestId: testManifestId },
    });
    expect(locations.length).toBeGreaterThan(0);
    
    const location = locations[0];
    expect(location.latitude.toString()).toBe('-33.9249');
    expect(location.longitude.toString()).toBe('18.4241');
  });

  it('should get timeline for manifest', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.timeline({ manifestId: testManifestId });
    
    expect(result).toBeDefined();
    expect(result.locations).toBeDefined();
    expect(Array.isArray(result.locations)).toBe(true);
    expect(result.whatsapp).toBeDefined();
    expect(Array.isArray(result.whatsapp)).toBe(true);
  });

  it('should get audit trail for manifest', async () => {
    const ctx = await createTRPCContext();
    ctx.session = { 
      user: { 
        tenantId: testTenantId, 
        id: 'test-user', 
        name: 'Test User' 
      } 
    } as any;
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manifest.audit({ manifestId: testManifestId });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // Should have at least one audit entry (from creation)
    expect(result.length).toBeGreaterThan(0);
    
    const auditEntry = result[0];
    expect(auditEntry.action).toBeDefined();
    expect(auditEntry.manifestId).toBe(testManifestId);
  });
});
