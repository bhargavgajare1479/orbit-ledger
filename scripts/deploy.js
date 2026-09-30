const fs = require('fs');
const path = require('path');
const { ethers, network } = require('hardhat');

async function main() {
  console.log(`\n========================================`);
  console.log(`Deploying Orbit Ledger Smart Contracts`);
  console.log(`Target Network: ${network.name} (Chain ID: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log(`========================================\n`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account Balance: ${ethers.formatEther(balance)} ETH\n`);

  // 1. Deploy DataCredit (ERC20)
  console.log(`Deploying DataCredit (ODC)...`);
  const DataCreditFactory = await ethers.getContractFactory('DataCredit');
  const dataCredit = await DataCreditFactory.deploy();
  await dataCredit.waitForDeployment();
  const dataCreditAddress = await dataCredit.getAddress();
  console.log(`✓ DataCredit deployed at: ${dataCreditAddress}`);

  // 2. Deploy AlertCertificate (ERC721)
  console.log(`Deploying AlertCertificate (OCC)...`);
  const CertFactory = await ethers.getContractFactory('AlertCertificate');
  const alertCert = await CertFactory.deploy();
  await alertCert.waitForDeployment();
  const alertCertAddress = await alertCert.getAddress();
  console.log(`✓ AlertCertificate deployed at: ${alertCertAddress}`);

  // 3. Deploy DebrisLedger
  console.log(`Deploying DebrisLedger...`);
  const accessFee = ethers.parseUnits('100', 18);
  const DebrisLedgerFactory = await ethers.getContractFactory('DebrisLedger');
  const debrisLedger = await DebrisLedgerFactory.deploy(dataCreditAddress, accessFee);
  await debrisLedger.waitForDeployment();
  const debrisLedgerAddress = await debrisLedger.getAddress();
  console.log(`✓ DebrisLedger deployed at: ${debrisLedgerAddress}`);

  // 4. Deploy ConjunctionMonitor (threshold: 50,000 m = 50 km)
  console.log(`Deploying ConjunctionMonitor...`);
  const initialThresholdMetres = 50000;
  const MonitorFactory = await ethers.getContractFactory('ConjunctionMonitor');
  const conjunctionMonitor = await MonitorFactory.deploy(alertCertAddress, initialThresholdMetres);
  await conjunctionMonitor.waitForDeployment();
  const conjunctionMonitorAddress = await conjunctionMonitor.getAddress();
  console.log(`✓ ConjunctionMonitor deployed at: ${conjunctionMonitorAddress}`);

  // 5. Configure cross-contract permissions
  console.log(`\nConfiguring cross-contract permissions...`);
  const linkTx = await alertCert.setMonitorContract(conjunctionMonitorAddress);
  await linkTx.wait();
  console.log(`✓ AlertCertificate linked to ConjunctionMonitor`);

  // Authorize demo consortium operator addresses on Ganache
  const demoOperators = [
    '0x0a70f9F1f5fDDc0c34b8Bb44463bd0204b8af922', // Node 1
    '0x9cabC088914b391B7EB9f8CfE4fE2d7f01d432d5', // Node 2
    '0xa4e24D1e363fb45f5A43A838Ce547B36F4Bea4d2', // Node 3
    '0x1efEb9163C90B96FEe44FBb9c0aE7920E67101ab'  // Node 4
  ];

  for (const op of demoOperators) {
    if (network.name === 'ganache' || network.name === 'localhost') {
      await (await debrisLedger.setOperator(op, true)).wait();
      await (await conjunctionMonitor.setOracle(op, true)).wait();
      // Allocate 10,000 ODC to each operator for testing
      await (await dataCredit.transfer(op, ethers.parseUnits('10000', 18))).wait();
    }
  }
  console.log(`✓ Consortium operator roles and initial ODC tokens configured`);

  // 6. Write deployment file
  const deploymentsDir = path.resolve(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DataCredit: dataCreditAddress,
      AlertCertificate: alertCertAddress,
      DebrisLedger: debrisLedgerAddress,
      ConjunctionMonitor: conjunctionMonitorAddress
    },
    parameters: {
      accessFeeODC: '100',
      initialThresholdMetres: initialThresholdMetres
    }
  };

  const deploymentFilePath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentData, null, 2), 'utf8');
  console.log(`\nDeployment details successfully saved to: ${deploymentFilePath}`);
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exitCode = 1;
});
