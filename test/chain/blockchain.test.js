const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { Blockchain } = require('../../chain/blockchain');

describe('Blockchain Core Unit Tests', () => {
  let chain;
  const seedPath = path.resolve(__dirname, '../../data/seed_records.json');
  const dupPath = path.resolve(__dirname, '../../data/duplicates_demo.json');

  beforeEach(() => {
    chain = new Blockchain();
  });

  test('Initializes with valid Genesis block (Block 0)', () => {
    assert.equal(chain.getHeight(), 0);
    const genesis = chain.getBlock(0);
    assert.equal(genesis.header.index, 0);
    assert.equal(genesis.header.previousHash, '0'.repeat(64));
    assert.equal(genesis.header.consensus, 'GENESIS');

    const status = chain.isValidChain();
    assert.equal(status.valid, true);
  });

  test('Loads complete 25-block deterministic seed chain', () => {
    const height = chain.loadFromSeed(seedPath);
    assert.equal(height, 25);
    assert.equal(chain.blocks.length, 26); // Genesis + 25 blocks

    const status = chain.isValidChain();
    assert.equal(status.valid, true);
  });

  test('Validates cryptographic linking between all blocks', () => {
    chain.loadFromSeed(seedPath);

    for (let i = 1; i <= 25; i++) {
      const current = chain.getBlock(i);
      const prev = chain.getBlock(i - 1);
      assert.equal(current.header.previousHash, prev.header.blockHash);
      assert.equal(current.records.length, 40);
    }
  });

  test('Detects record tampering and invalidates chain integrity check', () => {
    chain.loadFromSeed(seedPath);

    // Tamper with record 5 in block 3
    chain.tamperRecord(3, 5, 'inclinationDeg', 99.9999);

    const status = chain.isValidChain();
    assert.equal(status.valid, false);
    assert.equal(status.failedIndex, 3);
  });

  test('Rejects duplicate record submission with DuplicateRecordError', () => {
    chain.loadFromSeed(seedPath);

    // Load known duplicates from fixtures
    const duplicates = JSON.parse(fs.readFileSync(dupPath, 'utf8'));
    assert.ok(duplicates.length > 0);

    const dupRecord = duplicates[0];
    assert.throws(
      () => {
        chain.addBlock([dupRecord]);
      },
      /DuplicateRecordError/
    );
  });
});
