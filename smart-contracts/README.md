# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:



**How to test all data via terimial console**

npx hardhat console --network ganache

**get student account information**
const [deployer] = await ethers.getSigners();
const skillWallet = await ethers.getContractAt("SkillWallet", "deloped contracts aaddress");
const result = await skillWallet.getStudentByWallet(
    "student wallet address"
);
console.log(result);

**get skill information**
const [keys, hashes] = await skillWallet.getAllSkills();
keys.forEach((key, i) => console.log(key, hashes[i]));