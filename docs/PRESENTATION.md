# Orbit Ledger: Presentation Deck, Demo Script, and Viva Pack (PRESENTATION)

## 1. Presentation Deck Outline (11 Slides)

### Slide 1: Title and Overview
- Slide Title: Orbit Ledger: An Immutable Consortium Architecture for Space Debris Tracking and Conjunction Screening
- Subtitle: Final Year B.E. Mini Project: Blockchain Technologies (Department of AI & Data Science)
- Visual Aid: Diagram showing Low Earth Orbit debris fragmentation from the 2009 Iridium-Cosmos collision transitioning into a cryptographically anchored distributed ledger.
- Key Talking Points:
  - Space debris in LEO has reached critical density following catastrophic collisions.
  - Current coordination relies on centralized clearinghouses with data alteration risks and fragmented alerting.
  - Orbit Ledger solves this with a two-layer architecture: a Layer A consortium blockchain anchoring state roots to Layer B Ethereum smart contracts.

### Slide 2: Problem Statement and Astrodynamics Context
- Slide Title: Collision Legacy and Operational Vulnerabilities
- Visual Aid: Dual-cluster scatter plot showing the 86.3° inclination shell of Iridium 33 fragments versus the 74.05° inclination shell of Cosmos 2251 fragments.
- Key Talking Points:
  - 2009 collision generated thousands of hypervelocity fragments that threaten active assets.
  - Problem 1: No tamper-proof trail of published orbital ephemerides (TLEs).
  - Problem 2: Lack of transparent, machine-verifiable conjunction screening.
  - Problem 3: No economic exchange rail for proprietary high-precision tracking data.

### Slide 3: Two-Layer Architecture Overview
- Slide Title: Architectural Strategy: Layer A Consortium & Layer B EVM Anchoring
- Visual Aid: Block diagram showing 4-node Layer A (Node.js) passing Merkle roots across a cryptographic bridge to Layer B smart contracts on Ganache and Sepolia.
- Key Talking Points:
  - Layer A: Educational custom blockchain built from first principles (SHA-256 linking, Merkle trees, multi-consensus).
  - Layer B: Production EVM contracts providing immutable root registry, on-chain Merkle proof verification, ERC20 data monetization, and ERC721 certificate issuance.
  - Anchoring pattern eliminates high gas fees while retaining public Ethereum finality.

### Slide 4: Cryptographic Primitives: Hashing and Merkle Trees (Module 1)
- Slide Title: Data Integrity from First Principles
- Visual Aid: Step-by-step diagram showing 40 orbital records per block, SHA-256 leaf derivation, odd leaf balancing, and binary tree aggregation into a 32-byte Merkle root.
- Key Talking Points:
  - Explain why Layer A uses SHA-256 (NIST FIPS 180-4) instead of Keccak-256: direct compatibility with Bitcoin fundamentals and EVM precompile 0x02 (`sha256()`).
  - Demonstrate that modifying a single character in an orbital record invalidates every subsequent block hash.
  - Merkle proofs allow verifying any individual orbital record in O(log N) time with zero Ethereum storage costs.

### Slide 5: Consensus Mechanics: PoW, PoS, and PoA (Module 2)
- Slide Title: Multi-Consensus Exploration: Work, Stake, and Authority
- Visual Aid: Side-by-side comparison cards illustrating Hashcash nonce search, stake lottery threshold mapping, and round-robin authority rotation.
- Key Talking Points:
  - Proof of Work: Interactive difficulty adjustment (1 to 5 leading hex zeros) with real-time hash rate and nonce counters.
  - Proof of Stake: Proposer selection proportional to operator token stake (Node Alpha 40%, Beta 30%, Gamma 20%, Delta 10%).
  - Proof of Authority: Consortium rotation enforcing signed blocks from authorized operator keys.

