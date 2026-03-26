import { expect } from "chai";
import { network } from "hardhat";

describe("Escrow", function() {

  async function deployFixture() {
    const { ethers } = await network.connect();
    const [owner, learner, tutor, other] = await ethers.getSigners();

    const INITIAL_SUPPLY = ethers.parseEther("1000");

    const scx: any = await ethers.deployContract("SkillCredit", [INITIAL_SUPPLY]);

    await scx.transfer(learner.address, ethers.parseEther("200"));

    const escrow: any = await ethers.deployContract(
      "Escrow",
      [await scx.getAddress()]
    );

    return { ethers, scx, escrow, owner, learner, tutor, other };
  }

  it("should create session and lock funds", async function() {
    const { scx, escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await scx.connect(learner).approve(await escrow.getAddress(), amount);

    await escrow.connect(learner).createSession(tutor.address, amount);

    const session = await escrow.sessions(0);

    expect(session.learner).to.equal(learner.address);
    expect(session.tutor).to.equal(tutor.address);
    expect(session.amount).to.equal(amount);

    expect(await scx.balanceOf(await escrow.getAddress())).to.equal(amount);
  });

  it("should fail without approval", async function() {
    const { escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await expect(
      escrow.connect(learner).createSession(tutor.address, amount)
    ).to.be.reverted;
  });

  it("should release funds to tutor on completion", async function() {
    const { scx, escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await scx.connect(learner).approve(await escrow.getAddress(), amount);
    await escrow.connect(learner).createSession(tutor.address, amount);

    await escrow.connect(learner).completeSession(0);

    expect(await scx.balanceOf(tutor.address)).to.equal(amount);
  });

  it("should not allow non-learner to complete", async function() {
    const { escrow, tutor } = await deployFixture();

    await expect(
      escrow.connect(tutor).completeSession(0)
    ).to.be.revertedWith("Only learner can complete");
  });

  it("should refund learner", async function() {
    const { scx, escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await scx.connect(learner).approve(await escrow.getAddress(), amount);
    await escrow.connect(learner).createSession(tutor.address, amount);

    await escrow.connect(tutor).refundSession(0);

    expect(await scx.balanceOf(learner.address))
      .to.equal(ethers.parseEther("200"));
  });

  it("should not allow non-tutor to refund", async function() {
    const { escrow, learner } = await deployFixture();

    await expect(
      escrow.connect(learner).refundSession(0)
    ).to.be.revertedWith("Only tutor can refund");
  });

  it("should not allow completing twice", async function() {
    const { scx, escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await scx.connect(learner).approve(await escrow.getAddress(), amount);
    await escrow.connect(learner).createSession(tutor.address, amount);

    await escrow.connect(learner).completeSession(0);

    await expect(
      escrow.connect(learner).completeSession(0)
    ).to.be.revertedWith("Already completed");
  });

  it("should not allow refund after completion", async function() {
    const { scx, escrow, learner, tutor, ethers } = await deployFixture();

    const amount = ethers.parseEther("100");

    await scx.connect(learner).approve(await escrow.getAddress(), amount);
    await escrow.connect(learner).createSession(tutor.address, amount);

    await escrow.connect(learner).completeSession(0);

    await expect(
      escrow.connect(tutor).refundSession(0)
    ).to.be.revertedWith("Already completed");
  });

});
