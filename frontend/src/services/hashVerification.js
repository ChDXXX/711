import { ethers } from 'ethers';
import SkillWallet from './SkillWalletABI.json'; // Assuming this is the correct path to your ABI JSON

// 创建技能数据的哈希值（与智能合约一致）
export function createSkillHash(skillData) {
  // 使用与智能合约相同的哈希算法
  const hash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'string', 'string[]', 'uint256[]', 'string', 'string', 'uint256', 'string', 'string', 'string'],
      [
        skillData.customUid || '',
        skillData.courseCode || '',
        skillData.courseTitle || '',
        skillData.hardSkillNames || [],
        skillData.hardSkillScores || [],
        skillData.level || '',
        skillData.ownerId || '',
        skillData.reviewedAt || 0,
        skillData.reviewedBy || '',
        skillData.schoolId || '',
        skillData.cid || ''
      ]
    )
  );
  
  // 返回十六进制字符串（去掉0x前缀）
  return hash.slice(2);
}

// 从区块链获取技能哈希值
async function getSkillHashFromBlockchain(skillData) {
  try {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8550');
    let contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x684cAd7dd32a3B3593d7a0F0457DeCde66EAF0D1';
    try {
      const response = await fetch('/deployment.json');
      if (response.ok) {
        const deploymentInfo = await response.json();
        if (deploymentInfo.contractAddress) {
          contractAddress = deploymentInfo.contractAddress;
        }
      }
    } catch (error) { /* ignore */ }

    console.log('📄 使用部署文件中的合约地址:', contractAddress);

    const recordKey = ethers.keccak256(
      ethers.solidityPacked(
        ['string', 'string', 'uint256'],
        [skillData.customUid, skillData.courseCode, skillData.reviewedAt]
      )
    );
    
    console.log('🔑 STUDENT-SIDE recordKey generation params:', {
      customUid: skillData.customUid,
      courseCode: skillData.courseCode,
      reviewedAt: skillData.reviewedAt
    });
    console.log('🔑 STUDENT-SIDE GENERATED recordKey:', recordKey);
    
    const contract = new ethers.Contract(contractAddress, SkillWallet, provider);
    
    // 获取所有技能
    const allSkills = await contract.getAllSkills();
    console.log('Raw allSkills result (JSON.stringified):', JSON.stringify(allSkills));
    
    // 在所有技能中查找匹配的记录
    let found = false;
    let blockchainHash = null;
    
    if (Array.isArray(allSkills) && allSkills.length === 2) {
      const keys = allSkills[0];
      const hashes = allSkills[1];
      
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === recordKey) {
          blockchainHash = hashes[i];
          found = true;
          break;
        }
      }
      
      // 如果没有找到，尝试使用毫秒时间戳
      if (!found) {
        const msTimestamp = skillData.reviewedAt * 1000;
        const recordKeyMs = ethers.keccak256(
          ethers.solidityPacked(
            ['string', 'string', 'uint256'],
            [skillData.customUid, skillData.courseCode, msTimestamp]
          )
        );
        
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === recordKeyMs) {
            blockchainHash = hashes[i];
            found = true;
            break;
          }
        }
      }
      
      // 如果仍然没找到，尝试时间戳为0的情况
      if (!found) {
        const recordKeyZero = ethers.keccak256(
          ethers.solidityPacked(
            ['string', 'string', 'uint256'],
            [skillData.customUid, skillData.courseCode, 0]
          )
        );
        
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === recordKeyZero) {
            blockchainHash = hashes[i];
            found = true;
            break;
          }
        }
      }
    }
    
    return found ? blockchainHash.slice(2) : null;
  } catch (error) {
    console.error('获取区块链哈希值失败:', error);
    return null;
  }
}

// 验证数据库和区块链数据的一致性
export async function verifySkillIntegrity(skillData, skillId) {
  console.log('🔍 开始验证技能数据完整性...');
  console.log('📊 技能数据:', skillData);
  
  try {
    // 生成数据库哈希
    const databaseHash = createSkillHash(skillData);
    console.log('🗄️ 数据库哈希值:', databaseHash);
    
    // 获取区块链哈希
    const blockchainHash = await getSkillHashFromBlockchain(skillData);
    
    if (!blockchainHash) {
      return {
        isValid: false,
        databaseHash,
        blockchainHash: null,
        error: 'Record not found',
        message: '链上未找到记录'
      };
    }
    
    console.log('⛓️ 区块链哈希值:', blockchainHash);
    
    // 比较哈希值
    const isValid = databaseHash === blockchainHash;
    
    return {
      isValid,
      databaseHash,
      blockchainHash,
      message: isValid ? '数据一致' : '数据不一致'
    };
  } catch (error) {
    console.error('验证过程出错:', error);
    return {
      isValid: false,
      error: error.message,
      message: '验证过程出错'
    };
  }
} 