### Slide 6: Consortium Consensus: 4-Node PBFT State Machine (Module 4)
- Slide Title: Practical Byzantine Fault Tolerance in Space Operations
- Visual Aid: Sequence diagram of PBFT message phases: Request -> Pre-Prepare -> Prepare -> Commit -> Committed state.
- Key Talking Points:
  - Castro-Liskov PBFT implementation for four simulated operator nodes.
  - Formula `3f + 1 = 4` dictates tolerance of `f = 1` Byzantine failure with a quorum of `2f + 1 = 3`.
  - Live fault injection: 1 faulty node allows consensus to commit; 2 faulty nodes halts the chain safely, preventing split-brain states.

### Slide 7: Bitcoin Primitives and the UTXO Double-Spend Lab (Module 2 & 5)
- Slide Title: UTXO Accounting and Double-Spending Mitigation
- Visual Aid: Visual flow of Transaction Inputs referencing previous Output IDs, script validation, and UTXO pool updates.
- Key Talking Points:
  - Contrast Bitcoin UTXO model with Ethereum Account model.
  - Live interactive lab demonstrating how duplicate consumption of unspent outputs is detected and rejected.
  - Stack-based Script execution: OP_DUP OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG.

### Slide 8: Smart Contracts and On-Chain Verification (Module 3)
- Slide Title: Layer B EVM Smart Contract Architecture
- Visual Aid: Contract interaction diagram: `DebrisLedger`, `DataCredit`, `ConjunctionMonitor`, and `AlertCertificate`.
- Key Talking Points:
  - `DebrisLedger.sol`: Stores anchored block roots and executes on-chain `verifyRecord()` view queries.
  - Cross-language proof verification: JavaScript generated proofs verify inside EVM bytecode.
  - Deployment across local Ganache (port 8545) and Ethereum Sepolia testnet with Etherscan verification.

### Slide 9: Conjunction Screening Oracle and Integer Arithmetic (Module 3 & 5)
- Slide Title: The Astrodynamics Oracle Bridge
- Visual Aid: Flow diagram: TLE lines -> `satellite.js` SGP4 propagation -> Integer Cartesian Coordinates -> `ConjunctionMonitor.sol` distance check -> ERC721 Mint.
- Key Talking Points:
  - Why the Oracle pattern is mandatory: EVM lacks floating-point support, and SGP4 non-linear math cannot run in bytecode.
  - Distance evaluation on-chain: `dx^2 + dy^2 + dz^2 <= threshold^2` using integer metres.
  - Avoids floating-point rounding divergence across validator hardware.
  - Verified alerts mint non-fungible `AlertCertificate` tokens (OCC) and reject duplicate submissions.

### Slide 10: Tokenized Economics: ERC20 Data Monetization (Module 5)
- Slide Title: Granular Micropayments for Orbital Ephemerides
- Visual Aid: Diagram of the `approve` and `transferFrom` sequence between buyer, seller, and `DebrisLedger.sol`.
- Key Talking Points:
  - `DataCredit` (ODC) ERC20 token facilitates decentralized data access compensation.
  - Operators spend ODC to unlock private, high-precision orbital data batches from other operators.
  - Real-world relevance: Incentivizes commercial satellite constellations to share telemetry while retaining economic rights.

### Slide 11: Summary and Curriculum Alignment
- Slide Title: Comprehensive Syllabus Integration
- Visual Aid: Matrix table mapping all six syllabus modules to working software features and interactive compendia.
- Key Talking Points:
  - 100% syllabus topic coverage across custom chain, smart contracts, and interactive labs.
  - Zero mock data: 1,000 real Space-Track collision records driving all features.
  - Fully resilient local execution baseline ready for offline viva examination.

## 2. Live Demonstration Script (8 to 10 Minutes)

### Phase 1: Environment Health and System Overview (Minutes 0:00 - 1:30)
- Action 1: Open terminal in project root. Run `npm run preflight`.
  - Spoken Narrative: "Before launching, we execute our preflight verification script. It validates Node.js LTS v20, checks RPC connectivity to Ganache on port 8545, verifies that our four Solidity contracts are deployed, and confirms the cryptographic integrity of our 1,000-record seed dataset."
