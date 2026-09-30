# Orbit Ledger: Syllabus Mapping and Viva Cheat Sheet

This document maps every single topic in the university Blockchain Technologies curriculum to Orbit Ledger. A topic counts as covered if it is either built and demonstrable in working software (the primary standard) or rigorously explained in dedicated application views and technical compendia.

## Complete Syllabus Coverage Matrix

### Module 1: Introduction to Blockchain

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Distributed Ledger Technologies: History & Evolution | Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Viva: Explain evolution from centralized ledgers to distributed p2p topologies. |
| Fundamental Concepts, Components & Types | Built & Explained | `#overview`, `#concepts` | `chain/blockchain.js`, `chain/block.js` | Inspect consortium chain architecture; explain public, consortium, and private types. |
| Block Structure & Header Fields | Built | `#explorer` | `chain/block.js:createBlock()` | Inspect Block Header: index, previousHash, timestamp, merkleRoot, consensus, nonce, hash. |
| Block Header Hash | Built | `#explorer` | `chain/block.js:hashHeader()` | Show SHA-256 computation over concatenated header string. |
| Block Height & Indexing | Built | `#overview`, `#explorer` | `chain/blockchain.js:getHeight()` | Verify chain progression from Height 0 to 25. |
| Genesis Block Creation | Built | `#explorer` (Block 0) | `chain/blockchain.js:createGenesisBlock()` | Inspect Block 0: null previousHash (64 zeros), fixed timestamp, consortium charter. |
| Linking Blocks Cryptographically | Built | `#explorer` | `chain/blockchain.js:isValidChain()` | Tamper demonstration: modify Record in Block 12; watch all subsequent hashes invalidate. |
| Merkle Tree Construction & Verification | Built | `#explorer` | `chain/merkle.js:buildMerkleTree()` | Select Record 14; view 40-leaf SHA-256 tree; verify sibling path in JS and EVM. |

### Module 2: Consensus and Bitcoin

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Byzantine Generals Problem | Built & Explained | `#consortium`, `#concepts` | `chain/consensus/pbft.js` | Viva: Explain coordinating over unverified channels; demonstrate 4-node consensus. |
| Proof of Work (PoW) & Hashcash | Built | `#consensus` (PoW Tab) | `chain/consensus/pow.js:mineBlock()` | Adjust difficulty slider (1 to 5 zeros); watch live nonce ticking, hash rate, and solve. |
| Proof of Stake (PoS) | Built | `#consensus` (PoS Tab) | `chain/consensus/pos.js:selectProposer()` | Simulate 10 slots; verify proposer selection proportional to operator token stakes. |
| Proof of Authority (PoA) | Built | `#consensus` (PoA Tab) | `chain/consensus/poa.js:getProposer()` | Demonstrate round-robin rotation through authorized consortium operator whitelist. |
| Practical Byzantine Fault Tolerance (pBFT) | Built | `#consortium` | `chain/consensus/pbft.js:PBFTNode` | Run Pre-prepare -> Prepare -> Commit; inspect quorum attainment with f=1. |
| Alternative Consensus: PoET, LPoS, Proof of Burn | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Viva: Contrast SGX enclaves (PoET), leased delegation (LPoS), and unspendable burn addresses. |
| Life of a Miner, Difficulty & Mining Pools | Built & Explained | `#consensus`, `#concepts` | `chain/consensus/pow.js` | Explain stratum protocol, pool proportional payouts, and difficulty retargeting formulas. |
| Bitcoin: History, Keys & Addresses | Built & Explained | `#concepts` (Tab 2) | `chain/utxo/utxo_ledger.js` | Live derivation of secp256k1 keypair, SHA-256 + RIPEMD-160 hash to Base58 address. |
| Bitcoin Nodes, Relay & Block Propagation | Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Explain gossiping, inventory messages (inv), getdata, and orphan transaction handling. |
| Bitcoin Scripts (ScriptSig & ScriptPubKey) | Built & Explained | `#concepts` (Tab 1) | `chain/utxo/utxo_ledger.js:verifyScript()` | Inspect Forth-like stack evaluation: OP_DUP OP_HASH160 <PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG. |
| Bitcoin Transactions & Double Spending Problem | Built | `#concepts` (Tab 1: UTXO Lab) | `chain/utxo/utxo_ledger.js:spend()` | Submit valid Tx; attempt spending identical UTXO to different address; observe rejection. |

