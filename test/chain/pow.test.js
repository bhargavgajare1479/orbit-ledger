const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { ProofOfWork } = require('../../chain/consensus/pow');

describe('Proof of Work Consensus Tests', () => {
  const dummyHeader = {
    index: 1,
    previousHash: '0'.repeat(64),
    timestamp: 1782864000,
    merkleRoot: 'a'.repeat(64),
    consensus: 'POW',
    proposer: 'Node-1-Alpha'
  };

  test('Mines block meeting difficulty 1 (1 leading zero)', () => {
    const result = ProofOfWork.mine(dummyHeader, 1);
    assert.ok(result.blockHash.startsWith('0'));
    assert.ok(result.iterations > 0);
    assert.ok(result.durationMs >= 0);

    const verified = ProofOfWork.verify({
      ...dummyHeader,
      difficulty: 1,
      nonce: result.nonce,
      blockHash: result.blockHash
    });
    assert.equal(verified, true);
  });

  test('Mines block meeting difficulty 2 (2 leading zeros)', () => {
    const result = ProofOfWork.mine(dummyHeader, 2);
    assert.ok(result.blockHash.startsWith('00'));

    const verified = ProofOfWork.verify({
      ...dummyHeader,
      difficulty: 2,
      nonce: result.nonce,
      blockHash: result.blockHash
    });
    assert.equal(verified, true);
  });

  test('Mines block meeting difficulty 3 (3 leading zeros)', () => {
    const result = ProofOfWork.mine(dummyHeader, 3);
    assert.ok(result.blockHash.startsWith('000'));

    const verified = ProofOfWork.verify({
      ...dummyHeader,
      difficulty: 3,
      nonce: result.nonce,
      blockHash: result.blockHash
    });
    assert.equal(verified, true);
  });

  test('Rejects block with invalid nonce', () => {
    const result = ProofOfWork.mine(dummyHeader, 2);
    const verified = ProofOfWork.verify({
      ...dummyHeader,
      difficulty: 2,
      nonce: result.nonce + 1, // Tampered nonce
      blockHash: result.blockHash
    });
    assert.equal(verified, false);
  });
});
