const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const HashStorage = await hre.ethers.getContractFactory("HashStorage");
  const hashStorage = await HashStorage.deploy();
  await hashStorage.waitForDeployment();

  const SkillWallet = await hre.ethers.getContractFactory("SkillWallet");
  const skillWallet = await SkillWallet.deploy(hashStorage.target);
  await skillWallet.waitForDeployment();

  console.log("HashStorage deployed to:", hashStorage.target);
  console.log("SkillWallet  deployed to:", skillWallet.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