### Module 3: Ethereum and Smart Contracts

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Ethereum History, Architecture & Components | Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Trace 2014 founding, EVM state transition function, and world state trie architecture. |
| Ethereum Consensus (Ethash PoW to PoS Caspar) | Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Compare The Merge transition from mining to validator staking with 32 ETH deposits. |
| EVM, Ether Units & Gas Mechanics | Built & Explained | `#ethereum` | `contracts/DebrisLedger.sol` | Inspect gas used for `anchorRoot` transactions; explain wei, gwei, ether, and gas limit. |
| Ethereum Transactions & Accounts (EOA vs Contract) | Built | `#ethereum` | `server/oracle.js`, `contracts/` | Compare operator EOA submitting oracle reports versus `DebrisLedger` contract storage. |
| Patricia Merkle Tree (MPT), Swarm, Whisper, IPFS | Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Detail trie radices (State, Storage, Transaction, Receipt tries); contrast IPFS decentralized storage. |
| Complete Transaction Walkthrough | Built | `#ethereum`, `#overview` | `scripts/demo_e2e.js` | Trace signing, nonce increment, gas deduction, EVM execution, state root update, receipt emission. |
| Ganache Case Study | Built | Top Status Strip, `#ethereum` | `hardhat.config.js` | Live interaction with local Ganache node on port 8545 with 10 unlocked accounts. |
| Exploring Etherscan.io & Block Structure | Built | `#ethereum` | `scripts/deploy.js` | Click verified contract links to Sepolia Etherscan; inspect ABI, opcode bytecode, and logs. |
| Bitcoin versus Ethereum Architectural Matrix | Built & Explained | `#concepts` (Tab 5) | `frontend/src/pages/concepts.js` | Deep-dive table: UTXO vs Account, Script vs EVM, 10 min vs 12 sec blocks, deflationary vs elastic. |
| Smart Contracts: Concepts, Working, Oracles & Limits| Built | `#conjunctions`, `#ethereum` | `contracts/ConjunctionMonitor.sol` | Explain oracle bridge pattern; why floating-point math is done off-chain in SGP4 engine. |
| Solidity Tools, Setup, Compiler & Networks | Built | Build environment | `hardhat.config.js` | Compile with solc 0.8.24; deploy to Ganache (1337) and Sepolia (11155111). |
| Solidity Language Features (Visibility, Types, Storage)| Built | Contracts suite | `contracts/*.sol` | Inspect `view`, `pure`, `calldata`, `storage`, custom errors, mappings, and integer distance math. |

### Module 4: Private and Consortium Blockchains

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Private & Consortium Chains: Need, Features & Roles | Built | Top Navigation, `#consortium` | `contracts/DebrisLedger.sol` | Explain data confidentiality in orbit tracking; show permissioned operator roles in Solidity. |
| Smart Contracts in Private Blockchains | Built | `#ethereum` | `contracts/DebrisLedger.sol:buyAccess()`| Enforce role-based access control where only consortium members can query sensitive records. |
| Hyperledger Fabric Architecture & Frameworks | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Explain Orderer, Peers (Endorsing/Committing), MSP, Channels, and Execute-Order-Validate model. |
| Fabric Comparison with Public Blockchains | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Detailed comparative table: privacy, throughput, finality, consensus, and governance. |
| Paxos and Raft Consensus Protocols | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Explain crash-fault-tolerant (CFT) leader election and log replication; explain why CFT fails in open networks. |
| Byzantine Fault Tolerance (BFT and PBFT) | Built | `#consortium` | `chain/consensus/pbft.js` | Live simulation of 4 operator nodes reaching consensus with f=1 Byzantine fault. |
| Ripple (RPCA) and R3 Corda (Notary Services) | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Compare Ripple Unique Node Lists (UNL) and Corda point-to-point state transition notaries. |

