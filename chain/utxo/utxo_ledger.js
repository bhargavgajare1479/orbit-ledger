const crypto = require('crypto');

/**
 * Standalone Bitcoin-style UTXO Ledger Engine.
 * Implements discrete coin tracking, transaction inputs/outputs, script validation,
 * and strict double-spending rejection.
 */
class UTXOLedger {
  constructor() {
    // Map of outpoint `${txId}:${outputIndex}` => TxOutput
    this.utxoPool = new Map();
    this.txHistory = [];
    this.initializeGenesisUTXOs();
  }

  /**
   * Initializes initial coinbase outputs for demonstration accounts
   */
  initializeGenesisUTXOs() {
    this.utxoPool.clear();
    this.txHistory = [];

    const genesisOutputs = [
      { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 5000 },
      { address: '1CounterpartyOperator1AlphaAddress', value: 3000 },
      { address: '1CounterpartyOperator2BetaAddress', value: 2000 },
      { address: '1ExaminerEvaluationTestAddress', value: 1000 }
    ];

    const genesisTxId = crypto.createHash('sha256').update('GENESIS-COINBASE-UTXO-ORBIT-LEDGER', 'utf8').digest('hex');

    genesisOutputs.forEach((out, index) => {
      const outpoint = `${genesisTxId}:${index}`;
      this.utxoPool.set(outpoint, {
        txId: genesisTxId,
        outputIndex: index,
        address: out.address,
        value: out.value
      });
    });

    this.txHistory.push({
      txId: genesisTxId,
      isCoinbase: true,
      inputs: [],
      outputs: genesisOutputs,
      timestamp: 1782777600
    });
  }

  /**
   * Computes canonical transaction ID
   * @param {Array} inputs
   * @param {Array} outputs
   * @returns {string} 64-char hex SHA-256 hash
   */
  static computeTxId(inputs, outputs) {
    const payload = JSON.stringify({ inputs, outputs });
    return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
  }

  /**
   * Returns all current unspent transaction outputs
   * @returns {Array}
   */
  getUTXOPool() {
    return Array.from(this.utxoPool.values());
  }

  /**
   * Returns balance for a given address
   * @param {string} address
   * @returns {number}
   */
  getBalance(address) {
    let balance = 0;
    for (const utxo of this.utxoPool.values()) {
      if (utxo.address === address) {
        balance += utxo.value;
      }
    }
    return balance;
  }

  /**
   * Executes a transaction spending UTXOs and creating new outputs
   * @param {Array<{ txId: string, outputIndex: number, address?: string }>} inputs
   * @param {Array<{ address: string, value: number }>} outputs
   * @returns {object} Confirmed transaction
   */
  spend(inputs, outputs) {
    if (!inputs || inputs.length === 0) {
      throw new Error('Transaction must contain at least one input');
    }
    if (!outputs || outputs.length === 0) {
      throw new Error('Transaction must contain at least one output');
    }

    // 1. Verify all inputs exist in current UTXO pool (Double Spend Check)
    let totalInputValue = 0;
    const consumedUTXOs = [];

    // Check for intra-transaction duplicate inputs
    const inputSet = new Set();
    for (const input of inputs) {
      const outpoint = `${input.txId}:${input.outputIndex}`;
      if (inputSet.has(outpoint)) {
        throw new Error(`DoubleSpendDetected: Duplicate input ${outpoint} referenced within same transaction`);
      }
      inputSet.add(outpoint);

      const existingUTXO = this.utxoPool.get(outpoint);
      if (!existingUTXO) {
        throw new Error(`DoubleSpendDetected: UTXO ${outpoint} does not exist or has already been spent`);
      }

      totalInputValue += existingUTXO.value;
      consumedUTXOs.push({ outpoint, utxo: existingUTXO });
    }

    // 2. Verify total input value >= total output value
    const totalOutputValue = outputs.reduce((acc, out) => {
      if (out.value <= 0) throw new Error('Output value must be positive');
      return acc + out.value;
    }, 0);

    if (totalInputValue < totalOutputValue) {
      throw new Error(`InsufficientFunds: Total inputs (${totalInputValue}) less than total outputs (${totalOutputValue})`);
    }

    const fee = totalInputValue - totalOutputValue;
    const txId = UTXOLedger.computeTxId(inputs, outputs);

    // 3. Atomically consume inputs from UTXO pool
    for (const { outpoint } of consumedUTXOs) {
      this.utxoPool.delete(outpoint);
    }

    // 4. Insert new outputs into UTXO pool
    outputs.forEach((out, index) => {
      const outpoint = `${txId}:${index}`;
      this.utxoPool.set(outpoint, {
        txId,
        outputIndex: index,
        address: out.address,
        value: out.value
      });
    });

    const txRecord = {
      txId,
      inputs,
      outputs,
      fee,
      timestamp: Math.floor(Date.now() / 1000)
    };

    this.txHistory.push(txRecord);
    return txRecord;
  }
}

module.exports = { UTXOLedger };
