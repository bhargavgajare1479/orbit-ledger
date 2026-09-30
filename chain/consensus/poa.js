/**
 * Proof of Authority round-robin validator scheduler.
 */
class ProofOfAuthority {
  static AUTHORIZED_VALIDATORS = [
    { id: 'Node-1-Alpha', address: '0x0a70f9F1f5fDDc0c34b8Bb44463bd0204b8af922' },
    { id: 'Node-2-Beta', address: '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5' },
    { id: 'Node-3-Gamma', address: '0xa4e24D1e363fb45f5A43A838Ce547B36F4Bea4d2' },
    { id: 'Node-4-Delta', address: '0x1efEb9163C90B96FEe44FBb9c0aE7920E67101ab' }
  ];

  /**
   * Returns designated proposer for a given block height
   * @param {number} blockIndex
   * @param {Array} [validators]
   * @returns {object}
   */
  static getProposer(blockIndex, validators = ProofOfAuthority.AUTHORIZED_VALIDATORS) {
    const index = blockIndex % validators.length;
    return validators[index];
  }

  /**
   * Validates if a proposer is authorized for the given block index
   * @param {number} blockIndex
   * @param {string} proposerId Or proposer address
   * @param {Array} [validators]
   * @returns {boolean}
   */
  static validateProposer(blockIndex, proposerId, validators = ProofOfAuthority.AUTHORIZED_VALIDATORS) {
    const designated = ProofOfAuthority.getProposer(blockIndex, validators);
    return designated.id === proposerId || designated.address.toLowerCase() === proposerId.toLowerCase();
  }
}

module.exports = { ProofOfAuthority };
