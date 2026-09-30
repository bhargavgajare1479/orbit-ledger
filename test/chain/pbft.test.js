const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { PBFTConsortium } = require('../../chain/consensus/pbft');

describe('PBFT Consortium State Machine Tests', () => {
  let consortium;
  const candidateHash = 'a1b2c3d4e5f6'.repeat(5) + 'abcd';

  beforeEach(() => {
    consortium = new PBFTConsortium(4);
  });

  test('Consensus succeeds with 4 honest nodes (Quorum 4/4)', () => {
    const result = consortium.runConsensusRound(candidateHash, 1);
    assert.equal(result.committed, true);
    assert.equal(result.matchingVotes, 4);
    assert.equal(result.signers.length, 4);
  });

  test('Consensus succeeds with 1 offline node (Quorum 3/4 with f = 1)', () => {
    consortium.setNodeFault('Node-4-Delta', 'offline');
    const result = consortium.runConsensusRound(candidateHash, 2);

    assert.equal(result.committed, true);
    assert.equal(result.matchingVotes, 3);
    assert.ok(result.signers.includes('Node-1-Alpha'));
    assert.ok(result.signers.includes('Node-2-Beta'));
    assert.ok(result.signers.includes('Node-3-Gamma'));
    assert.ok(!result.signers.includes('Node-4-Delta'));
  });

  test('Consensus succeeds with 1 Byzantine node sending conflicting votes', () => {
    consortium.setNodeFault('Node-3-Gamma', 'conflicting');
    const result = consortium.runConsensusRound(candidateHash, 3);

    assert.equal(result.committed, true);
    assert.equal(result.matchingVotes, 3);
    assert.ok(!result.signers.includes('Node-3-Gamma'));
  });

  test('Consensus halts safely when 2 nodes are faulty (2 < Quorum of 3)', () => {
    consortium.setNodeFault('Node-3-Gamma', 'offline');
    consortium.setNodeFault('Node-4-Delta', 'offline');
    const result = consortium.runConsensusRound(candidateHash, 4);

    assert.equal(result.committed, false);
    assert.equal(result.matchingVotes, 2);
    assert.equal(result.reason, 'PREPARE_QUORUM_NOT_MET');
  });

  test('Consensus halts when Primary is offline', () => {
    consortium.setNodeFault('Node-1-Alpha', 'offline');
    const result = consortium.runConsensusRound(candidateHash, 5);

    assert.equal(result.committed, false);
    assert.equal(result.reason, 'PRIMARY_OFFLINE');
  });
});
