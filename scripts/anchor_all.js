const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const { Blockchain } = require('../chain/blockchain');

async function anchorAll(networkName = 'ganache') {
  console.log(`Anchoring Layer A block roots to ${networkName}...`);

  const depPath = path.resolve(__dirname, `../deployments/${networkName}.json`);
  if (!fs.existsSync(depPath)) {
    throw new Error(`Deployment file ${depPath} not found`);
  }
  const dep = JSON.parse(fs.readFileSync(depPath, 'utf8'));

  const chain = new Blockchain();
  const seedPath = path.resolve(__dirname, '../data/seed_records.json');
  chain.loadFromSeed(seedPath);

  const rpcUrl = networkName === 'ganache' ? 'http://127.0.0.1:8545' : process.env.SEPOLIA_RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const pk = networkName === 'ganache'
    ? '0x0b2a7160eb4331b67497d20eed8c9e68e6f16ab43088571fcba19fce91f69a24'
    : process.env.SEPOLIA_PRIVATE_KEY;
  const signer = new ethers.Wallet(pk, provider);

  const dlAbi = [
    'function anchorRoot(uint256 blockIndex, bytes32 root, uint256 recordCount, uint256 blockTimestamp) external',
    'function anchors(uint256 blockIndex) external view returns (bytes32 merkleRoot, uint256 recordCount, uint256 blockTimestamp, uint256 anchoredAt, address anchoredBy)'
  ];
  const contract = new ethers.Contract(dep.contracts.DebrisLedger, dlAbi, signer);

  let currentNonce = await provider.getTransactionCount(signer.address);

  for (let i = 1; i <= chain.getHeight(); i++) {
    const existing = await contract.anchors(i);
    if (existing.anchoredAt !== 0n) {
      continue; // Already anchored
    }

    const b = chain.getBlock(i);
    const rootHex = `0x${b.header.merkleRoot}`;
    const tx = await contract.anchorRoot(i, rootHex, b.records.length, b.header.timestamp, { nonce: currentNonce++ });
    await tx.wait();
    process.stdout.write(`.`);
  }

  console.log(`\n✓ All ${chain.getHeight()} block roots successfully anchored on-chain.`);
}

if (require.main === module) {
  anchorAll(process.argv[2] || 'ganache').catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { anchorAll };
