// scripts/check-manifests-detailed.ts
// Check manifests in both local and remote databases
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function checkManifestsDetailed() {
  // Check local SQLite database
  console.log('🔍 Checking LOCAL database (SQLite)...\n');
  const localPrisma = new PrismaClient({
    datasources: {
      db: { url: 'file:./prisma/dev.db' }
    }
  });

  try {
    const localManifests = await localPrisma.manifest.findMany({
      take: 10,
      orderBy: { dateTimeAdded: 'desc' },
      select: {
        id: true,
        title: true,
        trackingId: true,
        rmn: true,
        status: true,
        clientId: true,
        companyId: true,
        countryId: true,
        tenantId: true,
        tenant: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    console.log(`📊 Local database: ${await localPrisma.manifest.count()} total manifests`);
    console.log(`📋 Sample manifests from local:\n`);
    localManifests.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title || 'No title'}`);
      console.log(`      Tracking ID: ${m.trackingId || 'NULL'}`);
      console.log(`      RMN: ${m.rmn || 'NULL'}`);
      console.log(`      Client ID: ${m.clientId || 'NULL'}`);
      console.log(`      Company ID: ${m.companyId || 'NULL'}`);
      console.log(`      Country ID: ${m.countryId || 'NULL'}`);
      console.log(`      Tenant: ${m.tenant.name} (${m.tenant.slug})`);
      console.log();
    });
  } catch (error) {
    console.error('❌ Error checking local database:', error);
  } finally {
    await localPrisma.$disconnect();
  }

  // Check remote/production database
  console.log('\n🔍 Checking REMOTE database (PostgreSQL)...\n');
  const remotePrisma = new PrismaClient();

  try {
    const remoteManifests = await remotePrisma.manifest.findMany({
      take: 10,
      orderBy: { dateTimeAdded: 'desc' },
      select: {
        id: true,
        title: true,
        trackingId: true,
        rmn: true,
        status: true,
        clientId: true,
        companyId: true,
        countryId: true,
        tenantId: true,
        tenant: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    console.log(`📊 Remote database: ${await remotePrisma.manifest.count()} total manifests`);
    console.log(`📋 Sample manifests from remote:\n`);
    remoteManifests.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title || 'No title'}`);
      console.log(`      Tracking ID: ${m.trackingId || 'NULL'}`);
      console.log(`      RMN: ${m.rmn || 'NULL'}`);
      console.log(`      Client ID: ${m.clientId || 'NULL'}`);
      console.log(`      Company ID: ${m.companyId || 'NULL'}`);
      console.log(`      Country ID: ${m.countryId || 'NULL'}`);
      console.log(`      Tenant: ${m.tenant.name} (${m.tenant.slug})`);
      console.log();
    });

    // Check for NULL values
    const nullClientId = await remotePrisma.manifest.count({
      where: { clientId: null }
    });
    const nullCompanyId = await remotePrisma.manifest.count({
      where: { companyId: null }
    });
    const nullCountryId = await remotePrisma.manifest.count({
      where: { countryId: null }
    });

    console.log(`\n📊 NULL value counts in remote database:`);
    console.log(`   Client ID NULL: ${nullClientId}`);
    console.log(`   Company ID NULL: ${nullCompanyId}`);
    console.log(`   Country ID NULL: ${nullCountryId}`);
  } catch (error) {
    console.error('❌ Error checking remote database:', error);
  } finally {
    await remotePrisma.$disconnect();
  }

  // Check active_manifests.txt file
  console.log('\n🔍 Checking active_manifests.txt file...\n');
  const txtPath = path.join(process.cwd(), 'data', 'active_manifests.txt');
  if (fs.existsSync(txtPath)) {
    const content = fs.readFileSync(txtPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    console.log(`📄 File has ${lines.length} lines`);
    
    // Show first few lines
    console.log(`\n📋 First 5 lines of file:\n`);
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line.substring(0, 100)}...`);
    });
  } else {
    console.log('❌ File not found: data/active_manifests.txt');
  }
}

checkManifestsDetailed();

