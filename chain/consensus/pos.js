const crypto = require('crypto');

/**
 * Proof of Stake slot proposer selector using deterministic stake-weighted lottery.
 */
class ProofOfStake {
  static DEFAULT_VALIDATORS = [
    { id: 'Node-1-Alpha', address: '0x0a70f9F1f5fDDc0c34b8Bb44463bd0204b8af922', stake: 40000, share: 0.40 },
    { id: 'Node-2-Beta', address: '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5', stake: 30000, share: 0.30 },
    { id: 'Node-3-Gamma', address: '0xa4e24D1e363fb45f5A43A838Ce547B36F4Bea4d2', stake: 20000, share: 0.20 },
    { id: 'Node-4-Delta', address: '0x1efEb9163C90B96FEe44FBb9c0aE7920E67101ab', stake: 10000, share: 0.10 }
  ];

  /**
   * Selects a block proposer for a given slot based on stake weights
   * @param {string} previousBlockHash
   * @param {number} slotNumber
   * @param {Array} [validators]
   * @returns {{ slot: number, seed: string, randomInt: number, selected: object }}
   */
  static selectProposer(previousBlockHash, slotNumber, validators = ProofOfStake.DEFAULT_VALIDATORS) {
    const totalStake = validators.reduce((acc, v) => acc + v.stake, 0);

    // Seed from previous block hash and slot number
    const payload = `${previousBlockHash}:${slotNumber}`;
    const seed = crypto.createHash('sha256').update(payload, 'utf8').digest('hex');

    // Convert first 8 hex characters (32 bits) to integer modulo total stake
    const randomInt = parseInt(seed.slice(0, 8), 16) % totalStake;

    let cumulative = 0;
    let selected = validators[0];

    for (const validator of validators) {
      cumulative += validator.stake;
      if (randomInt < cumulative) {
        selected = validator;
        break;
      }
    }

    return {
      slot: slotNumber,
      seed,
      randomInt,
      totalStake,
      selected
    };
  }
}

module.exports = { ProofOfStake };