- Action 2: Show terminal output passing with green checks. Open browser to `http://localhost:5173`.
  - Spoken Narrative: "Here is the Orbit Ledger console. Notice the austere ground-station aesthetic: high-contrast light theme, self-hosted IBM Plex typography, and zero decorative bloat. The top status strip shows we are connected to Ganache, our Layer A chain height is 25 blocks, and all 25 block roots are anchored to Ethereum."
- Action 3: Point to the Overview scatter plot.
  - Spoken Narrative: "This hand-made SVG chart plots orbital altitude against inclination for our 1,000 ingested records. Notice two distinct clusters: Iridium 33 debris at 86.3 degrees inclination and Cosmos 2251 debris at 74.05 degrees. This confirms we are operating on authentic astrodynamics data from the 2009 collision."

### Phase 2: Orbital Records and Cryptographic Integrity (Minutes 1:30 - 3:00)
- Action 1: Click "Records" in the left navigation.
  - Spoken Narrative: "The Records page catalogues our deduplicated dataset. Each record contains NORAD catalog IDs, orbital elements, raw TLE lines, and a deterministic SHA-256 record hash."
- Action 2: Click "Chain Explorer" in the left navigation.
  - Spoken Narrative: "In the Chain Explorer, we examine the cryptographic structure of Block 14. We can see the block index, previous block hash, timestamp, consensus type, and the 32-byte Merkle root."
- Action 3: Click "Inject Bit Flip in Record #12".
  - Spoken Narrative: "To demonstrate blockchain tamper resistance, we simulate an unauthorized modification by altering a single character in Record 12. Notice immediately: the block hash changes, breaking the cryptographic link to Block 15. The chain integrity check fails with a clear explanation of how SHA-256 cascade invalidation prevents retroactively altering orbital logs."
- Action 4: Click "Reset Chain State" to restore valid state.

### Phase 3: Merkle Tree Proof and EVM Verification (Minutes 3:00 - 4:30)
- Action 1: Scroll to the Merkle Proof Inspector on the Chain Explorer page. Select Record #18.
  - Spoken Narrative: "We now inspect the Merkle tree over the 40 records in Block 14. Here is the sibling proof path consisting of six 32-byte hashes."
- Action 2: Click "Verify in JavaScript".
  - Spoken Narrative: "The browser executes a pair-walk calculation using pure SHA-256, proving that Record 18 belongs to the block root."
- Action 3: Click "Verify On-Chain (EVM)".
  - Spoken Narrative: "Now we execute an on-chain verification by querying `DebrisLedger.verifyRecord()` via `eth_call`. Notice that our Solidity contract computes the identical SHA-256 hashes inside the EVM, compares it against the anchored root, and returns `true`. Because this is a view call, it requires zero gas fees."

### Phase 4: Consensus Lab and PBFT Fault Injection (Minutes 4:30 - 6:30)
- Action 1: Click "Consensus Lab" in the left navigation. Set difficulty to 3. Click "Mine Candidate Block".
  - Spoken Narrative: "Here we demonstrate Proof of Work mining from Module 2. Watch the live nonce counter and hash rate. In 310 milliseconds, the mining worker tested 4,200 nonces and produced a block hash beginning with three leading hex zeros."
- Action 2: Switch tabs to Proof of Stake and Proof of Authority.
  - Spoken Narrative: "We can also select Proof of Stake, where proposer selection is weighted by operator token holdings, or Proof of Authority, which rotates proposers through an authorized consortium whitelist."
- Action 3: Click "Consortium PBFT" in the left navigation.
  - Spoken Narrative: "For consortium operations in Module 4, we built a 4-node Practical Byzantine Fault Tolerance state machine. The formula `3f + 1 = 4` allows us to tolerate `f = 1` faulty node with a quorum of 3."
- Action 4: Set Node 4 to "Offline (Silent)". Click "Auto-Run Round".
  - Spoken Narrative: "We inject a fault: Node 4 goes silent. Watch the audit log: Node 1 broadcasts Pre-Prepare; Nodes 2 and 3 broadcast Prepare; all three honest nodes collect 3 matching votes, reach quorum, and successfully commit the block."
