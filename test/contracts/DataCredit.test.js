const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataCredit (ODC) Token Contract", function () {
  let dataCredit;
  let owner, operator1, operator2;

  beforeEach(async function () {
    [owner, operator1, operator2] = await ethers.getSigners();
    const DataCreditFactory = await ethers.getContractFactory("DataCredit");
    dataCredit = await DataCreditFactory.deploy();
    await dataCredit.waitForDeployment();
  });

  it("Mints initial 1,000,000 ODC supply to deployer", async function () {
    const balance = await dataCredit.balanceOf(owner.address);
    const expected = ethers.parseUnits("1000000", 18);
    expect(balance).to.equal(expected);
    expect(await dataCredit.name()).to.equal("Orbit Data Credit");
    expect(await dataCredit.symbol()).to.equal("ODC");
    expect(await dataCredit.decimals()).to.equal(18);
  });

  it("Transfers tokens between operators correctly", async function () {
    const amount = ethers.parseUnits("500", 18);
    await dataCredit.transfer(operator1.address, amount);
    expect(await dataCredit.balanceOf(operator1.address)).to.equal(amount);

    await dataCredit.connect(operator1).transfer(operator2.address, ethers.parseUnits("200", 18));
    expect(await dataCredit.balanceOf(operator2.address)).to.equal(ethers.parseUnits("200", 18));
    expect(await dataCredit.balanceOf(operator1.address)).to.equal(ethers.parseUnits("300", 18));
  });

  it("Handles allowances and transferFrom correctly", async function () {
    const amount = ethers.parseUnits("100", 18);
    await dataCredit.transfer(operator1.address, amount);

    await dataCredit.connect(operator1).approve(operator2.address, amount);
    expect(await dataCredit.allowance(operator1.address, operator2.address)).to.equal(amount);

    await dataCredit.connect(operator2).transferFrom(operator1.address, operator2.address, amount);
    expect(await dataCredit.balanceOf(operator2.address)).to.equal(amount);
    expect(await dataCredit.balanceOf(operator1.address)).to.equal(0);
  });

  it("Allows owner to mint additional demo tokens", async function () {
    const mintAmount = ethers.parseUnits("10000", 18);
    await dataCredit.mint(operator1.address, mintAmount);
    expect(await dataCredit.balanceOf(operator1.address)).to.equal(mintAmount);

    // Non-owner cannot mint
    await expect(
      dataCredit.connect(operator1).mint(operator1.address, mintAmount)
    ).to.be.revertedWithCustomError(dataCredit, "OwnableUnauthorizedAccount");
  });
});
