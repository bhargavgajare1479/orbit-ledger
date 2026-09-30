const fs = require('fs');
const path = require('path');
const { computeRecordHash, computeHeaderHash, createBlock, createGenesisBlock } = require('./block');
const { MerkleTree } = require('./merkle');

class Blockchain {
  constructor() {
    this.blocks = [];
    this.seenRecords = new Set();
    this.initialize();
  }

  /**
   * Initializes the chain with the deterministic genesis block
   */
  initialize() {
    this.blocks = [createGenesisBlock()];
    this.seenRecords.clear();
    const genesisRecord = this.blocks[0].records[0];
    this.seenRecords.add(`${genesisRecord.noradCatId}_${genesisRecord.epoch}`);
  }

  /**
   * Returns current block height (latest block index)
   * @returns {number}
   */
  getHeight() {
    return this.blocks[this.blocks.length - 1].header.index;
  }

  /**
   * Returns the latest block
   * @returns {object}
   */
  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Returns block by index
   * @param {number} index
   * @returns {object|null}
   */
  getBlock(index) {
    if (index < 0 || index >= this.blocks.length) return null;
    return this.blocks[index];
  }

  /**
   * Checks if an orbital record already exists in the chain
   * @param {number} noradCatId
   * @param {string} epoch
   * @returns {boolean}
   */
  hasRecord(noradCatId, epoch) {
    return this.seenRecords.has(`${noradCatId}_${epoch}`);
  }

  /**
   * Appends a new block of records to the chain
   * @param {Array} records Array of orbital records
   * @param {object} [options]
   * @returns {object} The appended block
   */
  addBlock(records, options = {}) {
    if (!records || records.length === 0) {
      throw new Error('Cannot add empty block');
    }

    // Duplicate detection
    for (const record of records) {
      const key = `${record.noradCatId}_${record.epoch}`;
      if (this.seenRecords.has(key)) {
        throw new Error(`DuplicateRecordError: Record for object ${record.noradCatId} at epoch ${record.epoch} already exists in chain`);
      }
    }

    const latestBlock = this.getLatestBlock();
    const nextIndex = latestBlock.header.index + 1;
    const previousHash = latestBlock.header.blockHash;

    const block = createBlock({
      index: nextIndex,
      previousHash,
      timestamp: options.timestamp || Math.floor(new Date(records[0].epoch).getTime() / 1000),
      records,
      consensus: options.consensus || 'PBFT',
      proposer: options.proposer || 'Node-1-Alpha',
      difficulty: options.difficulty || 0,
      nonce: options.nonce || 0
    });

    this.blocks.push(block);

    // Register records in seen set
    for (const record of records) {
      this.seenRecords.add(`${record.noradCatId}_${record.epoch}`);
    }

    return block;
  }

  /**
   * Validates cryptographic integrity of the entire chain
   * @returns {{ valid: boolean, error?: string, failedIndex?: number }}
   */
  isValidChain() {
    if (this.blocks.length === 0) {
      return { valid: false, error: 'Chain is empty' };
    }

    // Verify Genesis Block
    const genesis = this.blocks[0];
    if (genesis.header.index !== 0) {
      return { valid: false, error: 'Genesis index must be 0', failedIndex: 0 };
    }
    if (genesis.header.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
      return { valid: false, error: 'Genesis previousHash must be 64 zeros', failedIndex: 0 };
    }
    if (computeHeaderHash(genesis.header) !== genesis.header.blockHash) {
      return { valid: false, error: 'Genesis header hash mismatch', failedIndex: 0 };
    }

    // Verify subsequent blocks
    for (let i = 1; i < this.blocks.length; i++) {
      const current = this.blocks[i];
      const previous = this.blocks[i - 1];

      // Check sequential indexing
      if (current.header.index !== previous.header.index + 1) {
        return {
          valid: false,
          error: `Non-sequential block index at height ${current.header.index}`,
          failedIndex: i
        };
      }

      // Check parent hash pointer linking
      if (current.header.previousHash !== previous.header.blockHash) {
        return {
          valid: false,
          error: `Broken hash pointer at block ${current.header.index}: expected previous ${previous.header.blockHash}, got ${current.header.previousHash}`,
          failedIndex: i
        };
      }

      // Check each record's SHA-256 canonical hash integrity
      for (let r = 0; r < current.records.length; r++) {
        const record = current.records[r];
        const expectedRecordHash = computeRecordHash(record);
        if (expectedRecordHash !== record.recordHash) {
          return {
            valid: false,
            error: `Record hash tampering detected in block ${current.header.index} at record ${r}`,
            failedIndex: i,
            failedRecordIndex: r
          };
        }
      }

      // Check Merkle root calculation over records
      const leafHashes = current.records.map(r => r.recordHash);
      const calculatedMerkleRoot = new MerkleTree(leafHashes).getRoot(false);
      if (calculatedMerkleRoot !== current.header.merkleRoot) {
        return {
          valid: false,
          error: `Merkle root mismatch at block ${current.header.index}`,
          failedIndex: i
        };
      }

      // Check header hash calculation
      const calculatedBlockHash = computeHeaderHash(current.header);
      if (calculatedBlockHash !== current.header.blockHash) {
        return {
          valid: false,
          error: `Block header hash mismatch at block ${current.header.index}`,
          failedIndex: i
        };
      }
    }

    return { valid: true };
  }

  /**
   * Mutates a record in a block to demonstrate tamper detection in live demos
   * @param {number} blockIndex Target block index
   * @param {number} recordIndex Target record index within block
   * @param {string} field Field to alter
   * @param {any} newValue Modified value
   */
  tamperRecord(blockIndex, recordIndex, field, newValue) {
    const block = this.getBlock(blockIndex);
    if (!block) throw new Error(`Block ${blockIndex} not found`);
    if (recordIndex < 0 || recordIndex >= block.records.length) {
      throw new Error(`Record index ${recordIndex} not found in block ${blockIndex}`);
    }

    const record = block.records[recordIndex];
    record[field] = newValue;
    // Note: leaves record.recordHash or header untouched to illustrate the integrity check failure
  }

  /**
   * Loads deterministic blocks from processed seed JSON
   * @param {string} filepath Path to seed_records.json
   */
  loadFromSeed(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);

    this.initialize();

    for (const b of data.blocks) {
      this.addBlock(b.records, {
        consensus: 'PBFT',
        proposer: b.blockIndex % 2 === 1 ? 'Node-1-Alpha' : 'Node-2-Beta'
      });
    }

    return this.getHeight();
  }

  /**
   * Persists chain state to a JSON flat file
   * @param {string} filepath
   */
  saveToJson(filepath) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(this.blocks, null, 2), 'utf8');
  }

  /**
   * Loads chain state from a JSON flat file
   * @param {string} filepath
   */
  loadFromJson(filepath) {
    if (!fs.existsSync(filepath)) throw new Error(`File ${filepath} not found`);
    const content = fs.readFileSync(filepath, 'utf8');
    this.blocks = JSON.parse(content);
    this.seenRecords.clear();
    for (const b of this.blocks) {
      for (const r of b.records) {
        this.seenRecords.add(`${r.noradCatId}_${r.epoch}`);
      }
    }
  }
}

module.exports = { Blockchain };
