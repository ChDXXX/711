// 引入 Firebase Functions 和 Admin SDK
const functions = require('firebase-functions');    // Firebase Cloud Functions
const admin     = require('firebase-admin');        // Firebase Admin SDK
admin.initializeApp();

// 引入 Ethers.js，用于和以太坊合约交互
const { ethers } = require('ethers');              // Ethers.js

// 合约 ABI(ABI) 和环境变量(config)
const contractAbi      = require('./SkillWallet.json').abi;  // 编译后 ABI
const ETH_RPC_URL      = process.env.ETH_RPC_URL;            // 区块链 JSON-RPC 地址
const PRIVATE_KEY      = process.env.PRIVATE_KEY;            // 签名私钥(private key)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;       // 部署后合约地址

// 初始化 provider 和 signer(wallet)
const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
// 连接合约(contract)
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, wallet);

//触发器(trigger)：当 Firestore 中 "users/{uid}" 文档被创建时执行
exports.syncUserToBlockchain = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    // 读取 Firestore 文档数据
    const data = snap.data();
    // Firestore Timestamp → 毫秒 -> 秒
    const firebaseTs    = data.createdAt;
    const createdAtSec  = Math.floor(firebaseTs.toMillis() / 1000);

    const {
      customUid,
      email,
      name,
      role,
      schoolId = ''
    } = data;
    const walletAddress = data.walletAddress;

    try {
      // 调用智能合约(registerUser)
      const tx = await contract.registerUser(
        createdAtSec,
        customUid,
        email,
        name,
        role,
        schoolId
      );
      // 等待上链
      const receipt = await tx.wait();
      console.log(`用户 ${customUid} 同步上链，交易哈希(txHash)：${receipt.transactionHash}`);
    } catch (err) {
      console.error(`同步用户 ${customUid} 到区块链失败(fail):`, err);
    }
  });
