# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:





VITE_RPC_URL=http://127.0.0.1:8545
is the defate port for forontend,
for record data long time.



npx hardhat console --network ganache
const [deployer] = await ethers.getSigners();
const skillWallet = await ethers.getContractAt("SkillWallet", "部署的合约地址");
const result = await skillWallet.getStudentByWallet(
    "学生钱包"
);
console.log(result);



const [keys, hashes] = await skillWallet.getAllSkills();
keys.forEach((key, i) => console.log(key, hashes[i]));