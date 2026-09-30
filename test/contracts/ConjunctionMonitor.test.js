const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConjunctionMonitor and AlertCertificate Contracts", function () {
  let monitor, certificate;
  let owner, oracle, operator, attacker;
  const initialThreshold = 50000; // 50 km in metres

  beforeEach(async function () {
    [owner, oracle, operator, attacker] = await ethers.getSigners();

    // Deploy AlertCertificate
    const CertFactory = await ethers.getContractFactory("AlertCertificate");
    certificate = await CertFactory.deploy();
    await certificate.waitForDeployment();

    // Deploy ConjunctionMonitor
    const MonitorFactory = await ethers.getContractFactory("ConjunctionMonitor");
    monitor = await MonitorFactory.deploy(await certificate.getAddress(), initialThreshold);
    await monitor.waitForDeployment();

    // Link certificate to monitor
    await certificate.setMonitorContract(await monitor.getAddress());

    // Authorize oracle
    await monitor.setOracle(oracle.address, true);
  });

  it("Configures initial threshold and permits authorized oracle reporting", async function () {
    expect(await monitor.getThresholdMetres()).to.equal(initialThreshold);
    expect(await monitor.authorizedOracles(oracle.address)).to.equal(true);
    expect(await monitor.authorizedOracles(attacker.address)).to.equal(false);
  });

  it("Rejects reports from unauthorized accounts", async function () {
    const pos1 = [1000000, 2000000, 3000000];
    const pos2 = [1000000, 2000000, 3010000]; // 10 km separation

    await expect(
      monitor.connect(attacker).reportConjunction(34376, 34634, 1782864000, pos1, pos2)
    ).to.be.revertedWithCustomError(monitor, "UnauthorizedOracle");
  });

  it("Accepts conjunction within threshold and mints ERC721 AlertCertificate", async function () {
    // 30 km delta on Z axis: sqrt(0 + 0 + 30,000^2) = 30,000 m (< 50,000 m threshold)
    const pos1 = [1000000, 2000000, 3000000];
    const pos2 = [1000000, 2000000, 3030000];
    const epoch = 1782864000;
    const obj1 = 34376;
    const obj2 = 34634;

    const tx = await monitor.connect(oracle).reportConjunction(obj1, obj2, epoch, pos1, pos2);
    await expect(tx).to.emit(monitor, "ConjunctionDetected");

    // Check certificate token #1 was minted to oracle
    expect(await certificate.balanceOf(oracle.address)).to.equal(1);
    expect(await certificate.ownerOf(1)).to.equal(oracle.address);

    const certData = await certificate.getCertificate(1);
    expect(certData.object1Id).to.equal(obj1);
    expect(certData.object2Id).to.equal(obj2);
    expect(certData.epoch).to.equal(epoch);
    expect(certData.missDistanceMetres).to.equal(30000);
    expect(certData.thresholdMetres).to.equal(50000);
  });

  it("Accepts conjunction exactly at the threshold distance", async function () {
    // Exactly 50,000 metres
    const pos1 = [0, 0, 0];
    const pos2 = [0, 0, 50000];
    const epoch = 1782864100;

    const tx = await monitor.connect(oracle).reportConjunction(34376, 34634, epoch, pos1, pos2);
    await expect(tx).to.emit(monitor, "ConjunctionDetected");
    expect(await certificate.balanceOf(oracle.address)).to.equal(1);
  });

  it("Rejects conjunction when miss distance exceeds the threshold", async function () {
    // 50,001 metres (> 50,000 m threshold)
    const pos1 = [0, 0, 0];
    const pos2 = [0, 0, 50001];
    const epoch = 1782864200;

    await expect(
      monitor.connect(oracle).reportConjunction(34376, 34634, epoch, pos1, pos2)
    ).to.be.revertedWithCustomError(monitor, "DistanceExceedsThreshold");
  });

  it("Rejects duplicate conjunction report for identical pair and epoch", async function () {
    const pos1 = [0, 0, 0];
    const pos2 = [0, 0, 20000];
    const epoch = 1782864300;

    // First submission succeeds
    await monitor.connect(oracle).reportConjunction(34376, 34634, epoch, pos1, pos2);

    // Second submission with exact same pair and epoch must revert
    await expect(
      monitor.connect(oracle).reportConjunction(34376, 34634, epoch, pos1, pos2)
    ).to.be.revertedWithCustomError(monitor, "ConjunctionAlreadyReported");

    // Also test swapped object order (34634, 34376) - canonical sorting must catch it!
    await expect(
      monitor.connect(oracle).reportConjunction(34634, 34376, epoch, pos1, pos2)
    ).to.be.revertedWithCustomError(monitor, "ConjunctionAlreadyReported");
  });
});
