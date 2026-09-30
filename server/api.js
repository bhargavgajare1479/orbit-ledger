const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { Blockchain } = require('../chain/blockchain');
const { ProofOfWork } = require('../chain/consensus/pow');
const { ProofOfStake } = require('../chain/consensus/pos');
const { ProofOfAuthority } = require('../chain/consensus/poa');
const { PBFTConsortium } = require('../chain/consensus/pbft');
const { UTXOLedger } = require('../chain/utxo/utxo_ledger');
const { ConjunctionOracle } = require('./oracle');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Core Subsystems
const chain = new Blockchain();
const seedPath = path.resolve(__dirname, '../data/seed_records.json');
if (fs.existsSync(seedPath)) {
  chain.loadFromSeed(seedPath);
  console.log(`Loaded Layer A chain with ${chain.getHeight()} blocks from seed records.`);
}

const pbftConsortium = new PBFTConsortium(4);
const utxoLedger = new UTXOLedger();
const oracle = new ConjunctionOracle();
if (fs.existsSync(seedPath)) {
  oracle.loadRecordsFromSeed(seedPath);
}

// Helper to read deployment addresses
function getDeployment(network = 'ganache') {
  const depPath = path.resolve(__dirname, `../deployments/${network}.json`);
  if (fs.existsSync(depPath)) {
    return JSON.parse(fs.readFileSync(depPath, 'utf8'));
  }
  return null;
}

// 1. GET /api/status
app.get('/api/status', (req, res) => {
  const deployment = getDeployment('ganache');
  const validity = chain.isValidChain();

  res.json({
    name: 'Orbit Ledger API',
    version: '1.0.0',
    chainHeight: chain.getHeight(),
    totalBlocks: chain.blocks.length,
    chainValid: validity.valid,
    chainError: validity.error || null,
    consensus: 'PBFT',
    activeOperators: [
      { id: 'Node-1-Alpha', role: 'Primary', address: '0x0a70f9F1f5fDDc0c34b8Bb44463bd0204b8af922' },
      { id: 'Node-2-Beta', role: 'Replica', address: '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5' },
      { id: 'Node-3-Gamma', role: 'Replica', address: '0xa4e24D1e363fb45f5A43A838Ce547B36F4Bea4d2' },
      { id: 'Node-4-Delta', role: 'Replica', address: '0x1efEb9163C90B96FEe44FBb9c0aE7920E67101ab' }
    ],
    deployment: deployment ? {
      network: deployment.network,
      chainId: deployment.chainId,
      contracts: deployment.contracts
    } : null
  });
});

// 2. GET /api/blocks
app.get('/api/blocks', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = chain.blocks.length;
  const blocksSlice = chain.blocks.slice(startIndex, startIndex + limit).map(b => ({
    index: b.header.index,
    previousHash: b.header.previousHash,
    blockHash: b.header.blockHash,
    merkleRoot: b.header.merkleRoot,
    timestamp: b.header.timestamp,
    consensus: b.header.consensus,
    proposer: b.header.proposer,
    recordCount: b.records.length,
    difficulty: b.header.difficulty,
    nonce: b.header.nonce
  }));

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    blocks: blocksSlice
  });
});

// 3. GET /api/blocks/:index
app.get('/api/blocks/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const block = chain.getBlock(index);
  if (!block) {
    return res.status(404).json({ error: `Block ${index} not found` });
  }
  res.json(block);
});

