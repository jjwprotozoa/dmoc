// FILE: tests/parseActiveManifests.test.ts
// Test suite for the Windows DMOC active manifests parser

import { describe, expect, it } from 'vitest';
import { parseActiveManifests } from '../scripts/import/dmoc/parseActiveManifests';

describe('parseActiveManifests', () => {
  it('should parse a simple manifest row correctly', () => {
    const testData = `ID	Client	Transporter	Officer	Driver	Horse	Tracker	WAConnected	Location	Route	Convoy	Started	Updated	Ended	SinceLastUpdate	TripDuration	Controller
54125	RELOAD CNMC/IXMTRACKING	SWIFT	TANZANIA TEAM	TBA(TBA)	T944DLJ(TZ)	J1043189	False	TUNDUMA	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/7/2025 8:34 AM	10/23/2025 9:31 AM		00:04:24	77.05:21:00	MUSA NJERENJE`;

    // Write test data to temporary file
    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'test-manifests.txt');
    fs.writeFileSync(testFile, testData);

    try {
      const result = parseActiveManifests(testFile);

      expect(result.summary.totalRows).toBe(1);
      expect(result.summary.parsedRows).toBe(1);
      expect(result.summary.errorRows).toBe(0);
      expect(result.errors).toHaveLength(0);

      const manifest = result.manifests[0];
      expect(manifest.manifestId).toBe(54125);
      expect(manifest.clientName).toBe('RELOAD CNMC/IXMTRACKING');
      expect(manifest.transporterName).toBe('SWIFT');
      expect(manifest.officer).toBe('TANZANIA TEAM');
      expect(manifest.driver).toBe('TBA(TBA)');
      expect(manifest.horse).toBe('T944DLJ(TZ)');
      expect(manifest.tracker).toBe('J1043189');
      expect(manifest.waConnected).toBe(false);
      expect(manifest.location).toBe('TUNDUMA');
      expect(manifest.route).toBe('KASUMBALESA TO DAR ES SALAAM');
      expect(manifest.convoy).toBe('UNALLOCATED');
      expect(manifest.controller).toBe('MUSA NJERENJE');

      // Check date parsing
      expect(manifest.startedAt).toBeInstanceOf(Date);
      expect(manifest.updatedAt).toBeInstanceOf(Date);
      expect(manifest.endedAt).toBeNull();

      // Check duration parsing
      expect(manifest.sinceLastUpdateMs).toBe(264000); // 4:24 in milliseconds
      // 77.05:21:00 = 77 days + 5 hours + 21 minutes = 6,672,060,000 ms
      expect(manifest.tripDurationMs).toBe(6672060000); // 77.05:21:00 in milliseconds
    } finally {
      // Clean up test file
      fs.unlinkSync(testFile);
    }
  });

  it('should handle multi-line narrative blocks correctly', () => {
    const testData = `ID	Client	Transporter	Officer	Driver	Horse	Tracker	WAConnected	Location	Route	Convoy	Started	Updated	Ended	SinceLastUpdate	TripDuration	Controller
54125	RELOAD CNMC/IXMTRACKING	SWIFT	TANZANIA TEAM	TBA(TBA)	T944DLJ(TZ)	J1043189	False	TUNDUMA	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/7/2025 8:34 AM	10/23/2025 9:31 AM		00:04:24	77.05:21:00	MUSA NJERENJE

The following trucks below are in.

Location: Tunduma (TZ)  
Status: Waiting for Docs 
 
Client: Reload 
Route: Kasumbalesa to Dar es salaam via Nakonde.
Convoy: Is not intact

SWIFT TRUCKS
T 944 DLJ - Old horse
T 187 DTQ - New horse
T 660 DLR 
T 736 DLC

Situation: Normal`;

    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'test-manifests-multiline.txt');
    fs.writeFileSync(testFile, testData);

    try {
      const result = parseActiveManifests(testFile);

      expect(result.summary.totalRows).toBe(1);
      expect(result.summary.parsedRows).toBe(1);
      expect(result.summary.errorRows).toBe(0);

      const manifest = result.manifests[0];
      expect(manifest.statusNote).toContain(
        'The following trucks below are in.'
      );
      expect(manifest.statusNote).toContain('Location: Tunduma (TZ)');
      expect(manifest.statusNote).toContain('Status: Waiting for Docs');
      expect(manifest.statusNote).toContain('SWIFT TRUCKS');
      expect(manifest.statusNote).toContain('T 944 DLJ - Old horse');
      expect(manifest.statusNote).toContain('Situation: Normal');
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  it('should handle multiple manifest rows', () => {
    const testData = `ID	Client	Transporter	Officer	Driver	Horse	Tracker	WAConnected	Location	Route	Convoy	Started	Updated	Ended	SinceLastUpdate	TripDuration	Controller
54125	RELOAD CNMC/IXMTRACKING	SWIFT	TANZANIA TEAM	TBA(TBA)	T944DLJ(TZ)	J1043189	False	TUNDUMA	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/7/2025 8:34 AM	10/23/2025 9:31 AM		00:04:24	77.05:21:00	MUSA NJERENJE
54474	RELOAD CNMC/IXMTRACKING	ULTRA HAULAGE	TBA	TBA(TBA)	T369DVF(TZ)	TBA	False	CONGO (DRC)	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/12/2025 9:38 AM	8/14/2025 10:14 AM		70.03:41:00	72.04:17:00	BWALYA ELIAS`;

    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'test-manifests-multiple.txt');
    fs.writeFileSync(testFile, testData);

    try {
      const result = parseActiveManifests(testFile);

      expect(result.summary.totalRows).toBe(2);
      expect(result.summary.parsedRows).toBe(2);
      expect(result.summary.errorRows).toBe(0);

      expect(result.manifests).toHaveLength(2);
      expect(result.manifests[0].manifestId).toBe(54125);
      expect(result.manifests[1].manifestId).toBe(54474);
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  it('should handle boolean parsing correctly', () => {
    const testData = `ID	Client	Transporter	Officer	Driver	Horse	Tracker	WAConnected	Location	Route	Convoy	Started	Updated	Ended	SinceLastUpdate	TripDuration	Controller
54125	RELOAD CNMC/IXMTRACKING	SWIFT	TANZANIA TEAM	TBA(TBA)	T944DLJ(TZ)	J1043189	True	TUNDUMA	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/7/2025 8:34 AM	10/23/2025 9:31 AM		00:04:24	77.05:21:00	MUSA NJERENJE`;

    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'test-manifests-boolean.txt');
    fs.writeFileSync(testFile, testData);

    try {
      const result = parseActiveManifests(testFile);

      expect(result.summary.totalRows).toBe(1);
      expect(result.summary.parsedRows).toBe(1);

      const manifest = result.manifests[0];
      expect(manifest.waConnected).toBe(true);
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  it('should handle empty and invalid data gracefully', () => {
    const testData = `ID	Client	Transporter	Officer	Driver	Horse	Tracker	WAConnected	Location	Route	Convoy	Started	Updated	Ended	SinceLastUpdate	TripDuration	Controller
	RELOAD CNMC/IXMTRACKING	SWIFT	TANZANIA TEAM	TBA(TBA)	T944DLJ(TZ)	J1043189	False	TUNDUMA	KASUMBALESA TO DAR ES SALAAM	UNALLOCATED	8/7/2025 8:34 AM	10/23/2025 9:31 AM		00:04:24	77.05:21:00	MUSA NJERENJE`;

    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'test-manifests-invalid.txt');
    fs.writeFileSync(testFile, testData);

    try {
      const result = parseActiveManifests(testFile);

      expect(result.summary.totalRows).toBe(1);
      expect(result.summary.parsedRows).toBe(0);
      expect(result.summary.errorRows).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid manifest ID');
    } finally {
      fs.unlinkSync(testFile);
    }
  });
});
