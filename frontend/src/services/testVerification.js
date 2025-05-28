import { ethers } from 'ethers';

// 测试区块链连接和技能记录
export async function testBlockchainSkills() {
  try {
    console.log('🧪 开始测试区块链连接...');
    
    // 连接到Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8550');
    
    // 获取合约地址
    let contractAddress = '0x684cAd7dd32a3B3593d7a0F0457DeCde66EAF0D1';
    try {
      const response = await fetch('/deployment.json');
      if (response.ok) {
        const deploymentInfo = await response.json();
        contractAddress = deploymentInfo.contractAddress;
      }
    } catch (error) {
      console.log('使用默认合约地址');
    }
    
    console.log('📄 合约地址:', contractAddress);
    
    // 合约ABI
    const contractABI = [
      "function getAllSkills() external view returns (bytes32[] keys, bytes32[] hashes)",
      "function recordSkill(string, string, string, string[], uint256[], string, string, uint256, string, string, string) external",
      "event SkillRecorded(bytes32 indexed recordKey, bytes32 dataHash)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // 获取所有技能
    const allSkills = await contract.getAllSkills();
    console.log('📚 区块链上的技能数量:', allSkills.keys.length);
    
    if (allSkills.keys.length === 0) {
      console.log('⚠️ 区块链上没有技能记录');
      
      // 创建一个测试技能记录
      console.log('📝 创建测试技能记录...');
      
      const signer = new ethers.Wallet(
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', // Ganache默认私钥
        provider
      );
      
      const contractWithSigner = contract.connect(signer);
      
      const testSkill = {
        customUid: "test-student-123",
        courseCode: "TEST101",
        courseTitle: "Test Course",
        hardSkillNames: ["Skill1", "Skill2"],
        hardSkillScores: [4, 5],
        level: "Intermediate",
        ownerId: "test-student-123",
        reviewedAt: Math.floor(Date.now() / 1000),
        reviewedBy: "test-teacher-456",
        schoolId: "test-school",
        cid: "QmTestCID123"
      };
      
      console.log('📤 发送测试技能到区块链...');
      const tx = await contractWithSigner.recordSkill(
        testSkill.customUid,
        testSkill.courseCode,
        testSkill.courseTitle,
        testSkill.hardSkillNames,
        testSkill.hardSkillScores,
        testSkill.level,
        testSkill.ownerId,
        testSkill.reviewedAt,
        testSkill.reviewedBy,
        testSkill.schoolId,
        testSkill.cid
      );
      
      console.log('⏳ 等待交易确认...');
      const receipt = await tx.wait();
      console.log('✅ 测试技能已记录到区块链:', receipt.hash);
      
      // 生成recordKey
      const recordKey = ethers.keccak256(
        ethers.solidityPacked(
          ['string', 'string', 'uint256'],
          [testSkill.customUid, testSkill.courseCode, testSkill.reviewedAt]
        )
      );
      console.log('🔑 RecordKey:', recordKey);
      
      // 重新获取所有技能
      const updatedSkills = await contract.getAllSkills();
      console.log('📚 更新后的技能数量:', updatedSkills.keys.length);
      
      return {
        success: true,
        testSkill,
        recordKey,
        txHash: receipt.hash
      };
    } else {
      // 显示现有技能
      for (let i = 0; i < allSkills.keys.length; i++) {
        console.log(`📝 技能 ${i}:`, {
          key: allSkills.keys[i],
          hash: allSkills.hashes[i]
        });
      }
      
      return {
        success: true,
        existingSkills: allSkills.keys.length
      };
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 在控制台暴露测试函数
if (typeof window !== 'undefined') {
  window.testBlockchainSkills = testBlockchainSkills;
} 