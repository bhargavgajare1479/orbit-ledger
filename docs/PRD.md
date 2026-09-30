# Orbit Ledger: Product Requirements Document (PRD)

## 1. Document Overview

This document specifies the requirements for Orbit Ledger, an immutable shared ledger and conjunction screening system for space debris tracking. It serves as the baseline for the Blockchain Technologies mini project, covering all six syllabus modules through a two-layer architecture: a custom Node.js educational blockchain (Layer A) and a set of EVM smart contracts (Layer B).

### 1.1 Project Title Evaluation

The project working title is Orbit Ledger. Considered alternatives included Ephemeris Ledger (technically precise for orbital mechanics, but unnecessarily obscure for general evaluation) and DebrisChain (colloquial and typical of marketing tropes). Orbit Ledger is retained as the definitive name because it cleanly describes the domain (orbital data), the primary data structure (a distributed ledger), and fits the austere tone of an aerospace engineering logbook.

## 2. Problem Statement

Low Earth Orbit (LEO) is increasingly congested. The legacy 2009 collision between Iridium 33 and Cosmos 2251 generated thousands of trackable fragments that continue to threaten active satellites and crewed spacecraft. Satellite operators currently rely on centralized clearinghouses (such as the United States Space Command's Space-Track system) or private bilateral data exchanges to coordinate space situational awareness.

This centralized model exhibits three core operational vulnerabilities:

1. Data Tampering and Non-Repudiation: Orbital ephemerides and Two-Line Element sets (TLEs) published by one operator can be disputed or retroactively altered if a collision occurs. Without cryptographic hashing and timestamping, post-incident liability investigations become contested swearing contests.
2. Inflexible Bilateral Access Control: Commercial and sovereign operators are reluctant to release raw sensor data without economic reciprocation or access constraints. Current systems lack granular micropayment rails for selective data disclosure.
3. Fragmented Conjunction Alerts: Collision warnings are calculated in siloes. Operators must independently run screening algorithms without an immutable public record of when warnings were computed, what threshold was evaluated, or which entity published the underlying state vector.

Orbit Ledger addresses these issues by providing a deterministic, cryptographically linked orbital data chain that anchors Merkle roots to Ethereum, offers ERC20-based data monetization, and automates conjunction screening verification with non-fungible ERC721 safety certificates.

## 3. Users and Personas

### 3.1 Primary Persona: The Satellite Operator (Simulated)

- Profile: Flight dynamics engineers at commercial constellations (for example, Iridium Satellite LLC) and state agencies (for example, Roscosmos).
- Needs:
  - Submit batch orbital ephemeris records (TLEs, state vectors, epoch timestamps) signed by authorized operator keys.
  - Verify that a given orbital record published by another operator has not been altered since publication.
  - Purchase access to proprietary or high-precision orbital batches using on-chain utility tokens.
  - Receive cryptographic conjunction alerts when an external object approaches within a critical threshold.
- Context: In this implementation, four operator nodes (Node 1 Alpha, Node 2 Beta, Node 3 Gamma, Node 4 Delta) represent a consortium network.

### 3.2 Secondary Persona: The Academic Examiner and Viva Jury

- Profile: University faculty evaluating the final-year B.E. mini project for the Blockchain Technologies subject.
- Needs:
  - Verify that all six modules of the curriculum are thoroughly addressed through working code, interactive simulations, or architectural comparisons.
  - Observe transparent cryptographic primitives in action: block construction, SHA-256 header hashing, Merkle tree generation, Merkle proof validation, difficulty-based proof-of-work, and fault-tolerant Byzantine agreement.
  - Inspect on-chain execution on Ganache (local) and Sepolia (public testnet) without unexpected failures or opaque abstractions.
  - Cross-examine the student on core trade-offs: SHA-256 versus keccak256, UTXO versus Account models, PoW versus PoS and PBFT, and Layer 1 versus Layer 2 anchoring.

## 4. Goals and Non-Goals

### 4.1 Goals

1. Deterministic Layer A Chain: Implement a fully transparent blockchain in pure Node.js showing genesis creation, SHA-256 hashing, parent hash pointer linking, and custom Merkle tree generation over real Space-Track orbital data.
2. Demonstrable Multi-Consensus Engine: Build working, selectable consensus mechanisms: Proof of Work (PoW) with adjustable leading-zero difficulty, Proof of Stake (PoS) proposer selection, Proof of Authority (PoA) round-robin, and a 4-node Practical Byzantine Fault Tolerance (PBFT) consensus simulation with explicit fault injection.
3. Cryptographic Anchoring: Anchor Layer A block Merkle roots to an Ethereum smart contract (`DebrisLedger`), enabling single-record verification via SHA-256 Merkle inclusion proofs computed off-chain and validated in EVM bytecode.
4. Tokenized Economic Rail: Implement an ERC20 token (`DataCredit`) allowing operators to buy access to private orbital record sets, enforcing `approve` and `transferFrom` flows.
5. Automated Conjunction Screening: Implement an off-chain oracle that calculates inter-satellite distances at common epochs using SGP4 propagation via `satellite.js`, feeding integer positions into `ConjunctionMonitor`, which evaluates squared distances, prevents duplicate alerts, and mints an ERC721 `AlertCertificate`.
6. Interactive Concept Lab: Provide an isolated UTXO double-spending simulator, hot versus cold wallet comparisons, and comprehensive reference modules covering ICO/STO, DeFi, Metaverse, and consortium platform trade-offs (Fabric, Corda, Ripple, Quorum, Paxos, Raft).
7. Flawless Local Demonstration: Guarantee zero-surprise live execution on local Ganache and node test runners, with deterministic seeding from the July 2026 Space-Track collision debris datasets.

### 4.2 Non-Goals

1. Operational Spacecraft Navigation: Orbit Ledger is an educational screening and audit ledger, not an operational real-time collision avoidance system. TLE data has an inherent physical uncertainty of 1 to 5 kilometres.
2. Full Hyperledger Fabric Network Deployment: Running a production Hyperledger Fabric network with Docker daemon dependencies, Go chaincode containers, and multi-organization crypto-materials is excluded due to live demo fragility. Fabric concepts are satisfied through our PBFT consortium engine, smart contract access control, and dedicated comparison matrices.
3. Complex Front-End Frameworks: React, Vue, Angular, and heavy UI component libraries (shadcn, DaisyUI) are excluded to ensure the student can explain every line of JavaScript and DOM manipulation.
4. Database Dependency: External databases (PostgreSQL, MongoDB, SQLite) are omitted in favor of atomic, human-readable JSON flat files.
5. Mainnet Financial Deployment: All Layer B smart contracts are restricted to local Ganache and Ethereum Sepolia testnets. Real monetary value is neither required nor supported.

## 5. Feature List and Priority Ranking

Features are categorized by MoSCoW prioritization:

| Feature ID | Feature Name | Description | Priority | Syllabus Module |
|---|---|---|---|---|
| F-01 | Deterministic Seed Chain | Ingestion of 1,000 real Iridium 33 and Cosmos 2251 records into 25 deterministic blocks of 40 records plus genesis. | Must Have | Module 1 |
| F-02 | Block and Merkle Explorer | Complete visual breakdown of block headers, SHA-256 hashes, Merkle root derivation, and tree visualization. | Must Have | Module 1, Module 3 |
| F-03 | Proof-of-Work Mining | Live mining simulator with adjustable difficulty (leading hex zeros), nonce search rate, and tamper detection. | Must Have | Module 2 |
| F-04 | Alternative Consensus (PoS/PoA) | Interactive execution of Proof of Stake (weighted selection) and Proof of Authority (authorized validator rotation). | Must Have | Module 2 |
| F-05 | 4-Node PBFT Consortium | Four-operator PBFT state machine (Pre-prepare, Prepare, Commit) with live fault injection (1 offline node, 2 faulty nodes). | Must Have | Module 2, Module 4 |
| F-06 | EVM Layer Anchoring | Solidity contract (`DebrisLedger`) recording Layer A block numbers, Merkle roots, timestamps, and operator signatures. | Must Have | Module 3 |
| F-07 | On-Chain Merkle Proof Verifier | Pure SHA-256 Merkle proof verification function in Solidity matching Node.js leaf and pair ordering. | Must Have | Module 1, Module 3 |
| F-08 | Conjunction Screening Oracle | Off-chain SGP4 propagation calculating relative distance in metres and submitting to `ConjunctionMonitor`. | Must Have | Module 3 |
| F-09 | Conjunction Alert & NFT Minting | Smart contract logic computing squared Euclidean distances, logging alerts, and minting ERC721 `AlertCertificate`. | Must Have | Module 3, Module 5 |
| F-10 | Data Monetization (ERC20) | `DataCredit` ERC20 token facilitating operator-to-operator data set unlocking via `approve` and `transferFrom`. | Must Have | Module 5 |
| F-11 | Interactive UTXO Double-Spend Lab | Standalone UTXO ledger allowing examiners to simulate valid transactions and test double-spending rejections. | Must Have | Module 2, Module 5 |
| F-12 | Syllabus & Concept Compendium | Dedicated interactive pages covering Bitcoin vs Ethereum, hot/cold wallets, ICO vs STO, DeFi, and Fabric/Corda/Ripple/Quorum. | Must Have | Module 2, 4, 5, 6 |
| F-13 | Dual Scatter Charts (SVG) | Custom SVG charts for Altitude vs Inclination (bimodal cluster) and Miss Distance vs Threshold. | Should Have | UI Restraint |
| F-14 | Sepolia Testnet Deployment | Public verification on Sepolia testnet with Etherscan verification for live contract inspection. | Should Have | Module 3 |

## 6. Functional Acceptance Criteria

### F-01: Deterministic Seed Chain
- Criterion 1.1: The system parses `iridium_33_july2026.csv` and `cosmos_2251_july2026.csv`, deduplicating records by `(NORAD_CAT_ID, EPOCH)`.
- Criterion 1.2: A fixed subset of 1,000 records (500 Iridium 33 fragments, 500 Cosmos 2251 fragments) is selected chronologically from July 1, 2026 onwards.
- Criterion 1.3: Records are partitioned into exactly 25 blocks of 40 records each.
- Criterion 1.4: Genesis block (Block 0) has fixed deterministic parameters: previous hash of 64 zeros, predefined timestamp, and genesis state.
- Criterion 1.5: Re-running the generation script on any system produces the exact same block hashes and Merkle roots bit for bit.
- Criterion 1.6: Duplicate records separated during preprocessing are preserved in a test fixture to demonstrate immediate rejection by the chain.

### F-02: Block and Merkle Explorer
- Criterion 2.1: UI displays the full chain list showing index, block hash, previous hash, timestamp UTC, record count, and Merkle root.
- Criterion 2.2: Clicking a block displays all 40 orbital records with NORAD ID, Object Name, Epoch UTC, Inclination, Semimajor Axis, and record SHA-256 hash.
- Criterion 2.3: Merkle proof generator allows selecting any record and generating its sibling hash path.
- Criterion 2.4: Tampering with a single character in an existing record immediately turns subsequent block hashes red and invalidates the chain validation check.

### F-03: Proof-of-Work Mining Engine
- Criterion 3.1: Configurable difficulty parameter ranging from 1 to 5 leading hex zeros.
- Criterion 3.2: Live mining UI displays current nonce, elapsed time in milliseconds, instantaneous hash rate (hashes/sec), and resulting hash.
- Criterion 3.3: Difficulty 1 to 3 completes in less than 3 seconds on standard consumer hardware for crisp demonstration.
- Criterion 3.4: The candidate block is appended to the chain only when the SHA-256 hash satisfies the target difficulty.

### F-04: Alternative Consensus Mechanisms (PoS and PoA)
- Criterion 4.1: PoS module allocates stakes to four operators (for example: Node 1 = 40%, Node 2 = 30%, Node 3 = 20%, Node 4 = 10%).
- Criterion 4.2: Proposer selection uses deterministic pseudo-random sampling seeded by the previous block hash and slot number, demonstrating stake-proportional block production.
- Criterion 4.3: PoA module rotates the proposer sequentially through an authorized validator whitelist, rejecting signatures from non-whitelisted addresses.

### F-05: 4-Node PBFT Consortium
- Criterion 5.1: Simulates four independent operator nodes communicating via in-memory message buses.
- Criterion 5.2: Protocol executes three phases: Pre-Prepare (primary node broadcasts proposal), Prepare (nodes broadcast prepare votes, reach 2f + 1 quorum), and Commit (nodes broadcast commit votes, reach 2f + 1 quorum).
- Criterion 5.3: Normal execution with 4 honest nodes reaches consensus and commits the block with unanimous cryptographic signatures.
- Criterion 5.4: Fault Injection Mode 1 (1 node offline or faulty): Consortium still reaches 3/4 quorum and successfully commits, proving tolerance where 3f + 1 = 4 with f = 1.
- Criterion 5.5: Fault Injection Mode 2 (2 nodes faulty or offline): Consortium fails to reach quorum (only 2 valid votes out of 3 required), halting block generation and outputting an explicit explanatory trace.

### F-06 and F-07: Ethereum Anchoring and On-Chain Proof Verification
- Criterion 6.1: `DebrisLedger.sol` stores anchored roots in a mapping keyed by block index: `mapping(uint256 => BlockAnchor) public anchors`.
- Criterion 6.2: Only the designated operator role can call `anchorRoot(uint256 blockIndex, bytes32 root, uint256 recordCount, uint256 blockTimestamp)`.
- Criterion 6.3: `verifyRecord(uint256 blockIndex, bytes32 leafHash, bytes32[] calldata proof, uint256 leafIndex)` computes SHA-256 hashes up the tree inside EVM bytecode and returns `true` if and only if the calculated root matches the anchored root.
- Criterion 6.4: The verification function is a pure/view calculation requiring zero gas fees when queried via eth_call.

### F-08 and F-09: Conjunction Screening and Alert Certificate Minting
- Criterion 8.1: The off-chain oracle loads TLE data for candidate pairs at identical timestamps, runs `satellite.js` SGP4 propagation, and calculates integer Cartesian coordinates (X, Y, Z in metres).
- Criterion 8.2: Conjunction candidate data is submitted to `ConjunctionMonitor.sol` via `reportConjunction(uint256 object1Id, uint256 object2Id, uint256 epoch, int64[3] pos1, int64[3] pos2)`.
- Criterion 8.3: The contract computes squared Euclidean distance: `dx^2 + dy^2 + dz^2` using integer math, avoiding floating-point rounding errors.
- Criterion 8.4: If the squared distance is less than or equal to the squared threshold, the contract stores the conjunction, emits `ConjunctionDetected`, and mints an ERC721 `AlertCertificate` to the reporting operator.
- Criterion 8.5: Submitting the same object pair and epoch twice is rejected by the contract with a custom error `ConjunctionAlreadyReported`.

### F-10: Data Credit Monetization (ERC20)
- Criterion 10.1: `DataCredit.sol` implements ERC20 standard with name "Orbit Data Credit" and symbol "ODC".
- Criterion 10.2: Operators hold balances of ODC.
- Criterion 10.3: `DebrisLedger.buyAccess(uint256 blockIndex)` calls `dataCredit.transferFrom(msg.sender, publisher, accessFee)`.
- Criterion 10.4: Successful payment emits `AccessPurchased` and registers the buyer in an authorized viewer registry.

### F-11: UTXO Double-Spend Lab
- Criterion 11.1: Standalone JavaScript class modeling Bitcoin-style Transaction Inputs (TxIn referencing previous TxId and output index) and Transaction Outputs (TxOut with value and locking script/address).
- Criterion 11.2: Maintains an in-memory UTXO pool.
- Criterion 11.3: User can compose a transaction spending Output A to Address B.
- Criterion 11.4: User can attempt to create a conflicting transaction spending Output A to Address C.
- Criterion 11.5: The simulator accepts the first transaction, deletes Output A from the UTXO pool, and rejects the second transaction with an explicit error explaining the double-spend detection.

### F-12: Concept and Syllabus Reference Hub
- Criterion 12.1: A dedicated UI view presenting exact academic definitions, trade-off tables, and code cross-references for every syllabus topic.
- Criterion 12.2: Covers Bitcoin vs Ethereum (UTXO vs Account, Script vs EVM, Proof-of-Work vs Proof-of-Stake), Hot vs Cold Wallets, Token standards (ERC20 vs ERC721, ICO vs STO), DeFi and Metaverse relevance, and Consortium Blockchain frameworks (Fabric, Corda, Ripple, Quorum, Paxos, Raft).

## 7. Assumptions and Constraints

1. Execution Environment: The entire stack executes on macOS with Node.js LTS v20.20.2.
2. Web3 Provider: Local execution connects to Ganache running on `http://127.0.0.1:8545` (Network ID 1337). Public execution connects to Sepolia via standard Infura/Alchemy RPC endpoints.
3. Cryptographic Consistency: SHA-256 is the sole hashing algorithm utilized across Layer A and Layer B Merkle proofs. Keccak256 is restricted to standard Ethereum internals (contract addresses, transaction hashes).
4. No Em Dashes: In compliance with project guidelines, all documentation, comments, and interface copy strictly refrain from using em dashes.
