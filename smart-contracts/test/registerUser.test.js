// test/registerUser.test.js

const { expect } = require("chai");           // 断言库 (Assertion Library)
const { ethers } = require("hardhat");        // Hardhat 运行时环境 (HRE)

describe("SkillWallet Contract Tests", function () {
  let skill, owner, other;

  beforeEach(async function () {
    // 获取两个测试账户 (Get two signers)
    [owner, other] = await ethers.getSigners();

    // 编译并部署合约 (Deploy Contract)
    const Skill = await ethers.getContractFactory("SkillWallet");
    skill = await Skill.deploy();
    await skill.waitForDeployment();  // ethers v6: waitForDeployment
  });

  it("should store user info correctly", async function () {
    const nowSec   = Math.floor(Date.now() / 1000);
    const uid      = "T-3SMC5IMtuOfYU26KKK0v4l6T8e62";
    const email    = "test@example.com";
    const name     = "test";
    const role     = "school";
    const schoolId = "qut";

    // owner 调用 registerUser
    await skill.registerUser(
      nowSec,
      uid,
      email,
      name,
      role,
      schoolId
    );

    // 只有注册者 owner 可以读取
    const info = await skill.getUserInfo(uid);

    expect(info.createdAt).to.equal(nowSec);
    expect(info.customUid).to.equal(uid);
    expect(info.email).to.equal(email);
    expect(info.name).to.equal(name);
    expect(info.role).to.equal(role);
    expect(info.schoolId).to.equal(schoolId);
    expect(info.walletAddress).to.equal(owner.address);
    expect(info.ipfsHash).to.equal("");
  });

  it("non-owner cannot read", async function () {
    const nowSec = Math.floor(Date.now() / 1000);
    const uid    = "T-3SMC5IMtuOfYU26KKK0v4l6T8e62";

    await skill.registerUser(
      nowSec,
      uid,
      "a@b.com",
      "A",
      "student",
      "qut"
    );

    // other 尝试读取，预期 revert
    await expect(
      skill.connect(other).getUserInfo(uid)
    ).to.be.revertedWith("no permission");
  });

  it("cannot read non-existent user", async function () {
    await expect(
      skill.getUserInfo("non-existent-uid")
    ).to.be.revertedWith("no permission");
  });
});
