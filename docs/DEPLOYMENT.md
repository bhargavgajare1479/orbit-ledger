# Orbit Ledger: Deployment and Operations Guide (DEPLOYMENT)

## 1. Deployment Philosophy and Environments

Orbit Ledger supports two independent operational environments:

1. Local Mode (Primary Demo Baseline): Completely self-contained execution on Ganache local RPC (`http://127.0.0.1:8545`). Requires zero external internet connectivity, zero third-party API keys, and zero faucet funds. This is the primary presentation path to ensure resilience against classroom network failures.
2. Sepolia Testnet (Public Verification & Viva Demo): Contracts deployed to Ethereum Sepolia testnet and verified on Etherscan. Enables live demonstrations of MetaMask wallet interaction, gas mechanics, public transaction confirmation, and source code auditing on etherscan.io.

## 2. Environment Variables Specification

All sensitive credentials and network endpoints are configured via `.env`. A complete template is committed as `.env.example`. Private keys must never be committed to source control.

### 2.1 Configuration Variables (`.env`)

```ini
# Node Environment
NODE_ENV=development
PORT=3000

# Local Ganache Configuration
GANACHE_PORT=8545
GANACHE_NETWORK_ID=1337
GANACHE_MNEMONIC="submit lake embrace famous lazy drum proud poverty casino rare unhappy dawn"

# Sepolia Testnet Credentials (User-Provided for Sepolia Deploy)
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
SEPOLIA_PRIVATE_KEY="YOUR_SEPOLIA_PRIVATE_KEY_WITHOUT_0X"
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY_FOR_VERIFICATION"

# Frontend Configuration
VITE_API_URL="http://localhost:3000"
VITE_DEFAULT_NETWORK="ganache"
```

## 3. Local Deployment and Startup Guide

The entire local stack runs through an automated script:

```bash
# 1. Ensure Node.js LTS v20 is active
nvm use 20

# 2. Run system preflight checks
npm run preflight

# 3. Launch end-to-end local demo environment
npm run demo
```

What `npm run demo` executes under the hood:
1. Spawns Ganache in background mode on port 8545 with 10 deterministic accounts.
2. Deploys the four smart contracts via Hardhat:
   - `DataCredit.sol`
   - `AlertCertificate.sol`
   - `DebrisLedger.sol`
   - `ConjunctionMonitor.sol`
3. Writes deployment artifacts and addresses to `deployments/ganache.json`.
4. Runs `scripts/seed_chain.js`, creating the 25 Layer A blocks from `iridium_33_july2026.csv` and `cosmos_2251_july2026.csv`.
5. Anchors all 25 block Merkle roots to `DebrisLedger` on Ganache.
6. Starts the Express REST API server on port 3000.
7. Starts the Vite front-end development server on port 5173.
8. Opens the browser console at `http://localhost:5173`.

## 4. Sepolia Testnet Deployment Guide

Deploying to Sepolia requires a funded test account and an RPC URL.

### 4.1 Prerequisites for the Student / User
To deploy on Sepolia, you will need:
1. A Sepolia RPC endpoint (free from Infura, Alchemy, or public RPC like `https://rpc.sepolia.org`).
2. An Ethereum private key containing at least 0.05 Sepolia test ETH (obtained from a public faucet such as `https://sepoliafaucet.com` or `https://cloud.google.com/application/web3/faucet/ethereum/sepolia`).
3. An Etherscan API key (free from `https://etherscan.io`) for source code verification.

### 4.2 Deployment Execution Steps

```bash
# 1. Update .env with your credentials
# SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/..."
# SEPOLIA_PRIVATE_KEY="..."
# ETHERSCAN_API_KEY="..."

# 2. Deploy contracts to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 3. Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# 4. Anchor initial deterministic blocks to Sepolia
node scripts/anchor_sepolia.js
```

The deployment script writes contract addresses to `deployments/sepolia.json`:
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "2026-09-30T18:00:00.000Z",
  "contracts": {
    "DataCredit": "0x...",
    "AlertCertificate": "0x...",
    "DebrisLedger": "0x...",
    "ConjunctionMonitor": "0x..."
  }
}
```

## 5. Public Cloud Hosting Guide

For remote evaluation or public demonstration:

### 5.1 Frontend Hosting: Vercel or Netlify (Free Tier)
- Root Directory: `frontend/`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL`: URL of the deployed backend API (e.g. `https://orbit-ledger-api.onrender.com`).
  - `VITE_DEFAULT_NETWORK`: `sepolia`

### 5.2 API Server Hosting: Render or Railway (Free / Hobby Tier)
- Service Type: Web Service
- Build Command: `npm install`
- Start Command: `node server/api.js`
- Port: `3000` (or `PORT` environment variable assigned by provider)
- Cold-Start Notice: Free tier services on Render spin down after 15 minutes of inactivity. The first request after sleep exhibits a 30 to 50 second wake-up delay. This delay is noted in the presentation script.

## 6. Rollback and State Recovery Procedures

If data corruption occurs during live demonstration or manual testing:

```bash
# 1. Reset Layer A Chain State
# Deletes corrupted runtime blocks and regenerates the clean 25-block seed chain
npm run reset:chain

# 2. Re-deploy Fresh Contracts on Ganache
npm run deploy:local

# 3. Full Clean Reset
npm run clean && npm run demo
```

## 7. Demo Day Contingency and Fallback Plan

Live classroom presentations face unpredictable hurdles (campus Wi-Fi firewalls, RPC rate limits, faucet outages). Orbit Ledger provides a four-tier fallback matrix:

| Failure Mode | Impact | Automated / Immediate Fallback Action |
|---|---|---|
| Campus Wi-Fi blocks port 8545 or internet is down | Sepolia and public RPCs unreachable | Immediate fallback to 100% Local Mode (`npm run demo`). Runs on `127.0.0.1` without needing any internet connection. Fonts and assets are self-hosted. |
| Sepolia faucet dry / account out of test ETH | Cannot send new Sepolia transactions | Demonstrate contracts using local Ganache for transaction execution; use pre-deployed Sepolia contract links on Etherscan for read-only viva verification. |
| MetaMask rejected or extension fails to load | Cannot trigger browser signature popup | Switch to Ganache Mode in the UI. Ganache mode utilizes unlocked Node 1 to Node 4 local keys directly through the Express backend, bypassing MetaMask entirely. |
| Port 3000 or 8545 already in use | Startup fails with EADDRINUSE error | `npm run preflight` immediately detects conflicting processes and offers `npm run kill:ports` to clear port 3000 and 8545 automatically. |