// 4. GET /api/blocks/:index/proof/:recordIndex
app.get('/api/blocks/:index/proof/:recordIndex', (req, res) => {
  const blockIndex = parseInt(req.params.index, 10);
  const recordIndex = parseInt(req.params.recordIndex, 10);

  const block = chain.getBlock(blockIndex);
  if (!block) {
    return res.status(404).json({ error: `Block ${blockIndex} not found` });
  }

  const { MerkleTree } = require('../chain/merkle');
  const leaves = block.records.map(r => r.recordHash);
  const tree = new MerkleTree(leaves);

  try {
    const proof = tree.getProof(recordIndex);
    res.json({
      blockIndex,
      recordIndex,
      record: block.records[recordIndex],
      leafHash: proof.leafHash,
      proof: proof.proof,
      merkleRoot: `0x${block.header.merkleRoot}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. POST /api/tamper
app.post('/api/tamper', (req, res) => {
  const { blockIndex, recordIndex, field, value } = req.body;
  try {
    chain.tamperRecord(
      parseInt(blockIndex, 10),
      parseInt(recordIndex, 10),
      field || 'inclinationDeg',
      value !== undefined ? value : 99.9999
    );
    const validity = chain.isValidChain();
    res.json({
      success: true,
      message: `Tampered record ${recordIndex} in block ${blockIndex}`,
      chainValid: validity.valid,
      chainError: validity.error || null,
      failedIndex: validity.failedIndex
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. POST /api/reset-chain
app.post('/api/reset-chain', (req, res) => {
  if (fs.existsSync(seedPath)) {
    chain.loadFromSeed(seedPath);
    res.json({ success: true, message: 'Chain reset to deterministic seed state' });
  } else {
    chain.initialize();
    res.json({ success: true, message: 'Chain reset to genesis' });
  }
});

// 7. POST /api/mine (PoW demo)
app.post('/api/mine', (req, res) => {
  const difficulty = parseInt(req.body.difficulty, 10) || 1;
  const dummyHeader = {
    index: chain.getHeight() + 1,
    previousHash: chain.getLatestBlock().header.blockHash,
    timestamp: Math.floor(Date.now() / 1000),
    merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    consensus: 'POW',
    proposer: 'Node-1-Alpha'
  };

  const result = ProofOfWork.mine(dummyHeader, difficulty);
  res.json({
    difficulty,
    nonce: result.nonce,
    blockHash: result.blockHash,
    iterations: result.iterations,
    durationMs: result.durationMs,
    hashRate: result.hashRate
  });
});

// 8. GET /api/consensus/pos/sample
app.get('/api/consensus/pos/sample', (req, res) => {
  const slot = parseInt(req.query.slot, 10) || 0;
  const prevHash = chain.getLatestBlock().header.blockHash;
  const result = ProofOfStake.selectProposer(prevHash, slot);
  res.json(result);
});

// 9. GET /api/consensus/poa/schedule
app.get('/api/consensus/poa/schedule', (req, res) => {
  const currentHeight = chain.getHeight();
  const schedule = [];
  for (let i = currentHeight; i < currentHeight + 8; i++) {
    schedule.push({
      blockIndex: i,
      proposer: ProofOfAuthority.getProposer(i)
    });
  }
  res.json({ schedule });
});

// 10. POST /api/consensus/pbft/step
app.post('/api/consensus/pbft/step', (req, res) => {
  const blockIndex = chain.getHeight() + 1;
  const candidateHash = req.body.candidateHash || chain.getLatestBlock().header.blockHash;
  const roundResult = pbftConsortium.runConsensusRound(candidateHash, blockIndex);
  res.json(roundResult);
});

// 11. POST /api/consensus/pbft/faults
app.post('/api/consensus/pbft/faults', (req, res) => {
  const { nodeId, mode } = req.body;
  try {
    if (nodeId === 'reset') {
      pbftConsortium.resetFaults();
    } else {
      pbftConsortium.setNodeFault(nodeId, mode);
    }
    res.json({ success: true, nodes: pbftConsortium.nodes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 12. GET /api/conjunctions/screen
app.get('/api/conjunctions/screen', (req, res) => {
  const thresholdKm = parseFloat(req.query.thresholdKm) || 150;
  const limit = parseInt(req.query.limit, 10) || 15;
  const candidates = oracle.screenConjunctions({ thresholdKm, limit });
  res.json({
    thresholdKm,
    candidatesCount: candidates.length,
    candidates
  });
});

// 13. POST /api/conjunctions/report
app.post('/api/conjunctions/report', async (req, res) => {
  const { candidate, network } = req.body;
  if (!candidate) {
    return res.status(400).json({ error: 'Candidate conjunction object required' });
  }

  try {
    const reportResult = await oracle.reportToContract(candidate, network || 'ganache');
    res.json({ success: true, ...reportResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. GET /api/utxo/pool
app.get('/api/utxo/pool', (req, res) => {
  res.json({
    utxoPool: utxoLedger.getUTXOPool(),
    txHistory: utxoLedger.txHistory
  });
});

// 15. POST /api/utxo/submit
app.post('/api/utxo/submit', (req, res) => {
  const { inputs, outputs } = req.body;
  try {
    const tx = utxoLedger.spend(inputs, outputs);
    res.json({ success: true, transaction: tx, pool: utxoLedger.getUTXOPool() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 16. GET /api/records
app.get('/api/records', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 40;
  const search = (req.query.search || '').toLowerCase().trim();
  const operator = req.query.operator || 'all';

  let allRecords = [];
  for (const block of chain.blocks) {
    allRecords.push(...block.records);
  }

  if (operator !== 'all') {
    allRecords = allRecords.filter(r => r.operator.toLowerCase() === operator.toLowerCase());
  }

  if (search) {
    allRecords = allRecords.filter(r =>
      r.noradCatId.toString().includes(search) ||
      (r.objectName && r.objectName.toLowerCase().includes(search)) ||
      (r.objectId && r.objectId.toLowerCase().includes(search))
    );
  }

  const total = allRecords.length;
  const startIndex = (page - 1) * limit;
  const recordsSlice = allRecords.slice(startIndex, startIndex + limit);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    records: recordsSlice
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Orbit Ledger REST API Server`);
    console.log(`Listening on: http://localhost:${PORT}`);
    console.log(`Chain Height: ${chain.getHeight()} blocks`);
    console.log(`========================================\n`);
  });
}

module.exports = { app, chain, pbftConsortium, utxoLedger, oracle };
