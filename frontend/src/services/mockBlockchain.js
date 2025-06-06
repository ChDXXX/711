// 模拟区块链存储
let mockBlockchainStorage = {};

// 模拟存储技能哈希到区块链
export function mockStoreSkillHash(skillId, hash) {
  console.log(`📦 模拟存储到区块链: ${skillId} -> ${hash}`);
  mockBlockchainStorage[skillId] = hash;
  return Promise.resolve(`0x${Math.random().toString(16).substr(2, 8)}`); // 模拟交易哈希
}

// 模拟从区块链获取技能哈希
export function mockGetSkillHash(skillId) {
  console.log(`🔍 模拟从区块链获取: ${skillId}`);
  const hash = mockBlockchainStorage[skillId];
  if (hash) {
    console.log(`✅ 找到哈希: ${hash}`);
    return Promise.resolve(hash);
  } else {
    console.log(`❌ 未找到哈希`);
    return Promise.reject(new Error('Skill not found in blockchain'));
  }
}

// 获取所有存储的技能哈希（用于调试）
export function getMockBlockchainStorage() {
  return mockBlockchainStorage;
}

// 清空模拟存储（用于测试）
export function clearMockBlockchainStorage() {
  mockBlockchainStorage = {};
  console.log('��️ 模拟区块链存储已清空');
} 