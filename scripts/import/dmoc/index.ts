// FILE: scripts/import/dmoc/index.ts
// CLI script for importing Windows DMOC active manifests export

import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { parseActiveManifests, ParsedManifest } from './parseActiveManifests';

const prisma = new PrismaClient();

interface ImportOptions {
  file: string;
  tenant: string;
  batchSize: number;
  dryRun: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    file: join(process.cwd(), 'data', 'active_manifests.txt'),
    tenant: 'Digiwize',
    batchSize: 100,
    dryRun: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--tenant=')) {
      options.tenant = arg.split('=')[1];
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10) || 100;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx scripts/import/dmoc/index.ts [options]

Options:
  --file=<path>        Path to active_manifests.txt (default: ./data/active_manifests.txt)
  --tenant=<id>         Tenant ID for import (default: default)
  --batch-size=<n>      Batch size for upserts (default: 100)
  --dry-run            Parse and validate without importing
  --help, -h           Show this help message

Examples:
  tsx scripts/import/dmoc/index.ts
  tsx scripts/import/dmoc/index.ts --file=./data/active_manifests.txt --tenant=delta
  tsx scripts/import/dmoc/index.ts --dry-run --batch-size=50
      `);
      process.exit(0);
    }
  }
  
  return options;
}

/**
 * Upsert manifests in batches with tenant isolation
 */
async function upsertManifests(
  manifests: ParsedManifest[],
  tenantName: string,
  batchSize: number,
  dryRun: boolean
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];
  
  console.log(`\n=== UPSERTING MANIFESTS ===`);
  console.log(`Tenant: ${tenantName}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Dry run: ${dryRun}`);
  
  // Find tenant by name
  const tenant = await prisma.tenant.findFirst({
    where: { name: tenantName },
    select: { id: true }
  });
  
  if (!tenant) {
    throw new Error(`Tenant '${tenantName}' not found`);
  }
  
  const tenantId = tenant.id;
  
  // Process in batches
  for (let i = 0; i < manifests.length; i += batchSize) {
    const batch = manifests.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(manifests.length / batchSize)} (${batch.length} manifests)`);
    
    if (dryRun) {
      console.log(`[DRY RUN] Would upsert ${batch.length} manifests`);
      inserted += batch.length;
      continue;
    }
    
    try {
      const batchResults = await prisma.$transaction(
        batch.map(manifest => 
          prisma.manifest.upsert({
            where: {
              manifestId: manifest.manifestId,
            },
            update: {
              clientName: manifest.clientName,
              transporterName: manifest.transporterName,
              officer: manifest.officer,
              driver: manifest.driver,
              horse: manifest.horse,
              tracker: manifest.tracker,
              waConnected: manifest.waConnected,
              location: manifest.location,
              trailer1: manifest.trailer1,
              trailer1Type: manifest.trailer1Type,
              trailer1Seal: manifest.trailer1Seal,
              trailer1WeightKg: manifest.trailer1WeightKg,
              trailer2: manifest.trailer2,
              trailer2Type: manifest.trailer2Type,
              trailer2Seal: manifest.trailer2Seal,
              trailer2WeightKg: manifest.trailer2WeightKg,
              route: manifest.route,
              rmn: manifest.rmn,
              jobNumber: manifest.jobNumber,
              convoy: manifest.convoy,
              startedAt: manifest.startedAt,
              updatedAt: manifest.updatedAt,
              endedAt: manifest.endedAt,
              sinceLastUpdateMs: manifest.sinceLastUpdateMs,
              tripDurationMs: manifest.tripDurationMs,
              controller: manifest.controller,
              statusNote: manifest.statusNote,
              dateTimeUpdated: new Date(),
            },
            create: {
              tenantId,
              manifestId: manifest.manifestId,
              title: `${manifest.clientName} - ${manifest.rmn || manifest.jobNumber}`,
              status: manifest.endedAt ? 'COMPLETED' : 'IN_PROGRESS',
              clientName: manifest.clientName,
              transporterName: manifest.transporterName,
              officer: manifest.officer,
              driver: manifest.driver,
              horse: manifest.horse,
              tracker: manifest.tracker,
              waConnected: manifest.waConnected,
              location: manifest.location,
              trailer1: manifest.trailer1,
              trailer1Type: manifest.trailer1Type,
              trailer1Seal: manifest.trailer1Seal,
              trailer1WeightKg: manifest.trailer1WeightKg,
              trailer2: manifest.trailer2,
              trailer2Type: manifest.trailer2Type,
              trailer2Seal: manifest.trailer2Seal,
              trailer2WeightKg: manifest.trailer2WeightKg,
              route: manifest.route,
              rmn: manifest.rmn,
              jobNumber: manifest.jobNumber,
              convoy: manifest.convoy,
              startedAt: manifest.startedAt,
              updatedAt: manifest.updatedAt,
              endedAt: manifest.endedAt,
              sinceLastUpdateMs: manifest.sinceLastUpdateMs,
              tripDurationMs: manifest.tripDurationMs,
              controller: manifest.controller,
              statusNote: manifest.statusNote,
              scheduledAt: manifest.startedAt || new Date(),
              dateTimeAdded: manifest.startedAt || new Date(),
              dateTimeUpdated: manifest.updatedAt || new Date(),
              dateTimeEnded: manifest.endedAt,
            },
          })
        ),
        { isolationLevel: 'Serializable' }
      );
      
      // Count results (upsert always returns the record, so we need to check if it was created or updated)
      // For simplicity, we'll assume all are updates for now
      updated += batchResults.length;
      
      console.log(`✓ Batch completed: ${batchResults.length} manifests processed`);
      
    } catch (error) {
      const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`✗ ${errorMsg}`);
    }
  }
  
  return { inserted, updated, errors };
}

