# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```



终端里面
分配
const [admin, student1, school1, company1] = await ethers.getSigners();
const hs = await ethers.getContractAt("HashStorage", deployedAddress);

await hs.grantRole(ethers.utils.id("STUDENT_ROLE"), student1.address);

await hs.grantRole(ethers.utils.id("SCHOOL_ROLE"), school1.address);

await hs.grantRole(ethers.utils.id("COMPANY_ROLE"), company1.address);



储存学生的法系
await contract.connect(student1).storeHash(hexHash);
学生
const myHashes = await contract.connect(student1).getHashes(student1.address);
const studentHashes = await contract.connect(school1).getHashes(student1.address);



Frontend/.env 

npx hardhat node
Private Key of each block

npx hardhat run scripts/deploy.js
Deploying with account is contract key

port 8545 is the defate port for solidity and headhat.