@echo off
chcp 65001 >nul
echo ============================================================
echo Starting All Project Services with Proxy
echo ============================================================
echo.


echo [1/4] Starting Ganache Blockchain...
echo IMPORTANT: If Ganache fails with a LockFile error, close all CMD windows,
echo delete the 'ganache-db' folder in your project root, then rerun this script.
start "Ganache Blockchain" cmd /k "echo Starting Ganache... && npx ganache --port 8550 --database.dbPath "%~dp0ganache-db" --chain.chainId 1337 --mnemonic "inner increase scissors eight brave vapor leisure perfect robot light join initial" && pause"
echo Waiting for Ganache to initialize (15 seconds)...
timeout /t 15 /nobreak >nul
echo.

echo [2/4] Deploying Smart Contracts...
echo IMPORTANT: Ensure 'npx hardhat run scripts/deploy.js --network ganache' is correctly configured.
start "Deploy Contracts" cmd /k "echo Deploying contracts... && cd /d "%~dp0smart-contracts" && npx hardhat run scripts/deploy.js --network ganache && echo. && echo Smart Contracts Deployed. You can review output above. && echo Press any key to close this deployment window. && pause"
echo Waiting for contract deployment to complete (20 seconds)...
timeout /t 20 /nobreak >nul
echo.

echo [3/4] Starting Firebase Functions Emulator...
start "Firebase Functions Emulator" cmd /k "echo Starting Firebase Functions Emulator... && cd /d "%~dp0functions" && firebase emulators:start --only functions && pause"
echo Waiting for Firebase Functions to initialize (10 seconds)...
timeout /t 10 /nobreak >nul
echo.

echo [4/4] Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "echo Starting Frontend Development Server... && cd /d "%~dp0frontend" && npm run dev"
echo.

echo ============================================================
echo All services are being launched in separate windows.
echo Frontend should be available at http://localhost:3000 (or similar port)
echo Ganache RPC at http://127.0.0.1:8550
echo Firebase Emulator UI typically at http://localhost:4000
echo ============================================================
echo.
echo This script window will close in 30 seconds.
timeout /t 30 /nobreak 