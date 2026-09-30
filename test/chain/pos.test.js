const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { ProofOfStake } = require('../../chain/consensus/pos');

describe('Proof of Stake Consensus Tests', () => {
  const prevHash = '4f8a'.repeat(16);

  test('Deterministically selects same proposer given identical previous hash and slot', () => {
    const sel1 = ProofOfStake.selectProposer(prevHash, 5);
    const sel2 = ProofOfStake.selectProposer(prevHash, 5);

    assert.equal(sel1.selected.id, sel2.selected.id);
    assert.equal(sel1.seed, sel2.seed);
    assert.equal(sel1.randomInt, sel2.randomInt);
  });

  test('Selects proposers approximately proportional to stakes over 1000 slots', () => {
    const counts = {
      'Node-1-Alpha': 0, // 40%
      'Node-2-Beta': 0,  // 30%
      'Node-3-Gamma': 0, // 20%
      'Node-4-Delta': 0  // 10%
    };

    const totalSlots = 1000;
    for (let slot = 0; slot < totalSlots; slot++) {
      const { selected } = ProofOfStake.selectProposer(prevHash, slot);
      counts[selected.id]++;
    }

    // Node 1 (40%) should have highest count, Node 4 (10%) lowest
    assert.ok(counts['Node-1-Alpha'] > counts['Node-3-Gamma']);
    assert.ok(counts['Node-2-Beta'] > counts['Node-4-Delta']);
    assert.ok(counts['Node-1-Alpha'] > 300, `Expected Node 1 > 300, got ${counts['Node-1-Alpha']}`);
    assert.ok(counts['Node-4-Delta'] < 200, `Expected Node 4 < 200, got ${counts['Node-4-Delta']}`);
  });
});
