// FILE: scripts/import/dmoc/parseActiveManifests.ts
// Robust parser for Windows DMOC active manifests export with multi-line narrative support

import { readFileSync } from 'fs';
import { join } from 'path';

export interface ParsedManifest {
  manifestId: number;
  clientName: string;
  transporterName: string;
  officer: string;
  driver: string;
  horse: string;
  tracker: string;
  waConnected: boolean;
  location: string;
  trailer1: string;
  trailer1Type: string;
  trailer1Seal: string;
  trailer1WeightKg: number;
  trailer2: string;
  trailer2Type: string;
  trailer2Seal: string;
  trailer2WeightKg: number;
  route: string;
  rmn: string;
  jobNumber: string;
  convoy: string;
  startedAt: Date | null;
  updatedAt: Date | null;
  endedAt: Date | null;
  sinceLastUpdateMs: number | null;
  tripDurationMs: number | null;
  controller: string;
  statusNote: string;
}

export interface ParseResult {
  manifests: ParsedManifest[];
  errors: string[];
  summary: {
    totalRows: number;
    parsedRows: number;
    errorRows: number;
  };
}

/**
 * Parse duration strings like "00:04:24" or "77.05:21:00" to milliseconds
 */
function parseDurationToMs(durationStr: string): number | null {
  if (!durationStr || durationStr.trim() === '') return null;

  try {
    // Handle format like "77.05:21:00" (days.hours:minutes:seconds)
    if (durationStr.includes('.')) {
      const [daysStr, timeStr] = durationStr.split('.');
      const days = parseInt(daysStr, 10) || 0;
      const timeMs = parseTimeToMs(timeStr);
      return timeMs + days * 24 * 60 * 60 * 1000;
    }

    // Handle format like "00:04:24" (hours:minutes:seconds)
    return parseTimeToMs(durationStr);
  } catch {
    return null;
  }
}

function parseTimeToMs(timeStr: string): number {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);

  if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  } else if (parts.length === 2) {
    // MM:SS
    const [minutes, seconds] = parts;
    return (minutes * 60 + seconds) * 1000;
  }

  return 0;
}

/**
 * Parse flexible date formats from Windows export
 */
