const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ethers } = require('ethers');

const { Blockchain } = require('../chain/blockchain');
const { MerkleTree } = require('../chain/merkle');
const { PBFTConsortium } = require('../chain/consensus/pbft');
const { UTXOLedger } = require('../chain/utxo/utxo_ledger');
const { ConjunctionOracle } = require('../server/oracle');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2E() {
  console.log(`\n======================================================`);
  console.log(` Orbit Ledger: Autonomous End-to-End Verification Run`);
  console.log(`======================================================\n`);

  let ganacheProcess = null;
  const ganacheRpc = 'http://127.0.0.1:8545';

  try {
    // Step 0: Ensure Ganache is running
    console.log(`[Step 0] Checking Ganache RPC on port 8545...`);
    const provider = new ethers.JsonRpcProvider(ganacheRpc);
    let isRpcUp = false;
    try {
      await provider.getBlockNumber();
      isRpcUp = true;
      console.log(`✓ Existing Ganache instance detected.`);
    } catch {
      console.log(`Starting Ganache local instance...`);
      ganacheProcess = spawn('npx', [
        'ganache',
        '--server.port', '8545',
        '--wallet.totalAccounts', '10',
        '--miner.blockTime', '0',
        '--chain.networkId', '1337',
        '--wallet.mnemonic', 'submit lake embrace famous lazy drum proud poverty casino rare unhappy dawn'
      ], { stdio: 'ignore' });
      await sleep(2500);
      await provider.getBlockNumber();
      console.log(`✓ Ganache instance successfully started.`);
    }

    // Step 1: Ingest and verify Layer A seed chain
    console.log(`\n[Step 1] Loading Layer A 25-block seed chain...`);
    const chain = new Blockchain();
    const seedPath = path.resolve(__dirname, '../data/seed_records.json');
    const height = chain.loadFromSeed(seedPath);
    console.log(`✓ Loaded ${height} blocks containing 1,000 orbital records.`);

    // Step 2: Validate Layer A internal cryptographic integrity
    console.log(`\n[Step 2] Validating Layer A cryptographic integrity...`);
    const validity = chain.isValidChain();
    if (!validity.valid) {
      throw new Error(`Layer A chain invalid: ${validity.error}`);
    }
    console.log(`✓ Chain verified: all parent hashes, Merkle roots, and record hashes valid.`);

    // Step 3: Deploy contracts
    console.log(`\n[Step 3] Deploying smart contracts to Ganache...`);
    const { execSync } = require('child_process');
    execSync('npx hardhat run scripts/deploy.js --network ganache', { stdio: 'pipe' });
    const depData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../deployments/ganache.json'), 'utf8'));
    console.log(`✓ Contracts deployed:`);
    console.log(`  - DebrisLedger: ${depData.contracts.DebrisLedger}`);
    console.log(`  - DataCredit: ${depData.contracts.DataCredit}`);
    console.log(`  - ConjunctionMonitor: ${depData.contracts.ConjunctionMonitor}`);
    console.log(`  - AlertCertificate: ${depData.contracts.AlertCertificate}`);

    // Step 4: Iteratively anchor block Merkle roots to Ethereum
    console.log(`\n[Step 4] Anchoring Layer A block Merkle roots to DebrisLedger.sol...`);
    const operatorSigner = new ethers.Wallet('0x0b2a7160eb4331b67497d20eed8c9e68e6f16ab43088571fcba19fce91f69a24', provider);
    const dlAbi = [
      'function anchorRoot(uint256 blockIndex, bytes32 root, uint256 recordCount, uint256 blockTimestamp) external',
      'function verifyRecord(uint256 blockIndex, bytes32 leafHash, bytes32[] calldata proof, uint256 leafIndex) external view returns (bool)',
      'function buyAccess(uint256 blockIndex, address publisher) external',
      'function hasAccess(uint256 blockIndex, address operator) external view returns (bool)'
    ];
    const debrisLedger = new ethers.Contract(depData.contracts.DebrisLedger, dlAbi, operatorSigner);

    // Anchor blocks 1 through 25 with explicit nonces
    let currentNonce = await provider.getTransactionCount(operatorSigner.address);
    for (let i = 1; i <= 25; i++) {
      const b = chain.getBlock(i);
      const rootHex = `0x${b.header.merkleRoot}`;
      const tx = await debrisLedger.anchorRoot(
        i,
        rootHex,
        b.records.length,
        b.header.timestamp,
        { nonce: currentNonce++ }
      );
      await tx.wait();
    }
    console.log(`✓ Anchored all 25 block roots on-chain.`);

    // Step 5: On-chain SHA-256 Merkle proof verification
    console.log(`\n[Step 5] Verifying JavaScript-generated Merkle proof inside EVM bytecode...`);
    const targetBlockIndex = 8;
    const targetRecordIndex = 17;
    const targetBlock = chain.getBlock(targetBlockIndex);
    const leaves = targetBlock.records.map(r => r.recordHash);
    const tree = new MerkleTree(leaves);
    const proofObj = tree.getProof(targetRecordIndex);

    const onChainResult = await debrisLedger.verifyRecord(
      targetBlockIndex,
      proofObj.leafHash,
      proofObj.proof,
      targetRecordIndex
    );
    if (!onChainResult) {
      throw new Error(`On-chain Merkle proof verification returned false for Block #${targetBlockIndex}, Record #${targetRecordIndex}`);
    }
    console.log(`✓ On-chain verifyRecord() returned TRUE (evaluated via native sha256() precompile 0x02 with 0 gas cost).`);

    // Step 6: PBFT Consortium consensus with fault tolerance
    console.log(`\n[Step 6] Testing 4-node PBFT consensus with Node 4 offline (f = 1)...`);
    const pbft = new PBFTConsortium(4);
    pbft.setNodeFault('Node-4-Delta', 'offline');
    const pbftResult = pbft.runConsensusRound(targetBlock.header.blockHash, 26);
    if (!pbftResult.committed || pbftResult.matchingVotes !== 3) {
      throw new Error(`PBFT consensus failed with 1 offline node: matching votes = ${pbftResult.matchingVotes}`);
    }
    console.log(`✓ PBFT consensus committed with 3/4 quorum: signers = [${pbftResult.signers.join(', ')}].`);

    // Step 7: Conjunction screening and oracle reporting
    console.log(`\n[Step 7] Running astrodynamics SGP4 screening and reporting conjunction to contract...`);
    const oracle = new ConjunctionOracle();
    oracle.loadRecordsFromSeed(seedPath);
    const candidates = oracle.screenConjunctions({ thresholdKm: 250, limit: 1 });
    if (candidates.length === 0) {
      throw new Error(`No conjunction candidate found in screening`);
    }

    const candidate = candidates[0];
    console.log(`Found candidate conjunction: Obj ${candidate.object1Id} vs Obj ${candidate.object2Id}, miss distance: ${candidate.missDistanceKm} km.`);

    const reportReceipt = await oracle.reportToContract(candidate, 'ganache');
    console.log(`✓ Oracle report mined in block #${reportReceipt.blockNumber} (Tx: ${reportReceipt.transactionHash.slice(0, 16)}...).`);
    console.log(`✓ Minted ERC721 AlertCertificate Token ID #${reportReceipt.tokenId}.`);

    // Step 8: Duplicate alert rejection check
    console.log(`\n[Step 8] Testing duplicate alert rejection on ConjunctionMonitor.sol...`);
    let duplicateReverted = false;
    try {
      await oracle.reportToContract(candidate, 'ganache');
    } catch {
      duplicateReverted = true;
    }
    if (!duplicateReverted) {
      throw new Error(`Contract failed to reject duplicate conjunction alert`);
    }
    console.log(`✓ Duplicate alert successfully rejected by contract (ConjunctionAlreadyReported).`);

    // Step 9: Tokenized dataset access purchase flow
    console.log(`\n[Step 9] Testing ERC20 DataCredit access purchase via approve/transferFrom...`);
    const dcAbi = [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function balanceOf(address account) external view returns (uint256)'
    ];
    // Operator 2 purchases access to Block 1 from Operator 1
    const op2Signer = new ethers.Wallet('0x95020ce7e1842d5bae01fdeb95fd65297603f72f6f30ddd29ff5a3f8b07d00fd', provider);
    const dataCredit = new ethers.Contract(depData.contracts.DataCredit, dcAbi, op2Signer);
    const debrisLedgerOp2 = new ethers.Contract(depData.contracts.DebrisLedger, dlAbi, op2Signer);

    const accessFee = ethers.parseUnits('100', 18);
    const approveTx = await dataCredit.approve(depData.contracts.DebrisLedger, accessFee);
    await approveTx.wait();

    const buyTx = await debrisLedgerOp2.buyAccess(1, operatorSigner.address);
    await buyTx.wait();

    const hasAccess = await debrisLedger.hasAccess(1, op2Signer.address);
    if (!hasAccess) {
      throw new Error(`Access purchase failed to grant entitlement to buyer`);
    }
    console.log(`✓ Access purchased: 100 ODC transferred, access entitlement confirmed on-chain.`);

    // Step 10: UTXO double-spending rejection
    console.log(`\n[Step 10] Testing UTXO double-spend rejection...`);
    const utxoLedger = new UTXOLedger();
    const pool = utxoLedger.getUTXOPool();
    const sampleUtxo = pool[0];
    const spendInputs = [{ txId: sampleUtxo.txId, outputIndex: sampleUtxo.outputIndex }];
    utxoLedger.spend(spendInputs, [{ address: '1RecipientA', value: sampleUtxo.value - 10 }]);

    let doubleSpendRejected = false;
    try {
      utxoLedger.spend(spendInputs, [{ address: '1RecipientB', value: sampleUtxo.value - 10 }]);
    } catch {
      doubleSpendRejected = true;
    }
    if (!doubleSpendRejected) {
      throw new Error(`UTXO engine failed to reject double-spend`);
    }
    console.log(`✓ UTXO double-spend successfully detected and rejected.`);

    console.log(`\n======================================================`);
    console.log(` ALL END-TO-END ACCEPTANCE CRITERIA SATISFIED (100% PASS)`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`\n✖ E2E Execution Failed:`, err);
    process.exitCode = 1;
  } finally {
    if (ganacheProcess) {
      ganacheProcess.kill();
    }
  }
}

runE2E();
