const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { ProofOfAuthority } = require('../../chain/consensus/poa');

describe('Proof of Authority Consensus Tests', () => {
  test('Rotates proposers round-robin through authorized consortium list', () => {
    const p0 = ProofOfAuthority.getProposer(0);
    const p1 = ProofOfAuthority.getProposer(1);
    const p2 = ProofOfAuthority.getProposer(2);
    const p3 = ProofOfAuthority.getProposer(3);
    const p4 = ProofOfAuthority.getProposer(4);

    assert.equal(p0.id, 'Node-1-Alpha');
    assert.equal(p1.id, 'Node-2-Beta');
    assert.equal(p2.id, 'Node-3-Gamma');
    assert.equal(p3.id, 'Node-4-Delta');
    assert.equal(p4.id, 'Node-1-Alpha'); // Rotates back
  });

  test('Validates designated proposer and rejects unauthorized proposer', () => {
    assert.equal(ProofOfAuthority.validateProposer(1, 'Node-2-Beta'), true);
    assert.equal(ProofOfAuthority.validateProposer(1, 'Node-1-Alpha'), false);
    assert.equal(ProofOfAuthority.validateProposer(1, '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5'), true);
    assert.equal(ProofOfAuthority.validateProposer(1, '0xUnAuthorizedAddress'), false);
  });
});
