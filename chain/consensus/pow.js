const { computeHeaderHash } = require('../block');

/**
 * Proof of Work miner searching for a header hash meeting the target leading-zeros difficulty.
 */
class ProofOfWork {
  /**
   * Synchronously or asynchronously mines a block header
   * @param {object} header Block header without nonce
   * @param {number} difficulty Number of leading hex zeros required
   * @param {function} [onProgress] Optional callback invoked every N iterations with live telemetry
   * @returns {{ nonce: number, blockHash: string, iterations: number, durationMs: number, hashRate: number }}
   */
  static mine(header, difficulty = 1, onProgress = null) {
    const targetPrefix = '0'.repeat(difficulty);
    let nonce = 0;
    const startTime = Date.now();
    let lastProgressTime = startTime;

    while (true) {
      const candidateHeader = {
        ...header,
        difficulty,
        nonce
      };

      const blockHash = computeHeaderHash(candidateHeader);

      if (blockHash.startsWith(targetPrefix)) {
        const endTime = Date.now();
        const durationMs = Math.max(1, endTime - startTime);
        const hashRate = Math.round((nonce + 1) / (durationMs / 1000));

        return {
          nonce,
          blockHash,
          iterations: nonce + 1,
          durationMs,
          hashRate
        };
      }

      nonce++;

      // Trigger progress reporting if callback provided
      if (onProgress && nonce % 1000 === 0) {
        const now = Date.now();
        const interval = Math.max(1, now - lastProgressTime);
        const currentRate = Math.round(1000 / (interval / 1000));
        onProgress({
          nonce,
          elapsedMs: now - startTime,
          hashRate: currentRate,
          candidateHash: blockHash
        });
        lastProgressTime = now;
      }
    }
  }

  /**
   * Verifies whether a given block satisfies its declared PoW difficulty
   * @param {object} header
   * @returns {boolean}
   */
  static verify(header) {
    const targetPrefix = '0'.repeat(header.difficulty);
    const calculatedHash = computeHeaderHash(header);
    return calculatedHash === header.blockHash && calculatedHash.startsWith(targetPrefix);
  }
}

module.exports = { ProofOfWork };
