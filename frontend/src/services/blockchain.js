import { JsonRpcProvider, Wallet, Contract } from "ethers"; // ** 修改：使用 ethers v6 命名导出 **
// ** 确保 SkillWalletABI.json 与此文件在同一目录下 **
import skillWalletAbi from "./SkillWalletABI.json";

const RPC_URL     = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8550";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY || "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Ganache默认私钥

// 动态获取合约地址
async function getContractAddress() {
  try {
    // 使用fetch获取部署文件
    const response = await fetch('/deployment.json');
    if (response.ok) {
      const deploymentInfo = await response.json();
      // console.log('📄 使用部署文件中的合约地址:', deploymentInfo.contractAddress);
      return deploymentInfo.contractAddress;
    }
  } catch (error) {
    // console.log('📄 未找到部署文件，使用默认合约地址');
  }
  
  // 回退到环境变量或默认地址
  return import.meta.env.VITE_CONTRACT_ADDRESS || '0x684cAd7dd32a3B3593d7a0F0457DeCde66EAF0D1';
}

// ** 修改：使用 JsonRpcProvider **
const provider = new JsonRpcProvider(RPC_URL);
// ** 修改：使用 Wallet **
const wallet   = new Wallet(PRIVATE_KEY, provider);

/**
 * 注册学生后在链上调用 registerStudent()
 * ** 新增函数 **
 */
export async function registerStudentOnChain(
  customUid,
  email,
  name,
  schoolId,
  walletAddress
) {
  const contractAddress = await getContractAddress();
  const contract = new Contract(contractAddress, skillWalletAbi, wallet);
  
  const tx = await contract.registerStudent(
    customUid,
    email,
    name,
    schoolId,
    walletAddress,
    { gasLimit: 200_000 }
  );
  const receipt = await tx.wait();
  // console.log("registerStudent txHash:", receipt.transactionHash);
  return receipt.transactionHash;
}

/**
 * 技能审批后在链上调用 recordSkill()
 * ** 新增函数 **
 */
export async function recordSkillOnChain(
  customUid,
  courseCode,
  courseTitle,
  hardSkillNames,
  hardSkillScores,
  level,
  ownerId,
  reviewedAt,
  reviewedBy,
  schoolId,
  cid
) {
  // console.log("Attempting to record skill on chain with data:", 
  //   JSON.stringify({ customUid, courseCode, courseTitle, hardSkillNames, hardSkillScores, level, ownerId, reviewedAt, reviewedBy, schoolId, cid }, null, 2)
  // );
  // console.log(" upload CID =", cid);
  const contractAddress = await getContractAddress();
  // console.log("📄 Using contract address for recordSkill:", contractAddress);
  const contract = new Contract(contractAddress, skillWalletAbi, wallet);
  
  try {
    console.log("🚀 Attempting to call contract.recordSkill...");
    console.log("📊 Contract instance:", contract);
    console.log("📊 Contract address:", await contract.getAddress());
    
    const tx = await contract.recordSkill(
      customUid,
      courseCode,
      courseTitle,
      hardSkillNames,
      hardSkillScores,
      level,
      ownerId,
      reviewedAt, // Ensure this is a number (seconds timestamp)
      reviewedBy,
      schoolId,
      cid,
      { gasLimit: 600000 } // Increased gas limit just in case
    );
    console.log("📤 Transaction sent, tx:", tx);
    console.log("📤 Transaction type:", typeof tx);
    console.log("📤 Transaction hash:", tx?.hash);
    console.log("📤 Transaction wait method:", typeof tx?.wait);
    console.log("⏳ Waiting for transaction receipt...");

    if (!tx || typeof tx.wait !== 'function') {
      throw new Error("Invalid transaction object returned from contract call");
    }

    const receipt = await tx.wait(1); // Wait for 1 confirmation
    
    // console.log("🧾 Full transaction receipt:", receipt);
    // console.log("📦 Receipt status:", receipt.status);

    if (receipt.status === 1) {
      // console.log("✅ Transaction successful! Using initial tx.hash as confirmed hash:", tx.hash);
      return tx.hash; // Return initial tx.hash as it's confirmed by status 1
    } else {
      // console.error("❌ Transaction failed on-chain (reverted). Receipt:", receipt);
      throw new Error(`Blockchain transaction failed with status ${receipt.status}`);
    }
  } catch (error) {
    // console.error("💥 Error during recordSkillOnChain execution:", error);
    // Log additional details if available from the error object
    if (error.receipt) {
      // console.error("🧾 Error receipt details:", error.receipt);
    }
    if (error.transactionHash) {
      // console.error("ℹ️ Error transaction hash:", error.transactionHash);
    }

    // Rethrow a more specific error or handle as needed
    if (error.code === 'ACTION_REJECTED') {
      // console.error("❌ Transaction failed. Receipt:", receipt);
      throw new Error("用户拒绝了中的交易请求。");
    } else if (error.message.includes("transaction failed")) {
      throw new Error(`区块链交易失败: ${error.message}`);
    } else {
      throw new Error(`在链上记录技能时发生错误: ${error.message || error}`);
    }
  }
}
