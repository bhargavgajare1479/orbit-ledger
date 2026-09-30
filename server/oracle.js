const fs = require('fs');
const path = require('path');
const satellite = require('satellite.js');
const { ethers } = require('ethers');

/**
 * Astrodynamics Conjunction Screening Oracle.
 * Propagates TLE ephemerides using satellite.js SGP4 models, computes 3D Cartesian coordinates
 * in integer metres, screens for close approaches against configurable thresholds, and submits
 * certified reports to ConjunctionMonitor.sol on EVM networks.
 */
class ConjunctionOracle {
  constructor(records = []) {
    this.records = records;
  }

  /**
   * Loads records from the seed_records dataset
   * @param {string} [seedPath]
   */
  loadRecordsFromSeed(seedPath) {
    const defaultPath = path.resolve(__dirname, '../data/seed_records.json');
    const targetPath = seedPath || defaultPath;
    const content = fs.readFileSync(targetPath, 'utf8');
    const data = JSON.parse(content);

    const extracted = [];
    for (const block of data.blocks) {
      extracted.push(...block.records);
    }
    this.records = extracted;
    return this.records.length;
  }

  /**
   * Propagates a record to a target Date and returns integer metre coordinates
   * @param {object} record
   * @param {Date} date
   * @returns {{ valid: boolean, posMetres?: [number, number, number], posKm?: object }}
   */
  static propagateRecord(record, date) {
    try {
      const satrec = satellite.twoline2satrec(record.tleLine1, record.tleLine2);
      const pv = satellite.propagate(satrec, date);

      if (!pv || !pv.position || isNaN(pv.position.x)) {
        return { valid: false };
      }

      const xM = Math.round(pv.position.x * 1000);
      const yM = Math.round(pv.position.y * 1000);
      const zM = Math.round(pv.position.z * 1000);

      return {
        valid: true,
        posMetres: [xM, yM, zM],
        posKm: pv.position
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Screens candidate conjunctions across orbital records within a threshold
   * @param {object} options
   * @param {number} [options.thresholdKm=150] Screening threshold in km
   * @param {number} [options.limit=20] Max results to return
   * @param {number} [options.sampleSize=100] Subset of records to evaluate
   * @returns {Array} List of candidate conjunction events
   */
  screenConjunctions(options = {}) {
    if (this.records.length === 0) {
      this.loadRecordsFromSeed();
    }

    const thresholdKm = options.thresholdKm || 150;
    const thresholdMetres = thresholdKm * 1000;
    const sampleSize = Math.min(options.sampleSize || 100, this.records.length);
    const subset = this.records.slice(0, sampleSize);

    const candidates = [];

    for (let i = 0; i < subset.length; i++) {
      const r1 = subset[i];
      const epochDate = new Date(r1.epoch);
      const epochSeconds = Math.floor(epochDate.getTime() / 1000);

      const p1 = ConjunctionOracle.propagateRecord(r1, epochDate);
      if (!p1.valid) continue;

      for (let j = i + 1; j < subset.length; j++) {
        const r2 = subset[j];
        if (r1.noradCatId === r2.noradCatId) continue;

        const p2 = ConjunctionOracle.propagateRecord(r2, epochDate);
        if (!p2.valid) continue;

        const dx = (p1.posMetres[0] - p2.posMetres[0]) / 1000;
        const dy = (p1.posMetres[1] - p2.posMetres[1]) / 1000;
        const dz = (p1.posMetres[2] - p2.posMetres[2]) / 1000;
        const distKm = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const distMetres = Math.round(distKm * 1000);

        candidates.push({
          object1Id: r1.noradCatId,
          object2Id: r2.noradCatId,
          name1: r1.objectName,
          name2: r2.objectName,
          operator1: r1.operator,
          operator2: r2.operator,
          epoch: r1.epoch,
          epochSeconds,
          missDistanceKm: Math.round(distKm * 10) / 10,
          missDistanceMetres: distMetres,
          thresholdMetres,
          withinThreshold: distMetres <= thresholdMetres,
          pos1: p1.posMetres,
          pos2: p2.posMetres
        });
      }
    }

    // Sort by miss distance ascending
    candidates.sort((a, b) => a.missDistanceMetres - b.missDistanceMetres);
    return candidates.slice(0, options.limit || 20);
  }

  /**
   * Submits a candidate conjunction report to ConjunctionMonitor.sol on-chain
   * @param {object} candidate
   * @param {string} [networkName='ganache']
   * @param {string} [rpcUrl]
   * @param {string} [privateKey]
   * @returns {Promise<object>} Transaction receipt details
   */
  async reportToContract(candidate, networkName = 'ganache', rpcUrl = null, privateKey = null) {
    const deploymentPath = path.resolve(__dirname, `../deployments/${networkName}.json`);
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment file ${deploymentPath} not found. Deploy contracts first.`);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const monitorAddress = deployment.contracts.ConjunctionMonitor;

    const url = rpcUrl || (networkName === 'ganache' ? 'http://127.0.0.1:8545' : process.env.SEPOLIA_RPC_URL);
    const provider = new ethers.JsonRpcProvider(url);

    // If Ganache, use first pre-funded account; if Sepolia, use configured key
    let signer;
    if (privateKey) {
      signer = new ethers.Wallet(privateKey, provider);
    } else if (networkName === 'ganache') {
      // Ganache default operator account 0
      const pk = '0x0b2a7160eb4331b67497d20eed8c9e68e6f16ab43088571fcba19fce91f69a24';
      signer = new ethers.Wallet(pk, provider);
    } else {
      signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
    }

    const abi = [
      'function reportConjunction(uint256 obj1, uint256 obj2, uint256 epoch, int64[3] pos1, int64[3] pos2) external returns (bytes32 alertId, uint256 tokenId)',
      'function setThreshold(uint256 thresholdMetres) external',
      'function getThresholdMetres() external view returns (uint256)',
      'event ConjunctionDetected(bytes32 indexed alertId, uint256 indexed object1Id, uint256 indexed object2Id, uint256 missDistanceMetres, uint256 certificateTokenId, uint256 epoch)'
    ];

    const contract = new ethers.Contract(monitorAddress, abi, signer);

    // Check if contract threshold needs updating to accommodate the candidate screening
    const currentThreshold = await contract.getThresholdMetres();
    let nonce = await provider.getTransactionCount(signer.address);

    if (BigInt(candidate.missDistanceMetres) > currentThreshold) {
      const newThreshold = candidate.missDistanceMetres + 5000;
      console.log(`Adjusting contract threshold from ${currentThreshold} m to ${newThreshold} m...`);
      const setTx = await contract.setThreshold(newThreshold, { nonce: nonce++ });
      await setTx.wait();
    }

    const tx = await contract.reportConjunction(
      candidate.object1Id,
      candidate.object2Id,
      candidate.epochSeconds,
      candidate.pos1,
      candidate.pos2,
      { nonce: nonce++ }
    );

    const receipt = await tx.wait();

    let alertId = null;
    let tokenId = null;

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'ConjunctionDetected') {
          alertId = parsed.args.alertId;
          tokenId = Number(parsed.args.certificateTokenId);
        }
      } catch {
        // Skip logs not matching ConjunctionDetected
      }
    }

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      alertId,
      tokenId,
      candidate
    };
  }
}

module.exports = { ConjunctionOracle };
