const crypto = require('crypto');

/**
 * Custom Merkle Tree implementation using NIST SHA-256.
 * Implements Bitcoin-standard odd-leaf duplication and exact pair concatenation.
 * Matches Solidity sha256(abi.encodePacked(left, right)) bytecode execution.
 */
class MerkleTree {
  /**
   * @param {string[]|Buffer[]} leaves Array of 64-char hex strings or 32-byte Buffers
   */
  constructor(leaves) {
    if (!leaves || leaves.length === 0) {
      throw new Error('MerkleTree requires at least one leaf');
    }

    this.leaves = leaves.map(l => (Buffer.isBuffer(l) ? l : Buffer.from(l.replace(/^0x/, ''), 'hex')));
    this.layers = [this.leaves];
    this._buildTree();
  }

  /**
   * Builds the tree layer by layer up to the root
   * @private
   */
  _buildTree() {
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        // Duplicate the last node if odd number of nodes in this layer (Bitcoin specification)
        const right = (i + 1 < currentLayer.length) ? currentLayer[i + 1] : left;

        // SHA-256 over 64 bytes: Buffer.concat([left, right])
        const hash = crypto.createHash('sha256')
          .update(Buffer.concat([left, right]))
          .digest();

        nextLayer.push(hash);
      }

      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  /**
   * Returns the 32-byte Merkle root as a hex string with optional 0x prefix
   * @param {boolean} withPrefix
   * @returns {string}
   */
  getRoot(withPrefix = false) {
    const rootBuffer = this.layers[this.layers.length - 1][0];
    const hex = rootBuffer.toString('hex');
    return withPrefix ? `0x${hex}` : hex;
  }

  /**
   * Generates a cryptographic sibling proof for a leaf at a given index
   * @param {number} leafIndex Index of the target leaf
   * @returns {{ proof: string[], leafIndex: number, leafHash: string, root: string }}
   */
  getProof(leafIndex) {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of bounds (total leaves: ${this.leaves.length})`);
    }

    const proof = [];
    let currentIndex = leafIndex;

    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const layer = this.layers[layerIndex];
      const isRight = (currentIndex % 2 === 1);
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < layer.length) {
        proof.push(`0x${layer[siblingIndex].toString('hex')}`);
      } else {
        // When odd, sibling is a duplicate of current node
        proof.push(`0x${layer[currentIndex].toString('hex')}`);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    const leafHash = `0x${this.leaves[leafIndex].toString('hex')}`;
    const root = this.getRoot(true);

    return {
      leafIndex,
      leafHash,
      proof,
      root
    };
  }

  /**
   * Static verifier computing running SHA-256 pair walk matching Solidity verifyRecord()
   * @param {string|Buffer} leaf Leaf hash (hex or Buffer)
   * @param {string[]} proof Sibling hashes (0x hex)
   * @param {number} leafIndex Index of the leaf
   * @param {string|Buffer} root Target root (hex or Buffer)
   * @returns {boolean}
   */
  static verifyProof(leaf, proof, leafIndex, root) {
    let current = Buffer.isBuffer(leaf)
      ? leaf
      : Buffer.from(leaf.replace(/^0x/, ''), 'hex');

    const expectedRootHex = Buffer.isBuffer(root)
      ? root.toString('hex')
      : root.replace(/^0x/, '').toLowerCase();

    let currentIndex = leafIndex;

    for (let i = 0; i < proof.length; i++) {
      const sibling = Buffer.from(proof[i].replace(/^0x/, ''), 'hex');
      const isRight = (currentIndex % 2 === 1);

      const payload = isRight
        ? Buffer.concat([sibling, current])
        : Buffer.concat([current, sibling]);

      current = crypto.createHash('sha256').update(payload).digest();
      currentIndex = Math.floor(currentIndex / 2);
    }

    return current.toString('hex').toLowerCase() === expectedRootHex;
  }
}

module.exports = { MerkleTree };
