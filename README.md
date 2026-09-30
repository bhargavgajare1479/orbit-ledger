# Orbit Ledger

An immutable consortium architecture and conjunction screening console for space situational awareness and orbital debris tracking. Built for the final-year B.E. (Artificial Intelligence & Data Science) mini project in Blockchain Technologies.

Orbit Ledger addresses the critical challenge of post-collision orbital telemetry integrity, fragmented conjunction alerting, and bilateral data-sharing barriers. By uniting a custom Node.js consortium blockchain (Layer A) with four Ethereum Solidity smart contracts (Layer B), the system guarantees that tracking records cannot be altered retroactively, while offering automated on-chain conjunction screening, cryptographic Merkle proofs, and tokenized data access.

---

## Table of Contents

1. [Project Overview and Domain Motivation](#1-project-overview-and-domain-motivation)
2. [Two-Layer Architecture](#2-two-layer-architecture)
3. [System Prerequisites and Installation](#3-system-prerequisites-and-installation)
4. [Step-by-Step Running Guide](#4-step-by-step-running-guide)
   - [Method 1: Single-Command Automated Launch (Recommended)](#method-1-single-command-automated-launch-recommended)
   - [Method 2: Step-by-Step Manual Multi-Terminal Launch](#method-2-step-by-step-manual-multi-terminal-launch)
5. [Ground Station Console Walkthrough (8 Views)](#5-ground-station-console-walkthrough-8-views)
6. [Automated Testing and Verification](#6-automated-testing-and-verification)
7. [Ethereum Sepolia Testnet Deployment](#7-ethereum-sepolia-testnet-deployment)
8. [REST API Documentation](#8-rest-api-documentation)
9. [Project Directory Structure](#9-project-directory-structure)
10. [Academic Syllabus Alignment (Modules 1 to 6)](#10-academic-syllabus-alignment-modules-1-to-6)
11. [Troubleshooting and Frequently Asked Questions](#11-troubleshooting-and-frequently-asked-questions)

---

## 1. Project Overview and Domain Motivation

In February 2009, the active communications satellite **Iridium 33** and the defunct military reconnaissance satellite **Cosmos 2251** collided at approximately 789 km altitude over northern Siberia. The catastrophic impact produced over 2,000 tracked orbital debris fragments, permanently cluttering Low Earth Orbit (LEO) and dramatically raising collision hazards for all spacefaring entities (the Kessler Syndrome).

### The Problem
- **Data Tampering and Liability Disputes**: Following conjunction events, operators may alter ephemeris or covariance records to evade liability or conceal missed collision avoidance maneuvers.
- **Siloed Conjunction Reporting**: Traditional conjunction data messages (CDMs) rely on centralized databases (such as Space-Track) without cryptographically verifiable audit trails.
- **Bilateral Data Barriers**: Commercial operators lack an automated, trustless incentive mechanism to share proprietary orbital telemetry without forfeiting commercial value.

### The Solution: Orbit Ledger
- **Canonical Telemetry Ingestion**: Ingests 1,000 real Space-Track orbital mean-elements messages (OMM) from both Iridium 33 (500 records) and Cosmos 2251 (500 records) across 393 unique fragments.
- **Layer A (Consortium Chain)**: Packages telemetry into 25 deterministic blocks of 40 records each. Computes Bitcoin-standard SHA-256 Merkle trees with odd-leaf duplicate hashing and validates chain integrity via previous-hash pointers.
- **Layer B (Ethereum Smart Contracts)**: Anchors block Merkle roots to `DebrisLedger.sol`. Allows any external party to verify a record's inclusion via a pure on-chain SHA-256 Merkle proof using native EVM precompile `0x02`.
- **SGP4 Orbital Propagation Oracle**: Uses `satellite.js` to propagate two-line orbital elements to future epochs, computes integer Euclidean distance in metres, and logs close approaches on-chain.
- **Conjunction Alert NFTs**: When miss distance drops below a safety threshold (default: 50,000 m), `ConjunctionMonitor.sol` automatically mints an ERC721 `AlertCertificate.sol` NFT to both operators.
- **Tokenized Dataset Escrow**: Uses an ERC20 token (`DataCredit.sol`, ticker: ODC) and an `approve` / `transferFrom` escrow pattern to unlock access rights to verified orbital blocks.

---

## 2. Two-Layer Architecture

```
   SPACE-TRACK OMM DATA (1,000 Records: Iridium 33 + Cosmos 2251)
                            |
                            v
   +-------------------------------------------------------------------+
   | LAYER A: CONSORTIUM DISTRIBUTED LEDGER (Node.js)                  |
   |                                                                   |
   |   Block #0 (Genesis) -> Block #1 -> ... -> Block #25              |
   |   - 40 canonical records per block (SHA-256 recordHash)           |
   |   - Bitcoin-standard binary Merkle Tree                           |
   |   - Multi-Consensus: PoW, PoS, PoA, and 4-Node PBFT (3f + 1)     |
   |   - Standalone Bitcoin UTXO Transaction Engine                    |
   +---------------------------------+---------------------------------+
                                     |
                                     | Merkle Root (bytes32)
                                     v
   +-------------------------------------------------------------------+
   | LAYER B: ETHEREUM SMART CONTRACTS (Solidity 0.8.24)               |
   |                                                                   |
   |   [DebrisLedger.sol]                                              |
   |     * State Anchor: anchorRoot(blockIndex, root, count, ts)       |
   |     * On-Chain Merkle Verifier: sha256() via EVM Precompile 0x02  |
   |     * Dataset Escrow: buyAccess(blockIndex, publisher)            |
   |                                                                   |
   |   [DataCredit.sol]                                                |
   |     * ERC20 Utility Token (ODC) with Faucet and Permit            |
   |                                                                   |
   |   [ConjunctionMonitor.sol]                                        |
   |     * Integer Euclidean Distance Math: sqrt((x1-x2)^2 + ...)      |
   |     * Threshold Screening: missDistance <= threshold              |
   |     * Duplicate Alert Prevention: ConjunctionAlreadyReported      |
   |                                                                   |
   |   [AlertCertificate.sol]                                          |
   |     * ERC721 Conjunction Alert NFT (OCC)                          |
   +---------------------------------+---------------------------------+
                                     ^
                                     | Integer Coordinates [X, Y, Z] (metres)
   +---------------------------------+---------------------------------+
   | OFF-CHAIN SGP4 ORACLE (satellite.js)                              |
   |   Propagates orbital states to future conjunction epochs          |
   +-------------------------------------------------------------------+
                                     |
                                     v
   +-------------------------------------------------------------------+
   | GROUND STATION WEB CONSOLE (Vite + Vanilla JS + Tailwind)         |
   |   8 operational views, SVG altitude histograms, PBFT lab          |
   +-------------------------------------------------------------------+
```

---

## 3. System Prerequisites and Installation

### Prerequisites

| Component | Required Version | Verification Command | Notes |
|---|---|---|---|
| Node.js | v20.x LTS (v20.20.2 recommended) | `node -v` | **Strict requirement**: Ganache native binaries require Node 20 LTS. |
| npm | v10.x or higher | `npm -v` | Bundled with Node 20 LTS. |
| Git | v2.20 or higher | `git --version` | For cloning and version control. |
| Browser | Chrome, Firefox, Safari, or Edge | N/A | Modern evergreen browser with ES module support. |

> **Important Node Version Notice**: Do not use Node.js v24. Ganache v7.9.2 relies on native WebSocket bindings (`@trufflesuite/uws-js-unofficial`) that fail to compile under Node 24. Always pin Node 20 LTS via `nvm use 20`.

### Step-by-Step Installation

```bash
# Step 1: Clone the repository
git clone <repository-url> orbit-ledger
cd orbit-ledger

# Step 2: Ensure Node 20 LTS is active
nvm use 20
# If Node 20 is not yet installed:
# nvm install 20 && nvm use 20

# Step 3: Install root project dependencies
npm install

# Step 4: Install frontend console dependencies
npm run frontend:install

# Step 5: Configure the environment file
cp .env.example .env

# Step 6: Verify system environment readiness
npm run preflight
```

The preflight command verifies Node version, seed data integrity, contract artifacts, and RPC availability.

---

## 4. Step-by-Step Running Guide

Orbit Ledger supports two execution workflows:
- **Method 1 (Automated Single Command)**: Starts all five backend and frontend processes in one terminal.
- **Method 2 (Manual Multi-Terminal)**: Runs Ganache, contract deployment, state anchoring, the REST API, and the Vite frontend in dedicated terminal windows for granular observation.

---

### Method 1: Single-Command Automated Launch (Recommended)

Run this single command from the project root:

```bash
npm run demo
```

#### What `npm run demo` Does Under the Hood:
1. **Verifies Deterministic Seed Data**: Confirms `data/seed_records.json` contains 1,000 canonical orbital records across 25 blocks.
2. **Starts Ganache Local Blockchain**: Boots a local EVM node on port 8545 with Chain ID 1337 and pre-funded test accounts.
3. **Deploys Layer B Contracts**: Compiles and deploys `DataCredit.sol`, `AlertCertificate.sol`, `DebrisLedger.sol`, and `ConjunctionMonitor.sol`, then writes addresses to `deployments/ganache.json`.
4. **Anchors 25 Block Merkle Roots**: Iteratively reads all 25 block roots from Layer A and submits them on-chain via `DebrisLedger.sol::anchorRoot`.
5. **Starts Express REST API Server**: Launches the backend on port 3000, serving block queries, Merkle proofs, PBFT rounds, and UTXO transactions.
6. **Starts Vite Ground Station Console**: Launches the frontend development server on port 5173.

#### Access URLs:
- Ground Station Web Console: [http://localhost:5173](http://localhost:5173)
- REST API Server: [http://localhost:3000](http://localhost:3000)
- REST API Health Status: [http://localhost:3000/api/status](http://localhost:3000/api/status)
- Ganache Local RPC: `http://127.0.0.1:8545` (Chain ID: 1337)

#### Stopping the Demo:
Press `Ctrl + C` in the terminal. The launcher cleanly terminates all spawned background processes (Ganache, Express API, Vite).

---

### Method 2: Step-by-Step Manual Multi-Terminal Launch

If you wish to monitor logs for each service independently, open four terminal tabs in the `orbit-ledger` root directory:

#### Terminal 1: Start Ganache Local Blockchain
```bash
nvm use 20
npm run ganache
```
*Expected Output*: Ganache listening on `127.0.0.1:8545`, displaying 10 pre-funded accounts with 1,000 ETH each and mnemonic `submit lake embrace famous lazy drum proud poverty casino rare unhappy dawn`.

#### Terminal 2: Deploy Smart Contracts and Anchor State Roots
```bash
nvm use 20

# 1. Deploy the 4 contracts to Ganache
npm run deploy:local

# 2. Anchor all 25 Layer A block Merkle roots to DebrisLedger.sol
npm run anchor:all
```
*Expected Output*:
- Contract addresses printed for `DataCredit`, `AlertCertificate`, `DebrisLedger`, and `ConjunctionMonitor`.
- Cross-contract permissions configured.
- `deployments/ganache.json` created.
- 25 progress dots printed followed by: `✓ All 25 block roots successfully anchored on-chain.`

#### Terminal 3: Start the Backend REST API Server
```bash
nvm use 20
npm run server
```
*Expected Output*:
```
========================================
Orbit Ledger REST API Server
Listening on: http://localhost:3000
Chain Height: 25 blocks
========================================
```

#### Terminal 4: Start the Frontend Ground Station Console
```bash
nvm use 20
npm run frontend:dev
```
*Expected Output*:
```
  VITE v5.4.19  ready in 180 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Ground Station Console Walkthrough (8 Views)

The web console provides eight dedicated screens designed around ground-station operations:

```
[Overview] -> [Orbital Records] -> [Chain Explorer] -> [Consensus Lab]
     |                 |                 |                  |
[Concepts Hub] <- [Conjunctions] <- [Ethereum Bridge] <- [Consortium PBFT]
```

### View 1: Ground Station Overview (`/#/overview`)
- **Telemetry Cards**: Real-time display of total records (1,000), total blocks (25), anchored blocks (25 / 25), and active network status.
- **Altitude Distribution Histogram**: Pure hand-made SVG chart displaying fragment perigee distribution between 200 km and 1,200 km altitude.
- **Fleet Breakdown**: Instant breakdown of Iridium 33 (500 records) versus Cosmos 2251 (500 records).
- **Consortium Status**: Live listing of the four authorized ground station nodes (Alpha, Beta, Gamma, Delta).

### View 2: Orbital Records Ledger (`/#/records`)
- **1,000 Canonical Records**: Browse Space-Track collision fragments with pagination (40 records per page).
- **Search and Filter**: Filter by operator (All, Iridium, Cosmos) or search by NORAD Catalog ID (e.g., `33785`, `34000`), object name, or international designator.
- **Record Inspector**: Click any row to view its canonical SHA-256 `recordHash`, Keplerian orbital elements (inclination, RAAN, eccentricity, mean motion), and altitude metrics.

### View 3: Consortium Block Explorer (`/#/explorer`)
- **Block Header Inspection**: Inspect the 25 consortium blocks and Genesis Block (Block #0). View previous-block hash pointers, SHA-256 Merkle roots, block timestamps, and proposer nodes.
- **Live Chain Verification**: Click the **Verify Chain** button to run an internal cryptographic sweep verifying all parent hashes and Merkle roots.
- **Immutability Tamper Demonstration**:
  1. Click **Simulate Tamper** to inject altered telemetry (changing an inclination angle) into Block #8.
  2. The chain status immediately flips to **INVALID**, highlighting the failed block index and mismatched Merkle root.
  3. Click **Restore Chain** (or run `npm run reset:chain`) to revert the chain back to its canonical seed state.

### View 4: Consensus Laboratory (`/#/consensus`)
- **Proof of Work (PoW) Simulator**:
  - Adjust the difficulty slider from 1 to 5 leading zeroes.
  - Click **Mine Block** to run off-chain hashing.
  - View real-time iterations, nonce discovery, elapsed time in milliseconds, hash rate, and matching hash prefix.
- **Proof of Stake (PoS) Simulator**:
  - Review validator stake distributions (Node 1: 400 ODC, Node 2: 300 ODC, Node 3: 200 ODC, Node 4: 100 ODC).
  - Sample randomized slot-based proposer selection weighted by stake.
- **Proof of Authority (PoA) Simulator**:
  - Inspect deterministic round-robin proposer scheduling across authorized operator addresses.
- **Bitcoin UTXO Transaction Simulator**:
  - View the live unspent transaction output (UTXO) pool.
  - Submit valid multi-input multi-output transactions.
  - Attempt an intentional double-spend to observe instant rejection by the UTXO validation engine.

### View 5: Consortium PBFT and Merkle Proofs (`/#/consortium`)
- **Interactive 4-Node PBFT Round**:
  - Simulates Practical Byzantine Fault Tolerance across four nodes through three phases: **Pre-Prepare**, **Prepare** (2f + 1 = 3 votes required), and **Commit** (2f + 1 = 3 votes required).
  - **Fault Injection**: Set Node 3 or Node 4 to offline/faulty. Execute a round and observe the round succeed with 3 out of 4 matching votes, demonstrating fault tolerance where $N \ge 3f + 1$ with $f = 1$.
  - Set two nodes to faulty ($f = 2 > 1$) and observe consensus stalling due to lack of quorum.
- **Cryptographic Merkle Proof Verifier**:
  - Select any block (1 to 25) and any record index (0 to 39).
  - Displays the 32-byte leaf hash, root hash, and sibling proof path (5 sibling hashes for 40 leaves).
  - Click **Verify Proof (Local JS)** to run verification in the browser via `MerkleTree.verifyProof()`.
  - Click **Verify on Ethereum** to trigger an on-chain view call to `DebrisLedger.sol::verifyRecord()`, executing SHA-256 hashing via native EVM precompile `0x02`.

### View 6: Ethereum Bridge and Data Credits (`/#/ethereum`)
- **Contract Registry**: View deployed addresses on Ganache or Sepolia for all four smart contracts.
- **State Anchors**: Inspect on-chain anchors stored in `DebrisLedger.sol`, showing block indices, Merkle roots, record counts, and anchoring timestamps.
- **DataCredit (ODC) Faucet**: Claim 500 test ODC tokens to test operator transactions.
- **Dataset Access Purchase**: Approve `DebrisLedger.sol` to spend 100 ODC and call `buyAccess(blockIndex, publisher)` to purchase query rights to a block dataset using ERC20 escrow.
- **Alert Certificate NFT Gallery**: View minted ERC721 `AlertCertificate` tokens with conjunction IDs, involved object pairs, and timestamp metadata.

### View 7: Conjunction Screening (`/#/conjunctions`)
- **SGP4 Orbital Propagation**: Utilizes `satellite.js` to propagate orbital elements forward in time.
- **Screening Parameters**: Select miss distance threshold (e.g., 50 km, 100 km, 250 km).
- **Candidate Analysis**: Evaluates pairs of Iridium and Cosmos fragments, calculating 3D Cartesian coordinates ($X, Y, Z$) and integer Euclidean distance in metres.
- **On-Chain Alert Reporting**:
  - Click **Report to Ethereum** next to any critical conjunction.
  - The SGP4 oracle submits an on-chain transaction calling `ConjunctionMonitor.sol::reportConjunction(...)`.
  - The smart contract verifies that distance is within threshold and mints an ERC721 `AlertCertificate` NFT.
  - Attempting to report the identical conjunction twice triggers contract error `ConjunctionAlreadyReported`.

### View 8: Concepts Hub (`/#/concepts`)
- **Curriculum Matrix**: Comprehensive educational cross-reference covering all 6 syllabus modules (Bitcoin, Ethereum, Consensus, Smart Contracts, Security, and Scalability).
- **Interactive Mathematical Formulas**: Detailed breakdowns of SHA-256 bitwise operations, Merkle path length $\lceil \log_2 N \rceil$, PBFT quorum thresholds ($2f + 1$), and SGP4 Keplerian orbital equations.
- **Viva Defense Preparation**: 30 comprehensive viva questions and answers covering architecture, design decisions, and blockchain trade-offs.

---

## 6. Automated Testing and Verification

Orbit Ledger includes a comprehensive automated test suite spanning both layers, plus an autonomous end-to-end integration lifecycle test.

```bash
# Run all 43 automated tests (27 Layer A + 16 Layer B)
npm test
```

### Layer A Unit Tests (`npm run test:chain`)
Runs native Node.js tests (`node:test`) covering the custom consortium chain:
- `test/chain/blockchain.test.js`: Block creation, parent hash validation, duplicate rejection, and tamper detection.
- `test/chain/merkle.test.js`: Leaf hashing, Bitcoin-style odd-leaf balancing, sibling proof generation, and verification.
- `test/chain/pow.test.js`: Hash target difficulty, nonce discovery, and iteration metrics.
- `test/chain/pos.test.js`: Stake-weighted lottery and slot-based deterministic selection.
- `test/chain/poa.test.js`: Round-robin operator scheduling and unauthorized proposer rejection.
- `test/chain/pbft.test.js`: 4-node three-phase state machine, 2f+1 quorum calculation, and Byzantine fault injection.
- `test/chain/utxo.test.js`: Bitcoin UTXO ledger, transaction balancing, change outputs, and double-spend rejection.

### Layer B Smart Contract Tests (`npm run test:contracts`)
Runs Hardhat Chai tests against Solidity smart contracts:
- `test/contracts/DebrisLedger.test.js`: State root anchoring, operator authorization, pure on-chain SHA-256 Merkle proof verification via precompile `0x02`, and ERC20 dataset purchase escrow.
- `test/contracts/DataCredit.test.js`: ERC20 minting, transfers, allowances, and test faucet behavior.
- `test/contracts/ConjunctionMonitor.test.js`: Integer Euclidean distance math, threshold filtering, duplicate reporting prevention, and ERC721 NFT minting linkage.

### Autonomous End-to-End Integration Run (`npm run test:e2e`)
Executes a 10-step headless integration test verifying the complete project lifecycle:
```bash
npm run test:e2e
```
1. Checks or starts local Ganache instance.
2. Ingests 1,000 canonical orbital records into 25 blocks.
3. Validates Layer A internal cryptographic integrity.
4. Deploys the four Solidity smart contracts.
5. Anchors all 25 block Merkle roots on-chain.
6. Verifies an off-chain JavaScript Merkle proof inside the EVM bytecode via precompile `0x02`.
7. Executes a 4-node PBFT round with 1 node offline (3/4 quorum satisfied).
8. Runs SGP4 screening, reports candidate on-chain, and mints an ERC721 NFT.
9. Confirms duplicate conjunction alert rejection.
10. Executes tokenized dataset access purchase via ERC20 escrow and tests UTXO double-spend rejection.

---

## 7. Ethereum Sepolia Testnet Deployment

Orbit Ledger can be deployed to the public Ethereum Sepolia testnet for public verification on Etherscan.

### Step 1: Configure Environment Variables
Edit your `.env` file with your Sepolia RPC endpoint and funded private key:

```env
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
SEPOLIA_PRIVATE_KEY="0xYOUR_HEX_PRIVATE_KEY"
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
```

> Obtain free Sepolia testnet ETH from [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/).

### Step 2: Deploy Contracts to Sepolia
```bash
npm run deploy:sepolia
```
This deploys `DataCredit.sol`, `AlertCertificate.sol`, `DebrisLedger.sol`, and `ConjunctionMonitor.sol` to Sepolia and saves addresses to `deployments/sepolia.json`.

### Step 3: Anchor Layer A State Roots to Sepolia
```bash
npm run anchor:sepolia
```
Submits all 25 block roots on-chain to `DebrisLedger.sol` on Sepolia.

### Step 4: Verify Contract Code on Etherscan (Optional)
```bash
npx hardhat verify --network sepolia <DEBRIS_LEDGER_ADDRESS> <DATA_CREDIT_ADDRESS> "100000000000000000000"
```

---

## 8. REST API Documentation

The Express server listens on port 3000 and exposes 16 endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | System health, chain height, valid status, active operators, and contract addresses. |
| `GET` | `/api/blocks` | Paginated block list with previous hashes, Merkle roots, timestamps, and proposers. |
| `GET` | `/api/blocks/:index` | Full block payload including all 40 canonical orbital records. |
| `GET` | `/api/blocks/:index/proof/:recordIndex` | Generates 32-byte leaf hash and sibling Merkle proof array for on-chain verification. |
| `POST` | `/api/tamper` | Injects altered orbital telemetry into a specified block and record to demonstrate immutability failure. |
| `POST` | `/api/reset-chain` | Reverts chain state back to the canonical 1,000-record seed baseline. |
| `POST` | `/api/mine` | Runs Proof of Work mining given a difficulty level (1 to 5 leading zeroes). |
| `GET` | `/api/consensus/pos/sample` | Selects a block proposer using stake-weighted pseudo-random lottery. |
| `GET` | `/api/consensus/poa/schedule` | Returns deterministic round-robin validator schedule for the next 8 blocks. |
| `POST` | `/api/consensus/pbft/step` | Executes a 4-node PBFT consensus round (Pre-Prepare, Prepare, Commit). |
| `POST` | `/api/consensus/pbft/faults` | Configures Byzantine fault injection (silent, crash, offline) for consortium nodes. |
| `GET` | `/api/conjunctions/screen` | Propagates orbits via SGP4 and returns close approaches below a specified threshold. |
| `POST` | `/api/conjunctions/report` | Relays conjunction candidate from oracle to `ConjunctionMonitor.sol` on-chain. |
| `GET` | `/api/utxo/pool` | Returns unspent UTXO pool and transaction history. |
| `POST` | `/api/utxo/submit` | Submits a UTXO transaction with double-spend detection. |
| `GET` | `/api/records` | Paginated and searchable list of 1,000 canonical debris records. |

---

## 9. Project Directory Structure

```
orbit-ledger/
├── .env.example                   # Environment configuration template
├── .nvmrc                         # Node v20.20.2 LTS pin
├── hardhat.config.js              # Hardhat configuration (Ganache & Sepolia networks)
├── package.json                   # Project dependencies and operational scripts
├── contracts/                     # Layer B Solidity Smart Contracts (0.8.24)
│   ├── DataCredit.sol             # ERC20 Utility Token (ODC) with Faucet
│   ├── AlertCertificate.sol       # ERC721 Conjunction Alert NFT (OCC)
│   ├── DebrisLedger.sol           # State Anchor & SHA-256 Merkle Proof Verifier (Precompile 0x02)
│   └── ConjunctionMonitor.sol     # Integer Euclidean Distance Screening & Alert Issuer
├── chain/                         # Layer A Custom Consortium Blockchain (Node.js)
│   ├── block.js                   # Block headers, canonical record serialization, and hashing
│   ├── merkle.js                  # Bitcoin-standard binary Merkle tree with SHA-256
│   ├── blockchain.js              # Chain state manager, duplicate detector, and tamper validator
│   ├── consensus/                 # Consensus Implementations
│   │   ├── pow.js                 # Proof of Work hash target difficulty miner
│   │   ├── pos.js                 # Stake-weighted validator lottery
│   │   ├── poa.js                 # Round-robin authority scheduler
│   │   └── pbft.js                # 4-node PBFT state machine with Byzantine fault injection
│   └── utxo/                      # Bitcoin UTXO Transaction Engine
│       └── utxo_ledger.js         # UTXO pool, inputs, outputs, and double-spend validation
├── server/                        # Backend Services
│   ├── api.js                     # Express REST API (port 3000)
│   └── oracle.js                  # SGP4 astrodynamics propagation oracle (satellite.js)
├── frontend/                      # Ground Station User Interface
│   ├── index.html                 # Ground station HTML shell and navigation rail
│   ├── src/                       # Vanilla JS application
│   │   ├── main.js                # Entry point and global status poller
│   │   ├── router.js              # Client-side hash router (8 distinct operational views)
│   │   ├── config.js              # API URLs and contract address loader
│   │   ├── styles.css             # Ground-station typography and styling
│   │   ├── pages/                 # Operational View Controllers
│   │   │   ├── overview.js        # Telemetry metrics and SVG altitude histogram
│   │   │   ├── records.js         # 1,000 canonical debris records table and search
│   │   │   ├── explorer.js        # Block explorer, parent hashing, and tamper demo
│   │   │   ├── consensus.js       # PoW miner, PoS, PoA, and UTXO simulator
│   │   │   ├── consortium.js      # PBFT round runner, fault toggles, Merkle proof verifier
│   │   │   ├── ethereum.js        # Smart contract addresses, anchors, ODC faucet, escrow
│   │   │   ├── conjunctions.js    # SGP4 propagation, screening table, on-chain alert trigger
│   │   │   └── concepts.js        # 6-Module syllabus guide and 30 viva questions
│   │   └── components/            # Data Visualization
│   │       ├── svg_altitude_chart.js # Hand-made SVG altitude histogram
│   │       └── svg_fleet_breakdown.js # Hand-made SVG fleet proportion chart
│   └── tailwind.config.js         # Restrained ground-station design tokens
├── scripts/                       # Automation and Verification Scripts
│   ├── preflight.js               # System environment health verifier
│   ├── launch_demo.js             # Single-command launcher (npm run demo)
│   ├── deploy.js                  # Smart contract deployment script (Ganache & Sepolia)
│   ├── anchor_all.js              # Iterative Layer A block root anchoring script
│   ├── demo_e2e.js                # Autonomous 10-step end-to-end integration test
│   ├── seed_data_processor.js     # Raw CSV deduplicator and canonical seed generator
│   └── reset_chain.js             # Restores Layer A state to 1,000-record seed baseline
├── data/                          # Deterministic Datasets
│   ├── seed_records.json          # 1,000 canonical Space-Track records across 25 blocks
│   ├── duplicates_demo.json       # 20 raw duplicate records for validation tests
│   ├── iridium_33_july2026.csv    # Space-Track raw OMM source data for Iridium 33
│   └── cosmos_2251_july2026.csv   # Space-Track raw OMM source data for Cosmos 2251
├── test/                          # Automated Test Suites (43 Tests Total)
│   ├── chain/                     # Layer A node:test suites (27 tests)
│   └── contracts/                 # Layer B Hardhat Chai suites (16 tests)
└── docs/                          # Comprehensive Academic Documentation and Viva Pack
    ├── PRD.md                     # Product Requirements Document
    ├── TRD.md                     # Technical Requirements Document
    ├── UI_SPEC.md                 # Design System and UI Specifications
    ├── SYLLABUS_MAP.md            # Complete 6-Module Syllabus Cross-Reference
    ├── TEST_PLAN.md               # Unit, Integration, and Manual Test Specifications
    ├── DEPLOYMENT.md              # Deployment Guide and Emergency Contingency Plans
    ├── TASKS.md                   # Phased Development and Task Breakdown
    └── PRESENTATION.md            # 11-Slide Deck, Demo Script, and 30 Viva Q&As
```

---

## 10. Academic Syllabus Alignment (Modules 1 to 6)

Orbit Ledger directly maps to the university Blockchain Technologies curriculum:

| Module | Core Topic | Concrete Implementation in Orbit Ledger |
|---|---|---|
| **Module 1** | Distributed Ledger & Cryptography | SHA-256 block hashing (`chain/block.js`), Bitcoin-style binary Merkle tree with odd leaf balancing (`chain/merkle.js`), tamper detection (`chain/blockchain.js`). |
| **Module 2** | Bitcoin & UTXO Model | Standalone UTXO ledger with input validation, unspent pool tracking, and double-spend detection (`chain/utxo/utxo_ledger.js`). |
| **Module 3** | Smart Contracts & Ethereum | Four Solidity 0.8.24 contracts (`contracts/`), OpenZeppelin v5 ERC20 and ERC721 standards, Hardhat deployment scripts. |
| **Module 4** | Consensus Mechanisms | Proof of Work miner (`chain/consensus/pow.js`), Proof of Stake lottery (`pos.js`), Proof of Authority scheduler (`poa.js`), 4-node PBFT with Byzantine fault tolerance ($N \ge 3f + 1$) (`pbft.js`). |
| **Module 5** | Smart Contract Security & Engineering | Integer math avoiding floating point error in Euclidean distance, checks-effects-interactions pattern, custom errors (`ConjunctionAlreadyReported`), EVM precompile `0x02` optimization. |
| **Module 6** | Scalability & Enterprise Architecture | Two-layer hybrid architecture: off-chain high-throughput telemetry storage anchored cryptographically to on-chain Ethereum settlement layer via state roots. |

For the complete syllabus matrix, see [docs/SYLLABUS_MAP.md](file:///Users/doodle/Developer/orbit-ledger/docs/SYLLABUS_MAP.md).  
For the 11-slide presentation guide, 10-minute demo script, and 30 viva questions and answers, see [docs/PRESENTATION.md](file:///Users/doodle/Developer/orbit-ledger/docs/PRESENTATION.md).

---

## 11. Troubleshooting and Frequently Asked Questions

### Q1: `npm run preflight` reports Node.js version error or Ganache crashes on startup.
- **Cause**: Node.js v24 is active. Ganache v7.9.2 native WebSocket bindings (`@trufflesuite/uws-js-unofficial`) are not compatible with Node 24.
- **Solution**: Switch to Node 20 LTS:
  ```bash
  nvm use 20
  # If v20 is not installed:
  nvm install 20 && nvm use 20
  ```

### Q2: Port 8545, 3000, or 5173 is already in use.
- **Cause**: A previous Ganache instance, dev server, or API process remained running in the background.
- **Solution**: Identify and terminate processes occupying the required ports:
  ```bash
  # Check ports on macOS/Linux
  lsof -i :8545
  lsof -i :3000
  lsof -i :5173

  # Kill lingering processes (replace PID with actual process ID)
  kill -9 <PID>
  ```

### Q3: `nonce too low` or transaction replacement error during contract deployment.
- **Cause**: Ganache was restarted while the client or script retained cached higher transaction nonces.
- **Solution**: Restart the deployment cleanly. The deployment script dynamically fetches `provider.getTransactionCount()`:
  ```bash
  npm run deploy:local
  npm run anchor:all
  ```

### Q4: How do I prove data immutability to an academic examiner during viva?
1. Open the Ground Station Console at [http://localhost:5173](http://localhost:5173).
2. Navigate to **Chain Explorer** (`/#/explorer`).
3. Click the **Simulate Tamper** button. The UI immediately flags Block #8 as compromised because the recomputed Merkle root deviates from the block header root.
4. Navigate to **Consortium PBFT** (`/#/consortium`) and demonstrate that the on-chain Merkle proof verification via Ethereum precompile `0x02` returns `false` for the altered record.
5. Click **Restore Chain** (or execute `npm run reset:chain`) to restore canonical state.

### Q5: How does the system handle floating point numbers in Solidity?
Solidity does not support floating point arithmetic. Orbit Ledger solves this by performing SGP4 continuous propagation off-chain in Node.js (`satellite.js`), converting coordinates ($X, Y, Z$) to integer metres (`int64`), and passing them to `ConjunctionMonitor.sol`. The contract computes integer Euclidean distance using `computeDistance` and integer square root algorithms (`Math.sqrt`).

---

## License

This project is developed for educational and academic purposes under the B.E. Artificial Intelligence & Data Science degree curriculum. Source code is licensed under the ISC License.