/**
 * Main import function
 */
async function main() {
  const options = parseArgs();
  
  console.log('=== DMOC ACTIVE MANIFESTS IMPORT ===');
  console.log(`File: ${options.file}`);
  console.log(`Tenant: ${options.tenant}`);
  console.log(`Batch size: ${options.batchSize}`);
  console.log(`Dry run: ${options.dryRun}`);
  
  try {
    // Parse the file
    console.log('\n=== PARSING FILE ===');
    const parseResult = parseActiveManifests(options.file);
    
    console.log(`Total rows: ${parseResult.summary.totalRows}`);
    console.log(`Parsed successfully: ${parseResult.summary.parsedRows}`);
    console.log(`Parse errors: ${parseResult.summary.errorRows}`);
    
    if (parseResult.errors.length > 0) {
      console.log('\n=== PARSE ERRORS ===');
      parseResult.errors.slice(0, 10).forEach(error => console.log(`- ${error}`));
      if (parseResult.errors.length > 10) {
        console.log(`... and ${parseResult.errors.length - 10} more errors`);
      }
    }
    
    if (parseResult.manifests.length === 0) {
      console.log('\nNo manifests to import. Exiting.');
      return;
    }
    
    // Show sample manifest
    if (parseResult.manifests.length > 0) {
      console.log('\n=== SAMPLE MANIFEST ===');
      const sample = parseResult.manifests[0];
      console.log(`ID: ${sample.manifestId}`);
      console.log(`Client: ${sample.clientName}`);
      console.log(`Transporter: ${sample.transporterName}`);
      console.log(`Driver: ${sample.driver}`);
      console.log(`Horse: ${sample.horse}`);
      console.log(`Location: ${sample.location}`);
      console.log(`WA Connected: ${sample.waConnected}`);
      console.log(`Status Note: ${sample.statusNote.substring(0, 100)}${sample.statusNote.length > 100 ? '...' : ''}`);
    }
    
    // Upsert to database
    const upsertResult = await upsertManifests(
      parseResult.manifests,
      options.tenant,
      options.batchSize,
      options.dryRun
    );
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Inserted: ${upsertResult.inserted}`);
    console.log(`Updated: ${upsertResult.updated}`);
    console.log(`Upsert errors: ${upsertResult.errors.length}`);
    
    if (upsertResult.errors.length > 0) {
      console.log('\n=== UPSERT ERRORS ===');
      upsertResult.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log('\n✓ Import completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Import failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as importActiveManifests };
