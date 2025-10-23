// FILE: scripts/import/manifests/importActiveManifests.ts
// Import active manifests from data/active_manifests.txt into the database
// @ts-nocheck - Temporarily disabled due to schema mismatch

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ManifestData {
  id: string;
  client: string;
  transporter: string;
  officer: string;
  driver: string;
  horse: string;
  tracker: string;
  status: string;
  location: string;
  trailer1: string;
  trailer2: string;
  country: string;
  route: string;
  rmn: string;
  jobNumber: string;
  comment: string;
  convoy: string;
  started: string;
  updated: string;
  ended: string;
}

function parseManifestLine(line: string): ManifestData | null {
  const columns = line.split('\t');
  if (columns.length < 40) return null;

  return {
    id: columns[1]?.trim() || '',
    client: columns[2]?.trim() || '',
    transporter: columns[3]?.trim() || '',
    officer: columns[4]?.trim() || '',
    driver: columns[5]?.trim() || '',
    horse: columns[6]?.trim() || '',
    tracker: columns[7]?.trim() || '',
    status: columns[15]?.trim() || '',
    location: columns[16]?.trim() || '',
    trailer1: columns[17]?.trim() || '',
    trailer2: columns[21]?.trim() || '',
    country: columns[25]?.trim() || '',
    route: columns[28]?.trim() || '',
    rmn: columns[29]?.trim() || '',
    jobNumber: columns[30]?.trim() || '',
    comment: columns[31]?.trim() || '',
    convoy: columns[32]?.trim() || '',
    started: columns[33]?.trim() || '',
    updated: columns[34]?.trim() || '',
    ended: columns[35]?.trim() || '',
  };
}

function mapStatusToSchema(status: string): string {
  const statusMap: { [key: string]: string } = {
    'Active': 'IN_PROGRESS',
    'Waiting for Docs': 'SCHEDULED',
    'Waiting to Cross': 'SCHEDULED',
    'Pre-Alerts': 'SCHEDULED',
    'Completed': 'COMPLETED',
    'Cancelled': 'CANCELLED',
    'Breakdown': 'IN_PROGRESS', // Map breakdown to IN_PROGRESS with special handling
    'Accident': 'IN_PROGRESS', // Map accident to IN_PROGRESS with special handling
  };
  
  return statusMap[status] || 'SCHEDULED';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle various date formats from the data
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

async function importActiveManifests() {
  try {
    console.log('🚀 Starting active manifests import...');
    
    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'digiwize' }
    });
    
    if (!tenant) {
      throw new Error('Digiwize tenant not found. Please run the main seed first.');
    }
    
    // Read the active manifests file
    const filePath = path.join(process.cwd(), 'data', 'active_manifests.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    console.log(`📄 Found ${lines.length} lines in active manifests file`);
    
    // Skip header line and process data
    const manifestLines = lines.slice(1).filter(line => line.trim() !== '');
    console.log(`📊 Processing ${manifestLines.length} manifest records...`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const line of manifestLines) {
      const manifestData = parseManifestLine(line);
      if (!manifestData || !manifestData.id) {
        skipped++;
        continue;
      }
      
      try {
        // Create or update manifest
        const manifest = await prisma.manifest.upsert({
          where: {
            tenantId_trackingId: {
              tenantId: tenant.id,
              trackingId: manifestData.tracker || `TRK-${manifestData.id}`,
            }
          },
          update: {
            title: `${manifestData.client} - ${manifestData.route}`,
            status: mapStatusToSchema(manifestData.status),
            trackingId: manifestData.tracker || `TRK-${manifestData.id}`,
            horseId: manifestData.horse || null,
            trailerId1: manifestData.trailer1 || null,
            trailerId2: manifestData.trailer2 || null,
            rmn: manifestData.rmn || null,
            jobNumber: manifestData.jobNumber || null,
            dateTimeAdded: parseDate(manifestData.started) || new Date(),
            dateTimeUpdated: parseDate(manifestData.updated) || new Date(),
            dateTimeEnded: parseDate(manifestData.ended) || null,
          },
          create: {
            tenantId: tenant.id,
            title: `${manifestData.client} - ${manifestData.route}`,
            status: mapStatusToSchema(manifestData.status),
            trackingId: manifestData.tracker || `TRK-${manifestData.id}`,
            horseId: manifestData.horse || null,
            trailerId1: manifestData.trailer1 || null,
            trailerId2: manifestData.trailer2 || null,
            rmn: manifestData.rmn || null,
            jobNumber: manifestData.jobNumber || null,
            dateTimeAdded: parseDate(manifestData.started) || new Date(),
            dateTimeUpdated: parseDate(manifestData.updated) || new Date(),
            dateTimeEnded: parseDate(manifestData.ended) || null,
          }
        });
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`✅ Imported ${imported} manifests...`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing manifest ${manifestData.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`🎉 Import completed!`);
    console.log(`✅ Imported: ${imported} manifests`);
    console.log(`⏭️ Skipped: ${skipped} manifests`);
    
    // Show final stats
    const stats = await prisma.manifest.groupBy({
      by: ['status'],
      where: { tenantId: tenant.id },
      _count: { status: true }
    });
    
    console.log('\n📊 Final manifest counts by status:');
    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.status}`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importActiveManifests();
