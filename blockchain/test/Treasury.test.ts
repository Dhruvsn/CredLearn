import { expect } from "chai";
import { network } from "hardhat";

describe("Treasury", function() {

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, user1, user2] = await ethers.getSigners();

    const INITIAL_SUPPLY = ethers.parseEther("1000");

    // Deploy SCX
    const scx = await ethers.deployContract("SkillCredit", [INITIAL_SUPPLY]);

    // Deploy Treasury
    const treasury = await ethers.deployContract("Treasury", [await scx.getAddress()]);

    // Transfer ownership of SCX → Treasury (CRITICAL)
    await scx.transferOwnership(await treasury.getAddress());

    return { ethers, scx, treasury, owner, user1, user2, INITIAL_SUPPLY };
  }

  // 🔹 Deployment
  it("should set correct SCX token address", async function() {
    const { scx, treasury } = await deployFixture();

    expect(await treasury.scxToken()).to.equal(await scx.getAddress());
  });

  // 🔹 Reward Tutor
  it("should reward tutor by minting tokens", async function() {
    const { treasury, scx, user1, ethers } = await deployFixture();

    const reward = ethers.parseEther("100");

    await treasury.rewardTutor(user1.address, reward);

    expect(await scx.balanceOf(user1.address)).to.equal(reward);
  });

  it("should NOT allow non-owner to reward tutor", async function() {
    const { treasury, user1 } = await deployFixture();

    await expect(
      treasury.connect(user1).rewardTutor(user1.address, 100n)
    ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
  });

  // 🔹 Reward with Fee
  it("should distribute reward with fee correctly", async function() {
    const { treasury, scx, user1, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await treasury.rewardTutorWithFee(user1.address, amount);

    const expectedTutorAmount = ethers.parseEther("95"); // 5% fee
    const expectedFee = ethers.parseEther("5");

    expect(await scx.balanceOf(user1.address)).to.equal(expectedTutorAmount);
    expect(await scx.balanceOf(await treasury.getAddress())).to.equal(expectedFee);
  });

  // 🔹 Fee Update
  it("should update platform fee", async function() {
    const { treasury } = await deployFixture();

    await treasury.setPlatformFee(10);

    expect(await treasury.platformFeePercent()).to.equal(10);
  });

  it("should NOT allow fee > 20%", async function() {
    const { treasury } = await deployFixture();

    await expect(
      treasury.setPlatformFee(25)
    ).to.be.revertedWith("Fee too high");
  });

  // 🔹 Withdraw Fees
  it("should allow owner to withdraw fees", async function() {
    const { treasury, scx, user1, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    // Generate fees first
    await treasury.rewardTutorWithFee(user1.address, amount);

    const feeBalance = await scx.balanceOf(await treasury.getAddress());

    await treasury.withdrawFees(user1.address, feeBalance);

    expect(await scx.balanceOf(user1.address))
      .to.equal(ethers.parseEther("95") + feeBalance);
  });

  it("should NOT allow non-owner to withdraw fees", async function() {
    const { treasury, user1 } = await deployFixture();

    await expect(
      treasury.connect(user1).withdrawFees(user1.address, 100n)
    ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
  });

});
