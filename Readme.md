Digital Skill Wallet – IFN711 Final Project

A blockchain-integrated skill validation platform that enables students to submit skills, allows teachers to verify and score them, and provides employers with student skill-matching and job application review features.

Project Overview

Course: IFN711 - Enterprise Project
Developer:Team 83
Project Type: Full-stack web app with blockchain integration
Deployment: Firebase Hosting and Cloud Functions

Global Installation Requirements

Please use Node.js v20, which is the only version compatible with IPFS export.

npm install -g firebase-tools ganache

Backend (Functions)

Step 1
npm init -y

Step 2
npm install express mysql2 dotenv firebase-admin cors ipfs-http-client

Step 3
npm install multer

Step 4
npm install ipfs-http-client@56.0.3

Step 5
firebase emulators:start

Frontend

Step 1
npm init -y

Step 2
npm install react react-dom firebase axios ethers react-router-dom dayjs echarts-for-react prop-types

Step 3
npm install @mantine/core@8.0.0 @mantine/hooks@8.0.0 @mantine/carousel@8.0.0 @mantine/form@8.0.0 @tabler/icons-react

Step 4
npm install -D vite@6.2.6 @vitejs/plugin-react

Smart Contracts

cd smart-contracts

Step 1
npm install --save-dev hardhat solc

Step 2
npm install @openzeppelin/contracts

How to Run the Project

Step 1
Double-click start-project.bat

Alternatively, you can run manually with these steps:

Step 2.1
From root folder (digital-skill-wallet):
firebase emulators:start --only functions

Step 2.2
cd frontend
npm run dev

Step 2.3
cd smart-contracts
npx hardhat compile

Step 2.4
npx hardhat run scripts/deploy.js --network ganache
(Note: This should be done in a new terminal window.)

Step 2.5
Copy a Private Key address from the ganache UI
Paste it into frontend/.env as:
VITE_PRIVATE_KEY=

Step 2.6
Copy SkillWallet contract address from deployment terminal
Paste it into frontend/.env as:
VITE_CONTRACT_ADDRESS=

Ganache Run Command

cd smart-contracts
ganache --port 8550 --db ./ganache-db --chain.chainId 1337 --mnemonic "inner increase scissors eight brave vapor leisure perfect robot light join initial"
