import { expect } from "chai";
import { network } from "hardhat";

describe("SkillCredit (SCX)", function() {

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, user1, user2] = await ethers.getSigners();

    const INITIAL_SUPPLY = ethers.parseEther("1000");

    const scx = await ethers.deployContract("SkillCredit", [INITIAL_SUPPLY]);

    return { ethers, scx, owner, user1, user2, INITIAL_SUPPLY };
  }

  // 🔹 Deployment
  it("should set name and symbol", async function() {
    const { scx } = await deployFixture();

    expect(await scx.name()).to.equal("SkillCredit");
    expect(await scx.symbol()).to.equal("SCX");
  });

  it("should assign initial supply to owner", async function() {
    const { scx, owner, INITIAL_SUPPLY } = await deployFixture();

    expect(await scx.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
  });

  // 🔹 Transfers
  it("should transfer tokens", async function() {
    const { scx, user1, ethers } = await deployFixture();

    await scx.transfer(user1.address, ethers.parseEther("100"));

    expect(await scx.balanceOf(user1.address))
      .to.equal(ethers.parseEther("100"));
  });

  it("should revert on insufficient balance", async function() {
    const { scx, user1, user2 } = await deployFixture();

    await expect(
      scx.connect(user1).transfer(user2.address, 1n)
    ).to.be.revertedWithCustomError(scx, "ERC20InsufficientBalance");
  });

  // 🔹 Minting
  it("owner can mint", async function() {
    const { scx, user1, ethers } = await deployFixture();

    await scx.mint(user1.address, ethers.parseEther("50"));

    expect(await scx.balanceOf(user1.address))
      .to.equal(ethers.parseEther("50"));
  });

  it("non-owner cannot mint", async function() {
    const { scx, user1 } = await deployFixture();

    await expect(
      scx.connect(user1).mint(user1.address, 100n)
    ).to.be.revertedWithCustomError(scx, "OwnableUnauthorizedAccount");
  });

  // 🔹 Burning
  it("user can burn tokens", async function() {
    const { scx, user1, ethers } = await deployFixture();

    await scx.transfer(user1.address, ethers.parseEther("100"));

    await scx.connect(user1).burn(ethers.parseEther("40"));

    expect(await scx.balanceOf(user1.address))
      .to.equal(ethers.parseEther("60"));
  });

});