- Action 5: Set Node 3 to "Offline" as well (2 faulty nodes). Click "Auto-Run Round".
  - Spoken Narrative: "Now we inject two faults. Nodes 1 and 2 only collect 2 votes out of 3 required. The protocol halts safely, preventing split-brain forks or state corruption."

### Phase 5: Conjunction Screening, Oracle and Tokens (Minutes 6:30 - 8:30)
- Action 1: Click "Conjunctions" in the left navigation. Set threshold to 50 km. Click "Run Screening Engine".
  - Spoken Narrative: "On the Conjunctions page, our off-chain oracle evaluates close approaches between Iridium and Cosmos fragments using `satellite.js` SGP4 propagation. Here is a detected candidate event between fragment 34376 and 34634 with a miss distance of 42.1 kilometres."
- Action 2: Click "Submit Oracle Report to Contract".
  - Spoken Narrative: "The oracle converts coordinates to integer metres and submits them to `ConjunctionMonitor.sol`. The contract evaluates the squared distance on-chain, confirms it is within threshold, and mints an ERC721 `AlertCertificate` Token #1 to the operator."
- Action 3: Click "Test Duplicate Report Rejection".
  - Spoken Narrative: "If an operator or oracle tries to submit the identical pair and epoch twice, the contract immediately reverts with `ConjunctionAlreadyReported`, preventing duplicate alert spam."
- Action 4: Click "Ethereum Bridge" in the left navigation. Show `DataCredit` ERC20 balance and click "Buy Access" on Block #3.
  - Spoken Narrative: "Finally, on the Ethereum Bridge, we demonstrate our ERC20 utility token. Operator Node 2 approves 100 ODC and purchases access to Block 3. The tokens transfer to the publisher, and access rights are permanently granted on-chain."

### Phase 6: Concepts Lab and UTXO Double-Spend (Minutes 8:30 - 10:00)
- Action 1: Click "Concepts Hub" in the left navigation. Open the "UTXO Lab" tab.
  - Spoken Narrative: "To thoroughly cover Module 2 and Module 5, we built an interactive Bitcoin-style UTXO simulator separate from our account-based Ethereum contracts. Here is our unspent transaction output pool."
- Action 2: Submit a valid spend transaction. Show the output being consumed and new UTXOs created.
- Action 3: Select the already-spent output and attempt to spend it again to a different address. Click "Submit Transaction".
  - Spoken Narrative: "When we attempt to spend the consumed output a second time, the engine detects that the UTXO is no longer in the unspent pool and rejects the transaction with `DoubleSpendDetected`. This concludes our demonstration, and I am ready for your questions."

## 3. Thirty Likely Viva Questions and Honest Answers

### General and Module 1 Questions

1. Question: What is the core problem Orbit Ledger solves?
   - Answer: It provides an immutable, decentralized audit trail for space debris ephemerides, preventing post-collision data tampering, automating conjunction alert verification, and providing a micropayment rail for proprietary tracking data.

2. Question: Why did you build a two-layer system instead of putting everything on Ethereum?
   - Answer: Writing raw orbital records to Ethereum would incur exorbitant gas fees and congest the network. Layer A provides high-throughput, low-cost consortium logging, while Layer B provides public finality and dispute resolution by anchoring only 32-byte Merkle roots.

3. Question: What is a Merkle tree and what is its time complexity for verification?
   - Answer: A Merkle tree is a binary hash tree where leaf nodes are hashes of data records and parent nodes are hashes of their concatenated children. Verification time complexity is O(log N), requiring only `log2(N)` sibling hashes to prove inclusion against the root.

4. Question: How does your Merkle tree handle an odd number of leaf records?
   - Answer: Following the Bitcoin standard, if a level has an odd number of nodes, the final node is duplicated to form a complete pair.

5. Question: What happens if a single byte in an orbital record is altered after block creation?
   - Answer: The record hash changes, altering the Merkle root. This changes the block header hash, breaking the `previousHash` pointer of the subsequent block and invalidating the entire chain from that block forward.