function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    // Handle formats like "8/7/2025 8:34 AM", "10/23/2025 10:11 AM"
    const cleaned = dateStr.trim();
    const parsed = new Date(cleaned);

    if (isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Parse boolean values from various formats (Y/N, true/false, etc.)
 */
function parseBoolean(value: string): boolean {
  if (!value) return false;

  const cleaned = value.toLowerCase().trim();
  return (
    cleaned === 'true' ||
    cleaned === 'y' ||
    cleaned === 'yes' ||
    cleaned === '1'
  );
}

/**
 * Clean and normalize string values
 */
function cleanString(value: string): string {
  if (!value) return '';
  return value.trim();
}

/**
 * Extract numeric value from string, handling empty/zero cases
 */
function parseFloatSafe(value: string): number {
  if (!value || value.trim() === '' || value.trim() === '0') return 0;

  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Main parser function - handles multi-line narrative blocks
 */
export function parseActiveManifests(filePath: string): ParseResult {
  const errors: string[] = [];
  const manifests: ParsedManifest[] = [];
  let totalRowsCount = 0;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find header row (first line with many tab-separated fields)
    let headerIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fields = line.split('\t');
      if (fields.length >= 10) {
        headerIndex = i;
        headers = fields.map((h) => h.trim());
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error('Could not find header row with sufficient fields');
    }

    console.log(`Found headers: ${headers.slice(0, 10).join(', ')}...`);

    // Process data rows
    let currentRow: string[] = [];
    let currentNarrative: string[] = [];
    let inNarrative = false;

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a new data row - detect by tab-separated field count matching headers
      // or by starting with a numeric ID
      const trimmed = line.trim();
      const fields = line.split('\t');
      const isDataRow =
        trimmed &&
        (/^\d+/.test(trimmed) || // Starts with numeric ID
          fields.length >= headers.length * 0.8); // Has enough fields to match header structure

      if (isDataRow) {
        // Process previous row if exists
        if (currentRow.length > 0) {
          totalRowsCount++;
          try {
            const manifest = parseManifestRow(
              headers,
              currentRow,
              currentNarrative
            );
            if (manifest) {
              manifests.push(manifest);
            }
          } catch (error) {
            errors.push(
              `Row ${totalRowsCount}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Start new row
        currentRow = fields;
        currentNarrative = [];
        inNarrative = false;
      } else if (trimmed && currentRow.length > 0) {
        // This is part of the narrative/status block
        currentNarrative.push(line);
        inNarrative = true;
      }
    }

    // Process final row
    if (currentRow.length > 0) {
      totalRowsCount++;
      try {
        const manifest = parseManifestRow(
          headers,
          currentRow,
          currentNarrative
        );
        if (manifest) {
          manifests.push(manifest);
        }
      } catch (error) {
        errors.push(
          `Row ${totalRowsCount}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  } catch (error) {
    errors.push(
      `File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Calculate summary - use totalRowsCount if available, otherwise fall back to manifests + errors
  const totalRows =
    totalRowsCount > 0 ? totalRowsCount : manifests.length + errors.length;

  return {
    manifests,
    errors,
    summary: {
      totalRows,
      parsedRows: manifests.length,
      errorRows: errors.length,
    },
  };
}

/**
 * Parse a single manifest row with headers
 */
function parseManifestRow(
  headers: string[],
  row: string[],
  narrative: string[]
): ParsedManifest | null {
  // Create a map of header -> value
  const fieldMap = new Map<string, string>();

  for (let i = 0; i < headers.length && i < row.length; i++) {
    fieldMap.set(headers[i], row[i] || '');
  }

  // Extract fields with fallbacks
  const getField = (fieldName: string): string => fieldMap.get(fieldName) || '';

  const manifestId = parseInt(getField('ID'), 10);
  if (isNaN(manifestId)) {
    throw new Error('Invalid manifest ID');
  }

  // Parse dates
  const startedAt = parseFlexibleDate(getField('Started'));
  const updatedAt = parseFlexibleDate(getField('Updated'));
  const endedAt = parseFlexibleDate(getField('Ended'));

  // Parse durations
  const sinceLastUpdateMs = parseDurationToMs(getField('SinceLastUpdate'));
  const tripDurationMs = parseDurationToMs(getField('TripDuration'));

  // Parse weights
  const trailer1WeightKg = parseFloatSafe(getField('Weight1'));
  const trailer2WeightKg = parseFloatSafe(getField('Weight2'));

  // Combine narrative lines
  const statusNote = narrative.length > 0 ? narrative.join('\n').trim() : '';

  return {
    manifestId,
    clientName: cleanString(getField('Client')),
    transporterName: cleanString(getField('Transporter')),
    officer: cleanString(getField('Officer')),
    driver: cleanString(getField('Driver')),
    horse: cleanString(getField('Horse')),
    tracker: cleanString(getField('Tracker')),
    waConnected: parseBoolean(getField('WAConnected')),
    location: cleanString(getField('Location')),
    trailer1: cleanString(getField('Trailer1')),
    trailer1Type: cleanString(getField('Type1')),
    trailer1Seal: cleanString(getField('Seal1')),
    trailer1WeightKg,
    trailer2: cleanString(getField('Trailer2')),
    trailer2Type: cleanString(getField('Type2')),
    trailer2Seal: cleanString(getField('Seal2')),
    trailer2WeightKg,
    route: cleanString(getField('Route')),
    rmn: cleanString(getField('RMN')),
    jobNumber: cleanString(getField('JobNumber')),
    convoy: cleanString(getField('Convoy')),
    startedAt,
    updatedAt,
    endedAt,
    sinceLastUpdateMs,
    tripDurationMs,
    controller: cleanString(getField('Controller')),
    statusNote,
  };
}

/**
 * CLI usage example
 */
if (require.main === module) {
  const filePath =
    process.argv[2] || join(process.cwd(), 'data', 'active_manifests.txt');

  console.log(`Parsing manifests from: ${filePath}`);

  const result = parseActiveManifests(filePath);

  console.log('\n=== PARSING SUMMARY ===');
  console.log(`Total rows processed: ${result.summary.totalRows}`);
  console.log(`Successfully parsed: ${result.summary.parsedRows}`);
  console.log(`Errors: ${result.summary.errorRows}`);

  if (result.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    result.errors.forEach((error) => console.log(`- ${error}`));
  }

  if (result.manifests.length > 0) {
    console.log('\n=== SAMPLE MANIFEST ===');
    const sample = result.manifests[0];
    console.log(`ID: ${sample.manifestId}`);
    console.log(`Client: ${sample.clientName}`);
    console.log(`Transporter: ${sample.transporterName}`);
    console.log(`Driver: ${sample.driver}`);
    console.log(`Horse: ${sample.horse}`);
    console.log(`Location: ${sample.location}`);
    console.log(`WA Connected: ${sample.waConnected}`);
    console.log(`Status Note Length: ${sample.statusNote.length} chars`);
  }
}
