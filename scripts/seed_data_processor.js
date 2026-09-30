const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Canonical record hashing formula defined in TRD.md
function computeRecordHash(record) {
  const payload = [
    record.noradCatId,
    record.objectId,
    record.epoch,
    record.inclinationDeg.toFixed(4),
    record.semimajorAxisKm.toFixed(3),
    record.eccentricity.toFixed(7),
    record.tleLine1.trim(),
    record.tleLine2.trim()
  ].join('|');
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

// Simple RFC-compliant CSV parser handling quoted strings
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  const results = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length !== headers.length) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c];
    }
    results.push(obj);
  }

  return results;
}

function processSeedData() {
  const projectRoot = path.resolve(__dirname, '..');
  const iridiumPath = path.join(projectRoot, 'iridium_33_july2026.csv');
  const cosmosPath = path.join(projectRoot, 'cosmos_2251_july2026.csv');
  const dataDir = path.join(projectRoot, 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('Reading and parsing Space-Track CSV files...');
  const iridiumRaw = parseCSV(fs.readFileSync(iridiumPath, 'utf8'));
  const cosmosRaw = parseCSV(fs.readFileSync(cosmosPath, 'utf8'));

  console.log(`Parsed ${iridiumRaw.length} raw Iridium rows and ${cosmosRaw.length} raw Cosmos rows.`);

  // Deduplicate by (NORAD_CAT_ID, EPOCH) and isolate duplicates for demo fixtures
  const iridiumUniqueMap = new Map();
  const iridiumDuplicates = [];
  for (const r of iridiumRaw) {
    const key = `${r.NORAD_CAT_ID}_${r.EPOCH}`;
    if (!iridiumUniqueMap.has(key)) {
      iridiumUniqueMap.set(key, r);
    } else {
      iridiumDuplicates.push(r);
    }
  }

  const cosmosUniqueMap = new Map();
  const cosmosDuplicates = [];
  for (const r of cosmosRaw) {
    const key = `${r.NORAD_CAT_ID}_${r.EPOCH}`;
    if (!cosmosUniqueMap.has(key)) {
      cosmosUniqueMap.set(key, r);
    } else {
      cosmosDuplicates.push(r);
    }
  }

  console.log(`Iridium: ${iridiumUniqueMap.size} unique, ${iridiumDuplicates.length} duplicates.`);
  console.log(`Cosmos: ${cosmosUniqueMap.size} unique, ${cosmosDuplicates.length} duplicates.`);

  // Sort chronologically by EPOCH
  const iridiumSorted = Array.from(iridiumUniqueMap.values()).sort((a, b) => a.EPOCH.localeCompare(b.EPOCH));
  const cosmosSorted = Array.from(cosmosUniqueMap.values()).sort((a, b) => a.EPOCH.localeCompare(b.EPOCH));

  // Select 500 records from each to form the 1,000-record deterministic seed
  const selectedIridium = iridiumSorted.slice(0, 500);
  const selectedCosmos = cosmosSorted.slice(0, 500);

  // Normalize into canonical records
  const transform = (row, operator) => {
    const record = {
      recordId: `${operator}-${row.NORAD_CAT_ID}-${row.EPOCH}`,
      noradCatId: parseInt(row.NORAD_CAT_ID, 10),
      objectName: (row.OBJECT_NAME || '').trim(),
      objectId: (row.OBJECT_ID || '').trim(),
      operator: operator,
      epoch: (row.EPOCH || '').trim(),
      inclinationDeg: parseFloat(row.INCLINATION),
      semimajorAxisKm: parseFloat(row.SEMIMAJOR_AXIS),
      eccentricity: parseFloat(row.ECCENTRICITY),
      periodMin: parseFloat(row.PERIOD),
      apoapsisKm: parseFloat(row.APOAPSIS),
      periapsisKm: parseFloat(row.PERIAPSIS),
      tleLine1: (row.TLE_LINE1 || '').trim(),
      tleLine2: (row.TLE_LINE2 || '').trim()
    };
    record.recordHash = computeRecordHash(record);
    return record;
  };

  const recordsIridium = selectedIridium.map(r => transform(r, 'Node-1-Alpha'));
  const recordsCosmos = selectedCosmos.map(r => transform(r, 'Node-2-Beta'));

  // Merge and sort all 1,000 records chronologically
  const allRecords = [...recordsIridium, ...recordsCosmos].sort((a, b) => a.epoch.localeCompare(b.epoch));

  // Group into 25 blocks of 40 records each
  const blockSize = 40;
  const blocks = [];
  for (let i = 0; i < allRecords.length; i += blockSize) {
    const blockIndex = Math.floor(i / blockSize) + 1;
    blocks.push({
      blockIndex,
      recordCount: blockSize,
      startEpoch: allRecords[i].epoch,
      endEpoch: allRecords[i + blockSize - 1].epoch,
      records: allRecords.slice(i, i + blockSize)
    });
  }

  const seedPayload = {
    generatedAt: '2026-07-01T00:00:00.000Z',
    totalRecords: allRecords.length,
    totalBlocks: blocks.length,
    recordsPerBlock: blockSize,
    epochRange: {
      start: allRecords[0].epoch,
      end: allRecords[allRecords.length - 1].epoch
    },
    uniqueObjects: {
      iridium: new Set(recordsIridium.map(r => r.noradCatId)).size,
      cosmos: new Set(recordsCosmos.map(r => r.noradCatId)).size,
      total: new Set(allRecords.map(r => r.noradCatId)).size
    },
    blocks
  };

  const seedRecordsPath = path.join(dataDir, 'seed_records.json');
  fs.writeFileSync(seedRecordsPath, JSON.stringify(seedPayload, null, 2), 'utf8');

  // Prepare duplicates demo fixture (10 Iridium duplicates, 10 Cosmos duplicates)
  const demoDuplicates = [
    ...iridiumDuplicates.slice(0, 10).map(r => transform(r, 'Node-1-Alpha')),
    ...cosmosDuplicates.slice(0, 10).map(r => transform(r, 'Node-2-Beta'))
  ];

  const duplicatesFixturePath = path.join(dataDir, 'duplicates_demo.json');
  fs.writeFileSync(duplicatesFixturePath, JSON.stringify(demoDuplicates, null, 2), 'utf8');

  // Calculate file checksums for determinism validation
  const seedHash = crypto.createHash('sha256').update(fs.readFileSync(seedRecordsPath)).digest('hex');
  const dupHash = crypto.createHash('sha256').update(fs.readFileSync(duplicatesFixturePath)).digest('hex');

  console.log('Seed processing complete:');
  console.log(`- Seed records file: ${seedRecordsPath} (SHA-256: ${seedHash})`);
  console.log(`- Duplicates fixture: ${duplicatesFixturePath} (SHA-256: ${dupHash})`);
  console.log(`- Blocks: ${blocks.length}, Records per block: ${blockSize}, Total: ${allRecords.length}`);
  console.log(`- Epoch span: ${seedPayload.epochRange.start} to ${seedPayload.epochRange.end}`);
  console.log(`- Unique objects: ${seedPayload.uniqueObjects.total} (${seedPayload.uniqueObjects.iridium} Iridium, ${seedPayload.uniqueObjects.cosmos} Cosmos)`);
}

if (require.main === module) {
  processSeedData();
}

module.exports = { processSeedData, computeRecordHash };