### Consensus and Bitcoin (Module 2)

6. Question: Explain the Byzantine Generals Problem in the context of Orbit Ledger.
   - Answer: It addresses how decentralized satellite operators, who may be adversarial or experiencing network failures, can agree on a single historical ledger of orbital ephemerides without relying on a central authority.

7. Question: What is Proof of Work and how is difficulty adjusted?
   - Answer: PoW requires miners to find a nonce such that the block header hash falls below a target value. In our implementation, difficulty is measured by leading hexadecimal zeros; each additional zero increases expected iterations sixteen-fold.

8. Question: What is the purpose of mining pools and how do they distribute rewards?
   - Answer: Mining pools aggregate computational hash power to reduce payout variance. They reward miners based on submitted partial-difficulty proofs of work (shares) using proportional, Pay-Per-Share (PPS), or PPLNS methods.

9. Question: What is the UTXO model and how does it prevent double spending?
   - Answer: The UTXO (Unspent Transaction Output) model tracks discrete coins rather than account balances. A transaction consumes whole existing UTXOs and creates new ones. A double spend is prevented because once a UTXO is consumed, it is removed from the unspent pool and cannot be referenced again.

10. Question: Contrast Bitcoin Scripts with Ethereum smart contracts.
    - Answer: Bitcoin Script is an intentionally non-Turing-complete, stack-based language without loops, designed strictly for value transfers. Ethereum smart contracts execute in the EVM, which is Turing-complete with state storage, arbitrary loops, and complex logic execution.

### Ethereum and Smart Contracts (Module 3)

11. Question: Why does Layer A use SHA-256 while Ethereum uses Keccak-256?
    - Answer: Bitcoin and NIST standardized on SHA-256. Ethereum adopted Keccak-256 in 2014 before the final NIST SHA-3 padding was standardized. Layer A uses SHA-256 to teach Bitcoin fundamentals, and our smart contracts verify these proofs using the EVM native SHA-256 precompile at address 0x02.

12. Question: What is the difference between an EOA and a Contract Account in Ethereum?
    - Answer: An Externally Owned Account (EOA) is controlled by a private key, has no code, and can initiate transactions. A Contract Account has executable bytecode and persistent storage, and can only act in response to transactions or calls from other accounts.

13. Question: Explain Ethereum gas and why it is necessary.
    - Answer: Gas is the execution fee measured in computational steps. It prevents infinite loops from halting the network (solving the Halting Problem economically) and compensates validators for resource consumption.

14. Question: What is a Merkle Patricia Trie (MPT) in Ethereum?
    - Answer: It is a modified radix trie combined with a Merkle tree used by Ethereum to store World State, Transactions, Receipts, and Account Storage. It allows efficient key-value lookups, inserts, and cryptographic proof of state.

15. Question: Why can't you calculate SGP4 orbital propagation directly inside a Solidity smart contract?
    - Answer: EVM has no native floating-point math support, and SGP4 relies heavily on trigonometric and transcendental functions. Simulating floating point in Solidity is prohibitively expensive in gas and risks consensus divergence due to platform-specific rounding errors.

16. Question: How does your Conjunction Oracle solve the floating-point limitation?
    - Answer: The oracle runs SGP4 off-chain in Node.js using `satellite.js`, rounds coordinates to integer metres, and submits them to the contract. The contract then evaluates squared Euclidean distance (`dx^2 + dy^2 + dz^2`) using pure integer arithmetic.

17. Question: What is the difference between a view/pure function and a state-changing transaction in Solidity?
    - Answer: A `view` or `pure` function does not modify contract storage and can be queried locally for free via `eth_call`. A state-changing function modifies storage, must be broadcast to the network, mined in a block, and costs gas.

18. Question: What are custom errors in Solidity 0.8.4+ and why did you use them instead of `require(condition, string)`?
    - Answer: Custom errors (like `error ConjunctionAlreadyReported()`) encode only a 4-byte selector instead of storing long ASCII strings in bytecode, significantly reducing contract deployment and execution gas costs.

### Consortium and Private Blockchains (Module 4)

