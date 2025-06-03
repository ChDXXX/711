# 711

IFN711
global installation
plz use node.js v20, which is the only version can export ipfs.
npm install -g firebase-tools ganache

Functions
#1. npm init -y
#2. npm install express mysql2 dotenv firebase-admin cors ipfs-http-client
#3. npm install multer
#4. npm install ipfs-http-client@56.0.3
#5. firebase emulators:start

Frontend
#1. npm init -y  
#2. npm install react react-dom firebase axios ethers react-router-dom dayjs echarts-for-react prop-types  
#3. npm install @mantine/core@8.0.0 @mantine/hooks@8.0.0 @mantine/carousel@8.0.0 @mantine/form@8.0.0 @tabler/icons-react  
#4. npm install -D vite@6.2.6 @vitejs/plugin-react

smart-contracts:
cd smart-contracts
#1 npm install --save-dev hardhat solc
#2 npm install @openzeppelin/contracts
#3 npx hardhat compile
#4 ganache --port 8550 --db ./ganache-db --chain.chainId 1337 --mnemonic "inner increase scissors eight brave vapor leisure perfect robot light join initial" (#4 and #5 should be run at the same time, keep this running)
#5 npx hardhat run scripts/deploy.js --network ganache (and open a new terminal to run this line)


how to run：
#1. click start-project.bat


#2. (1) back to ddigital-skill-wallet run code: firebase emulators:start --only functions
    (2) cd to frontend run: npm run dev
    (3) cd to smart-contracts run:npx hardhat compile
    (4) ganache --port 8550 --db ./ganache-db --chain.chainId 1337 --mnemonic "inner increase scissors eight brave vapor leisure perfect robot light join initial"
    (5) npx hardhat run scripts/deploy.js --network ganache (and open a new terminal to run this line)






