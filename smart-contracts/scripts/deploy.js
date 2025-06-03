// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 获取用于部署的签名账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 部署 SkillWallet 合约
  const SkillWallet = await hre.ethers.getContractFactory("SkillWallet");
  const skillWallet = await SkillWallet.deploy();
  await skillWallet.waitForDeployment();

  const contractAddress = await skillWallet.getAddress();
  console.log("SkillWallet deployed to:", contractAddress);

  // 保存合约地址到文件
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    network: hre.network.name
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);

  // 也保存到前端可以访问的位置
  const frontendPath = path.join(__dirname, "../../frontend/src/contracts/deployment.json");
  const frontendDir = path.dirname(frontendPath);
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  fs.writeFileSync(frontendPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info also saved to:", frontendPath);

  // 同时保存到public目录供HTTP访问
  const publicPath = path.join(__dirname, "../../frontend/public/deployment.json");
  fs.writeFileSync(publicPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info also saved to public:", publicPath);
}

// 在顶层调用 main()
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