19. Question: What is Practical Byzantine Fault Tolerance (PBFT) and what is its quorum formula?
    - Answer: PBFT is a deterministic consensus algorithm designed by Castro and Liskov for state-machine replication. It requires `N >= 3f + 1` total nodes to tolerate `f` Byzantine nodes, with a quorum threshold of `2f + 1`.

20. Question: Why can PBFT achieve immediate finality while PoW cannot?
    - Answer: PBFT relies on explicit two-phase voting (prepare and commit) where a two-thirds majority forms a cryptographic quorum that cannot be reverted. PoW relies on probabilistic finality, where forks can occur and transactions are only finalized after several confirmation blocks.

21. Question: What happens in your 4-node PBFT consortium when two nodes fail?
    - Answer: With `N = 4`, `f = 1`. If two nodes fail, only two honest nodes remain, which is strictly less than the required quorum of `2f + 1 = 3`. The protocol halts safely to prevent split-brain state divergence.

22. Question: Compare Hyperledger Fabric with Ethereum.
    - Answer: Fabric is a permissioned consortium framework with identity management (MSP), channels for private transactions, execute-order-validate architecture, and no native cryptocurrency. Ethereum is predominantly public, uses an order-execute architecture, and requires gas payments.

23. Question: What is the difference between Crash Fault Tolerance (CFT) like Raft and Byzantine Fault Tolerance (BFT)?
    - Answer: CFT protocols (Raft, Paxos) can only handle nodes going offline or restarting; they assume all active nodes are honest. BFT protocols (PBFT) handle malicious nodes that lie, send conflicting votes, or intentionally attempt to forge records.

### Tokens, Cryptocurrencies, and Economics (Module 5)

24. Question: What is the technical difference between ERC20 and ERC721?
    - Answer: ERC20 tokens are fungible and identical, tracked as a balance mapping (`mapping(address => uint256)`). ERC721 tokens are non-fungible and unique, tracked by distinct token IDs (`mapping(uint256 => address)`).

25. Question: In your project, what do your ERC20 and ERC721 tokens represent?
    - Answer: `DataCredit` (ERC20) is an economic utility token used to purchase access to orbital data batches. `AlertCertificate` (ERC721) is a non-fungible certificate minted exclusively when an oracle submits a verified conjunction within the threshold.

26. Question: Explain the `approve` and `transferFrom` design pattern in ERC20.
    - Answer: Direct transfers (`transfer`) only send tokens from the caller. `approve` authorizes a spender contract (e.g. `DebrisLedger`) to pull up to an allowance limit via `transferFrom`, allowing the contract to atomically receive payment before executing a service.

27. Question: What is the difference between an Initial Coin Offering (ICO) and a Security Token Offering (STO)?
    - Answer: An ICO offers unregulated utility tokens without rights to company equity or profits, carrying high speculative risk. An STO offers regulated digital tokens representing fractional ownership of real-world assets or company equity compliant with securities laws.

28. Question: What is the difference between a hot wallet and a cold wallet?
    - Answer: A hot wallet is connected to the internet (e.g. MetaMask in a browser), offering convenience but vulnerability to browser exploits. A cold wallet stores private keys on an offline hardware device (e.g. Ledger), signing transactions in an isolated secure enclave.

### Tools, Deployment, and Edge Cases (Module 6)

29. Question: What happens if an oracle submits the exact same conjunction twice?
    - Answer: The contract computes a composite hash `keccak256(abi.encodePacked(min(obj1, obj2), max(obj1, obj2), epoch))`. If an alert with that hash already exists, it reverts with `ConjunctionAlreadyReported`, preventing duplicate certificate minting.

30. Question: Why is Ganache no longer actively maintained and how did you ensure compatibility?
    - Answer: Truffle and Ganache were sunset by Consensys in 2023. Ganache relies on native packages (uWS) that fail on Node 24. We resolved this by pinning Node.js LTS v20.20.2 in `.nvmrc` and `engines`, ensuring Ganache v7.9.2 runs cleanly without runtime degradation.