### Module 5: Cryptocurrencies and Digital Tokens

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Cryptocurrency Basics, Types & Usage | Built & Explained | `#ethereum`, `#concepts` | `contracts/DataCredit.sol` | Demonstrate utility token used as medium of exchange for orbital batch access. |
| ERC20 Token Standard & Implementation | Built | `#ethereum` | `contracts/DataCredit.sol` | Inspect standard methods: `balanceOf`, `transfer`, `approve`, `transferFrom`. |
| ERC721 Token Standard & Implementation | Built | `#conjunctions` | `contracts/AlertCertificate.sol` | Mint unique non-fungible certificate for verified conjunction with metadata and token ID. |
| Comparison of ERC20 and ERC721 | Built & Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Contrast fungible utility credits (ODC) with non-fungible conjunction certificates (OCC). |
| ICO (Initial Coin Offering) Basics & Launch | Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Explain utility token crowdsales, smart contract escrows, tokenomics, and regulatory risks. |
| STO (Security Token Offering) vs ICO | Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Contrast regulated securities backed by real assets with unregulated speculative utility tokens. |
| Decentralized Finance (DeFi) & AMMs | Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Explain constant product automated market makers (x * y = k), liquidity pools, and flash loans. |
| Metaverse & Digital Asset Tokenization | Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Detail NFT interoperability, digital land registry, and cryptographic provenance verification. |
| Utility versus Security Tokens & Altcoins | Explained | `#concepts` (Tab 3) | `frontend/src/pages/concepts.js` | Howey Test application: investment of money in a common enterprise with expectation of profits. |
| Hot versus Cold Wallets | Built & Explained | `#concepts` (Tab 2) | `frontend/src/pages/concepts.js` | Contrast browser hot wallets (MetaMask) with air-gapped hardware cold wallets (Ledger/Trezor). |
| UTXO Model and Double Spending Mitigation | Built | `#concepts` (Tab 1: UTXO Lab) | `chain/utxo/utxo_ledger.js` | Attempt duplicate consumption of unspent output; inspect validator rejection. |

### Module 6: Applications, Tools and Case Studies

| Syllabus Topic | Coverage Type | Where in App | Where in Code | Demo / Viva Verification Step |
|---|---|---|---|---|
| Blockchain Applications Across Domains | Built & Explained | Entire Application, `#concepts` | Whole codebase | Demonstrate aerospace application: orbital debris tracking and space situational awareness. |
| Enterprise Tools: Corda, Ripple, Quorum | Explained | `#concepts` (Tab 4) | `frontend/src/pages/concepts.js` | Comparative analysis covering Quorum (Istanbul BFT), Corda, and Ripple enterprise adoption. |
| Case Study on One Platform: Orbit Ledger | Built | Entire Project | `docs/PRD.md`, `chain/`, `contracts/` | Comprehensive operational case study: hybrid consortium-public anchoring architecture. |

## Viva Quick-Reference Cheat Sheet (Key Technical Distinctions)

1. SHA-256 vs Keccak-256:
   - SHA-256 is Merkle-Damgard (FIPS 180-4); used in Bitcoin and our Layer A.
   - Keccak-256 is Sponge construction; used in Ethereum.
   - Solidity has a native SHA-256 precompile at address 0x02, allowing our on-chain verifier to validate Layer A proofs without conversion.
2. UTXO vs Account Model:
   - UTXO (Bitcoin): Stateless verification, transactions consume explicit outputs, inherent parallelization, prevents double spending through unspent pool checks.
   - Account (Ethereum): Stateful balance mapping, sequential nonces to prevent replay attacks, smaller data footprint, Turing-complete smart contracts.
3. PBFT Byzantine Quorum Formula:
   - Given N total nodes, to tolerate f Byzantine nodes, we must have `N >= 3f + 1`.
   - For N = 4 nodes, maximum tolerable faults is `f = (4 - 1) / 3 = 1`.
   - Quorum requires `2f + 1 = 3` matching votes.
   - With 1 faulty node: 3 honest nodes reach quorum; block commits.
   - With 2 faulty nodes: only 2 honest nodes remain; quorum of 3 is unreachable; chain halts safely to prevent split-brain forks.
4. Off-Chain Oracle Rationale:
   - SGP4 orbital propagation involves non-linear trigonometric functions and floating-point values.
   - EVM is deterministic and integer-only. Floating-point rounding differs across CPU architectures, breaking consensus.
   - Solution: Oracle runs SGP4 off-chain, converts positions to integer metres, and the contract verifies squared Euclidean distance on-chain.
