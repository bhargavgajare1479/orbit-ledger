const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { MerkleTree } = require('../../chain/merkle');

describe('MerkleTree Unit Tests', () => {
  const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

  test('Constructs valid Merkle tree with even number of leaves (4 leaves)', () => {
    const leaves = ['a', 'b', 'c', 'd'].map(sha256);
    const tree = new MerkleTree(leaves);

    // Manual calculation
    const hA = Buffer.from(leaves[0], 'hex');
    const hB = Buffer.from(leaves[1], 'hex');
    const hC = Buffer.from(leaves[2], 'hex');
    const hD = Buffer.from(leaves[3], 'hex');

    const hAB = crypto.createHash('sha256').update(Buffer.concat([hA, hB])).digest();
    const hCD = crypto.createHash('sha256').update(Buffer.concat([hC, hD])).digest();
    const hRoot = crypto.createHash('sha256').update(Buffer.concat([hAB, hCD])).digest('hex');

    assert.equal(tree.getRoot(false), hRoot);
  });

  test('Constructs valid Merkle tree with odd number of leaves (3 leaves, Bitcoin duplication)', () => {
    const leaves = ['item1', 'item2', 'item3'].map(sha256);
    const tree = new MerkleTree(leaves);

    // Third leaf should be duplicated to pair with itself
    const h1 = Buffer.from(leaves[0], 'hex');
    const h2 = Buffer.from(leaves[1], 'hex');
    const h3 = Buffer.from(leaves[2], 'hex');

    const h12 = crypto.createHash('sha256').update(Buffer.concat([h1, h2])).digest();
    const h33 = crypto.createHash('sha256').update(Buffer.concat([h3, h3])).digest();
    const expectedRoot = crypto.createHash('sha256').update(Buffer.concat([h12, h33])).digest('hex');

    assert.equal(tree.getRoot(false), expectedRoot);
  });

  test('Generates and verifies cryptographic proofs for all 40 leaves in a block', () => {
    const leaves = Array.from({ length: 40 }, (_, i) => sha256(`record_${i}`));
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot(true);

    for (let i = 0; i < leaves.length; i++) {
      const proofObj = tree.getProof(i);
      assert.equal(proofObj.leafIndex, i);
      assert.equal(proofObj.root, root);

      const isValid = MerkleTree.verifyProof(proofObj.leafHash, proofObj.proof, proofObj.leafIndex, root);
      assert.equal(isValid, true, `Proof verification failed for leaf index ${i}`);
    }
  });

  test('Rejects proof if sibling hash is corrupted', () => {
    const leaves = Array.from({ length: 8 }, (_, i) => sha256(`record_${i}`));
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot(true);

    const proofObj = tree.getProof(2);
    // Mutate first sibling hash
    const corruptedProof = [...proofObj.proof];
    corruptedProof[0] = '0x' + '0'.repeat(64);

    const isValid = MerkleTree.verifyProof(proofObj.leafHash, corruptedProof, proofObj.leafIndex, root);
    assert.equal(isValid, false);
  });

  test('Rejects proof if leaf hash is corrupted', () => {
    const leaves = Array.from({ length: 8 }, (_, i) => sha256(`record_${i}`));
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot(true);

    const proofObj = tree.getProof(1);
    const wrongLeaf = '0x' + 'f'.repeat(64);

    const isValid = MerkleTree.verifyProof(wrongLeaf, proofObj.proof, proofObj.leafIndex, root);
    assert.equal(isValid, false);
  });
});
