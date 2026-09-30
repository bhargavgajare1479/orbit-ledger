# Orbit Ledger: Implementation Task Breakdown (TASKS)

## 1. Overview and Execution Principles

This task plan defines the sequential phases for constructing Orbit Ledger. Each phase has a distinct technical goal, an explicit list of affected files, and a verifiable "done when" acceptance check.

Progress proceeds strictly in order. After each phase, automated test suites validate correctness before proceeding to the subsequent phase.

## 2. Phase Breakdown

### Phase 0: Project Foundation and Environment Configuration
- Goal: Establish Node.js LTS v20 environment, configure Hardhat with ethers v6 and OpenZeppelin v5, set up package structure, and verify local Ganache integration.
- Files to Create/Modify:
  - `.nvmrc`
  - `package.json`
  - `.env.example`
  - `hardhat.config.js`
- Done When:
  - `node -v` reports v20.x.
  - `npx hardhat compile` succeeds with zero errors.
  - Ganache starts locally and responds to `eth_blockNumber`.

### Phase 1: Data Preprocessing and Deterministic Seed Pipeline
- Goal: Parse `iridium_33_july2026.csv` and `cosmos_2251_july2026.csv`, deduplicate records, extract 1,000 canonical records across 25 blocks of 40 records, and isolate duplicate demo fixtures.
- Files to Create/Modify:
  - `scripts/seed_data_processor.js`
  - `data/seed_records.json`
  - `data/duplicates_demo.json`
- Done When:
  - `data/seed_records.json` contains exactly 1,000 records partitioned into 25 blocks.
  - `data/duplicates_demo.json` contains 20 real duplicate records for testing duplicate rejection.
  - Re-running the script produces identical SHA-256 file checksums.

### Phase 2: Layer A Blockchain Core and Custom Merkle Engine
- Goal: Implement Block data structures, SHA-256 header hashing, blockchain state verification, and custom Merkle tree construction with sibling proof generation.
- Files to Create/Modify:
  - `chain/block.js`
  - `chain/merkle.js`
  - `chain/blockchain.js`
  - `test/chain/blockchain.test.js`
  - `test/chain/merkle.test.js`
- Done When:
  - `node --test test/chain/blockchain.test.js` passes (genesis initialization, block linking, tamper cascade detection, duplicate record rejection).
  - `node --test test/chain/merkle.test.js` passes (odd/even leaf counts, proof generation, root validation).

### Phase 3: Layer A Consensus Engines
- Goal: Build interactive consensus algorithms: Proof of Work (PoW with nonce hashing and difficulty), Proof of Stake (PoS stake-weighted lottery), Proof of Authority (PoA round-robin), and a 4-node PBFT consortium state machine with Byzantine fault injection.
- Files to Create/Modify:
  - `chain/consensus/pow.js`
  - `chain/consensus/pos.js`
  - `chain/consensus/poa.js`
  - `chain/consensus/pbft.js`
  - `test/chain/pow.test.js`
  - `test/chain/pos.test.js`
  - `test/chain/poa.test.js`
  - `test/chain/pbft.test.js`
- Done When:
  - `node --test test/chain/pow.test.js` validates leading zeros search at difficulty 1 through 4.
  - `node --test test/chain/pbft.test.js` verifies 4-node consensus with 0 and 1 faulty nodes, and verifies protocol halt with 2 faulty nodes.

### Phase 4: Standalone UTXO Engine and Double-Spend Simulation
- Goal: Implement an isolated Bitcoin-style UTXO ledger class with transaction inputs, transaction outputs, script verification, and double-spending detection.
- Files to Create/Modify:
  - `chain/utxo/utxo_ledger.js`
  - `test/chain/utxo.test.js`
- Done When:
  - `node --test test/chain/utxo.test.js` validates creation of UTXOs, successful spending, and immediate rejection of attempted double-spending.

