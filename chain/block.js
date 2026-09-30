const crypto = require('crypto');
const { MerkleTree } = require('./merkle');

/**
 * Computes canonical SHA-256 hash of an orbital record
 * @param {object} record
 * @returns {string} 64-char hexadecimal hash
 */
function computeRecordHash(record) {
  // If sentinel genesis record
  if (record.noradCatId === 0) {
    return crypto.createHash('sha256').update('GENESIS-CONSORTIUM-CHARTER-ORBIT-LEDGER-2026', 'utf8').digest('hex');
  }

  const payload = [
    record.noradCatId,
    record.objectId,
    record.epoch,
    Number(record.inclinationDeg).toFixed(4),
    Number(record.semimajorAxisKm).toFixed(3),
    Number(record.eccentricity).toFixed(7),
    (record.tleLine1 || '').trim(),
    (record.tleLine2 || '').trim()
  ].join('|');

  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Computes the canonical SHA-256 hash of a block header.
 * @param {object} header Block header fields
 * @returns {string} 64-char hexadecimal hash
 */
function computeHeaderHash(header) {
  const payload = [
    header.index,
    header.previousHash,
    header.timestamp,
    header.merkleRoot,
    header.consensus,
    header.proposer,
    header.difficulty,
    header.nonce
  ].join(':');

  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Creates a block instance with computed Merkle root and block header hash.
 * @param {object} params
 * @param {number} params.index Block height index
 * @param {string} params.previousHash SHA-256 hash of parent block
 * @param {number} params.timestamp UTC timestamp in seconds
 * @param {Array} params.records Array of orbital records
 * @param {string} [params.consensus='PBFT'] Consensus mechanism
 * @param {string} [params.proposer='Node-1-Alpha'] Designated operator proposer
 * @param {number} [params.difficulty=0] Mining difficulty (leading hex zeros)
 * @param {number} [params.nonce=0] Mining nonce
 * @returns {object} Formatted block object
 */
function createBlock({
  index,
  previousHash,
  timestamp,
  records,
  consensus = 'PBFT',
  proposer = 'Node-1-Alpha',
  difficulty = 0,
  nonce = 0
}) {
  if (!records || records.length === 0) {
    throw new Error('Block must contain at least one record');
  }

  // Derive leaf hashes from record.recordHash
  const leafHashes = records.map(r => r.recordHash);
  const merkleTree = new MerkleTree(leafHashes);
  const merkleRoot = merkleTree.getRoot(false);

  const header = {
    index,
    previousHash,
    timestamp,
    merkleRoot,
    consensus,
    proposer,
    difficulty,
    nonce
  };

  header.blockHash = computeHeaderHash(header);

  return {
    header,
    records
  };
}

/**
 * Creates the deterministic Genesis block (Block 0)
 * @returns {object}
 */
function createGenesisBlock() {
  const genesisSentinel = {
    recordId: 'GENESIS-CONSORTIUM-CHARTER',
    noradCatId: 0,
    objectName: 'CONSORTIUM ROOT SENTINEL',
    objectId: '2026-CHARTER-001',
    operator: 'CONSORTIUM_ROOT',
    epoch: '2026-07-01T00:00:00.000Z',
    inclinationDeg: 0.0,
    semimajorAxisKm: 0.0,
    eccentricity: 0.0,
    periodMin: 0.0,
    apoapsisKm: 0.0,
    periapsisKm: 0.0,
    tleLine1: '1 00000U 26001A   26182.00000000  .00000000  00000-0  00000-0 0  0000',
    tleLine2: '2 00000   0.0000   0.0000 0000000   0.0000   0.0000  0.00000000000000',
    recordHash: crypto.createHash('sha256').update('GENESIS-CONSORTIUM-CHARTER-ORBIT-LEDGER-2026', 'utf8').digest('hex')
  };

  return createBlock({
    index: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: 1782777600, // 2026-07-01T00:00:00.000Z
    records: [genesisSentinel],
    consensus: 'GENESIS',
    proposer: 'CONSORTIUM_ROOT',
    difficulty: 0,
    nonce: 0
  });
}

module.exports = {
  computeRecordHash,
  computeHeaderHash,
  createBlock,
  createGenesisBlock
};
