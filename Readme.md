# 711

IFN711
global installation
plz use node.js v20, which is the only version can export ipfs.
npm install -g firebase-tools

Functions
#1. npm init -y
#2. npm install express mysql2 dotenv firebase-admin cors ipfs-http-client
#3. npm install multer
#4. npm install ipfs-http-client@56.0.3
#5. firebase emulators:start

Frontend
#1. npm init -y
#2. npm install firebase axios ethers react-router-dom firebase-tools ethers
#3. npm install @mantine/core @mantine/hooks @tabler/icons-react

how to run：
#1. back to ddigital-skill-wallet run code:firebase emulators:start --only functions
#2. cd to frontend run: npm run dev

pending
smart-contracts:
cd smart-contracts
#1 npm install --save-dev hardhat solc
#2 npm install @openzeppelin/contracts
#3 npx hardhat compile
#4 npx hardhat node (#4 and #5 should be run at the same time, keep this running)
#5 npx hardhat run scripts/deploy.js --network localhost (and open a new terminal to run this line)
