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




Frontend/.env 

npx hardhat node

npx hardhat run scripts/deploy.js
Deploying with account is contract key

port 8545 is the defate port for solidity and headhat.





const skillWallet = await ethers.getContractAt(
  "SkillWallet",
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
)

const hashStorage = await ethers.getContractAt(
  "HashStorage",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
)


"0xDace0bF9169D90bFec0446aEfb83f1128e6FBAe0"