# Orbit Ledger

An immutable consortium architecture and conjunction screening console for space debris tracking. Built for the university Blockchain Technologies mini project (B.E. Artificial Intelligence & Data Science).

Orbit Ledger solves the problem of post-collision orbital data tampering, fragmented conjunction alerting, and bilateral data sharing barriers through a two-layer hybrid architecture:

1. Layer A (Consortium Chain): A custom distributed ledger in pure Node.js implementing block creation, SHA-256 parent hash linking, custom Merkle tree generation over 1,000 real Space-Track collision records, and selectable consensus mechanisms (PoW, PoS, PoA, and 4-node PBFT with fault injection).
2. Layer B (Ethereum Smart Contracts): Four Solidity 0.8.24 contracts deployed to Ganache and Sepolia providing root anchoring, pure on-chain SHA-256 Merkle proof verification, ERC20 data monetization, and ERC721 alert certificate issuance.

---

## 1. Quickstart Guide

### Prerequisites
- Node.js LTS v20.x (v20.20.2 recommended):
  ```bash
  nvm use 20
  ```
- npm v10+

### Installation and Environment Verification

```bash
# 1. Clone repository
git clone <repo-url> orbit-ledger
cd orbit-ledger

# 2. Install root dependencies
npm install

# 3. Install frontend dependencies
npm run frontend:install

# 4. Verify system environment
npm run preflight
```

### Running All Automated Tests

```bash
# Runs 27 Layer A chain tests + 16 Layer B contract tests (43 tests total)
npm test
```

### Starting the Live Demo Environment

A single command starts local Ganache, deploys the four smart contracts, anchors the 25 Layer A block roots, launches the REST API, and starts the Vite console:

```bash
npm run demo
```

Once started, open your browser to:
- Ground Station Console: [http://localhost:5173](http://localhost:5173)
- REST API Server: [http://localhost:3000](http://localhost:3000)
- Ganache Local RPC: `http://127.0.0.1:8545` (Chain ID: 1337)

---

## 2. Architecture and Data Flow

```
[Space-Track OMM Data] -> [1,000 Records / 25 Blocks] -> [Custom SHA-256 Merkle Tree]
                                                                  |
                      +-------------------------------------------+
                      | Merkle Root
                      v
             [DebrisLedger.sol] <--- [On-Chain SHA-256 verifyRecord() view call]
                      ^
                      | ERC20 approve/transferFrom
             [DataCredit.sol] (ODC)
                      ^
                      | Conjunction Alert
          [ConjunctionMonitor.sol] ---> Mints [AlertCertificate.sol] (OCC ERC721)
                      ^
                      | Integer Metres [X, Y, Z]
          [SGP4 Oracle: satellite.js]
```

---

## 3. Project Directory Map

```
orbit-ledger/
├── .nvmrc                         # Node v20.20.2 LTS pin
├── package.json                   # Root dependencies and scripts
├── hardhat.config.js              # Hardhat configuration (Ganache & Sepolia)
├── contracts/                     # Layer B Solidity Smart Contracts
│   ├── DataCredit.sol             # ERC20 Utility Token (ODC)
│   ├── AlertCertificate.sol       # ERC721 NFT Certificate (OCC)
│   ├── DebrisLedger.sol           # State Anchor & SHA-256 Proof Verifier
│   └── ConjunctionMonitor.sol     # Integer Distance Screening
├── chain/                         # Layer A Custom Blockchain
│   ├── block.js                   # Block headers & canonical hashing
│   ├── merkle.js                  # Bitcoin-standard SHA-256 Merkle tree
│   ├── blockchain.js              # State manager & tamper detector
│   ├── consensus/                 # PoW, PoS, PoA, and 4-node PBFT
│   └── utxo/                      # Standalone Bitcoin UTXO simulator
├── server/                        # Backend Services
│   ├── api.js                     # Express REST API (port 3000)
│   └── oracle.js                  # SGP4 astrodynamics propagation oracle
├── frontend/                      # Ground Station User Interface
│   ├── index.html                 # Console shell
│   ├── src/                       # Vite vanilla JS application
│   │   ├── main.js                # App entrypoint
│   │   ├── router.js              # Hash router (8 distinct views)
│   │   ├── pages/                 # Overview, Records, Explorer, etc.
│   │   └── components/            # Hand-made SVG charts
│   └── tailwind.config.js         # Restrained UI_SPEC design tokens
├── scripts/                       # Automation
│   ├── deploy.js                  # Contract deployment script
│   ├── preflight.js               # Environment verification script
│   ├── launch_demo.js             # Single-command demo launcher
│   ├── demo_e2e.js                # Autonomous 10-step E2E integration runner
│   └── seed_data_processor.js     # Deterministic CSV ingestion script
├── data/                          # Deterministic Datasets
│   ├── seed_records.json          # 1,000 canonical orbital records
│   └── duplicates_demo.json       # 20 raw duplicates for rejection tests
├── test/                          # Comprehensive Automated Test Suites
│   ├── chain/                     # node:test suites (27 tests)
│   └── contracts/                 # Hardhat Chai suites (16 tests)
└── docs/                          # Comprehensive Specifications & Viva Pack
    ├── PRD.md                     # Product Requirements Document
    ├── TRD.md                     # Technical Requirements Document
    ├── UI_SPEC.md                 # Design System & Page Specifications
    ├── SYLLABUS_MAP.md            # Complete 6-Module Syllabus Matrix
    ├── TEST_PLAN.md               # Unit, Integration, and Manual Test Plans
    ├── DEPLOYMENT.md              # Local, Sepolia, and Fallback Guides
    ├── TASKS.md                   # Phased Implementation Plan
    └── PRESENTATION.md            # 11-Slide Deck, Demo Script & 30 Viva Q&As
```

---

## 4. Key Available Scripts

| Command | Action |
|---|---|
| `npm run preflight` | Verifies Node.js version, Ganache reachability, and seed data integrity. |
| `npm test` | Executes all 43 automated tests (27 chain + 16 contract). |
| `npm run test:chain` | Runs Layer A unit tests using native `node:test`. |
| `npm run test:contracts` | Runs Layer B smart contract tests using Hardhat. |
| `npm run test:e2e` | Runs autonomous 10-step end-to-end integration lifecycle script. |
| `npm run demo` | Single-command launch of Ganache, contracts, API, and frontend. |
| `npm run deploy:local` | Deploys contracts to local Ganache network on port 8545. |
| `npm run deploy:sepolia` | Deploys contracts to Ethereum Sepolia testnet. |
| `npm run reset:chain` | Restores Layer A state to the deterministic 1,000-record seed baseline. |

---

## 5. Academic Documentation and Viva Pack

Detailed guides for academic evaluation are located in the `/docs` directory:
- [docs/SYLLABUS_MAP.md](file:///Users/doodle/Developer/orbit-ledger/docs/SYLLABUS_MAP.md): Detailed syllabus topic cross-reference table.
- [docs/PRESENTATION.md](file:///Users/doodle/Developer/orbit-ledger/docs/PRESENTATION.md): 11-slide presentation outline, 10-minute demo script, and 30 likely viva questions with answers.
- [docs/DEPLOYMENT.md](file:///Users/doodle/Developer/orbit-ledger/docs/DEPLOYMENT.md): Step-by-step local and Sepolia deployment guidelines and contingency plans.