### Phase 5: Layer B Smart Contracts
- Goal: Implement the four Solidity contracts using OpenZeppelin v5 and custom integer distance logic.
- Files to Create/Modify:
  - `contracts/DataCredit.sol` (ERC20 utility token)
  - `contracts/AlertCertificate.sol` (ERC721 non-fungible certificate)
  - `contracts/DebrisLedger.sol` (Root anchoring, on-chain SHA-256 Merkle proof verification, access purchase)
  - `contracts/ConjunctionMonitor.sol` (Integer distance calculation, squared threshold comparison, duplicate alert prevention)
- Done When:
  - `npx hardhat compile` compiles all contracts without warnings.
  - Contract bytecodes adhere to `shanghai` EVM version.

### Phase 6: Contract Unit Tests and Deployment Automation
- Goal: Validate all contract mechanics via Hardhat Chai tests, including a crucial cross-language test verifying JavaScript-generated Merkle proofs inside Solidity.
- Files to Create/Modify:
  - `test/contracts/DebrisLedger.test.js`
  - `test/contracts/ConjunctionMonitor.test.js`
  - `test/contracts/DataCredit.test.js`
  - `scripts/deploy.js`
- Done When:
  - `npx hardhat test` passes all tests with 100% green assertions.
  - Test verifying a JavaScript-generated proof from `chain/merkle.js` inside `DebrisLedger.verifyRecord()` passes.
  - `scripts/deploy.js` deploys to local Ganache and writes `deployments/ganache.json`.

### Phase 7: REST API and Astrodynamics Oracle Service
- Goal: Build Express backend serving Layer A state, PBFT triggers, and an automated SGP4 conjunction screening oracle using `satellite.js`.
- Files to Create/Modify:
  - `server/api.js`
  - `server/oracle.js`
  - `server/seed.js`
- Done When:
  - `GET /api/status` returns height 25 and network status.
  - `GET /api/blocks/1/proof/0` returns valid sibling proof.
  - `GET /api/conjunctions/screen` calculates orbital distances and returns candidate pairs within threshold.

### Phase 8: Front-End Ground Station Console
- Goal: Build the Vite vanilla JavaScript front-end adhering to `UI_SPEC.md` design tokens, self-hosting IBM Plex fonts, implementing client-side hash routing, and rendering eight dense, austere pages with two custom SVG charts.
- Files to Create/Modify:
  - `frontend/index.html`
  - `frontend/src/styles.css`
  - `frontend/src/main.js`
  - `frontend/src/router.js`
  - `frontend/src/api.js`
  - `frontend/src/pages/overview.js`
  - `frontend/src/pages/records.js`
  - `frontend/src/pages/explorer.js`
  - `frontend/src/pages/consensus.js`
  - `frontend/src/pages/consortium.js`
  - `frontend/src/pages/ethereum.js`
  - `frontend/src/pages/conjunctions.js`
  - `frontend/src/pages/concepts.js`
  - `frontend/src/components/svg_altitude_chart.js`
  - `frontend/src/components/svg_conjunction_chart.js`
- Done When:
  - Front-end builds cleanly via `npm run build` in `frontend/`.
  - UI renders properly without console errors.
  - Hash navigation switches cleanly across all eight pages.
  - No default Tailwind palette or stock UI styling visible.

### Phase 9: System Integration, Preflight Script, and E2E Automation
- Goal: Create single-command demo launcher, preflight environment verifier, and end-to-end integration test runner.
- Files to Create/Modify:
  - `scripts/preflight.js`
  - `scripts/demo_e2e.js`
  - Root `package.json` scripts: `npm test`, `npm run demo`, `npm run preflight`.
- Done When:
  - `npm run preflight` checks all prerequisites and outputs green status.
  - `node scripts/demo_e2e.js` executes full lifecycle (seed, deploy, anchor, verify proof, screen, report alert, buy access) and exits 0.
  - `npm test` runs both contract tests and chain tests successfully.

### Phase 10: Clean Directory Verification and Final Polish
- Goal: Clone repo to clean scratch directory, follow README instructions from scratch, and verify that the application starts with zero manual interventions.
- Files to Create/Modify:
  - `README.md`
  - `CHANGELOG.md`
- Done When:
  - Fresh clone runs `npm install && npm run demo` without human intervention.
  - Codebase is free of dead code, commented-out experiments, and TODO comments.
