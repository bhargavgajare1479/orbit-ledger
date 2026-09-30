# Orbit Ledger: User Interface Specification (UI_SPEC)

## 1. Design Philosophy and Direction

Orbit Ledger is engineered with the visual restraint of an aerospace ground-station console crossed with a physical research logbook. It avoids consumer web tropes, marketing embellishments, and synthetic aesthetic patterns.

Strict Aesthetic Prohibitions:
- No dark mode neon, purple, cyan, or dark blue glowing themes.
- No glassmorphism, background blurs, frosted glass, or decorative drop shadows.
- No gradients or gradient text.
- No hero banners, three-card feature columns, or centered marketing slogans.
- No emoji, decorative icons, stock illustrations, or placeholder lorem ipsum.
- No pill-shaped rounded badges (`rounded-full`) or oversized rounded corners (`rounded-xl`, `rounded-2xl`).
- No toast spam or animated popups.

Visual Baseline:
- High contrast, light theme designed specifically for readability on classroom video projectors.
- Strict rectangular discipline: maximum border radius of 3 pixels (`rounded-sm`).
- Hairline 1px solid borders for visual hierarchy instead of drop shadows.
- Dense, tabular data presentation with strict numeric alignment.
- Functional motion only: a live ticking nonce counter during mining, instantaneous row highlighting when a new block is appended, and sequential state transitions during PBFT message passing.

## 2. Design System and Token Architecture

All design tokens are defined in Tailwind configuration and custom CSS variables, mapping directly to utility classes.

### 2.1 Color Palette Tokens

| Token Name | Hex Value | Usage Purpose | Contrast Ratio vs Background |
|---|---|---|---|
| `canvas-bg` | `#F4F1EA` | Primary application surface, warm off-white | N/A (Baseline) |
| `canvas-card` | `#FAF8F5` | Secondary card and panel surface | 1.05:1 |
| `canvas-sunken` | `#ECE7DE` | Table headers, inset inputs, code block containers | 1.15:1 |
| `ink-primary` | `#1A1A18` | Primary text, headings, block hashes | 13.8:1 (AAA) |
| `ink-muted` | `#6B675E` | Secondary metadata, labels, epoch timestamps | 4.8:1 (AA) |
| `ink-subtle` | `#969186` | Inactive table headers, disabled states | 3.1:1 |
| `rule-hairline` | `#D8D3C8` | 1px borders, table dividers, panel splitters | 1.3:1 |
| `rule-strong` | `#B8B2A4` | Active borders, focused inputs, table header borders | 1.9:1 |
| `accent-primary`| `#C2410C` | Burnt orange: alerts, active links, primary submit buttons | 4.9:1 (AA) |
| `accent-hover`  | `#9A3412` | Darkened burnt orange for hover/active states | 6.8:1 (AAA) |
| `status-pass`   | `#2F6B4F` | Muted pine green: verified Merkle proofs, honest nodes | 5.2:1 (AA) |
| `status-pass-bg`| `#E7F0EB` | Light tint background for verified states | 1.1:1 |
| `status-fail`   | `#991B1B` | Deep brick red: Byzantine faults, invalid chain hashes | 6.5:1 (AAA) |
| `status-fail-bg`| `#FBEAEA` | Light tint background for error messages | 1.1:1 |

### 2.2 Typography Specifications

Typography relies exclusively on self-hosted IBM Plex fonts to ensure deterministic offline execution without Google Fonts dependencies.

- UI Body and Headings: `IBM Plex Sans` (weights: 400 Regular, 500 Medium, 600 SemiBold).
- Monospace Data (Hashes, Addresses, Nonces, Coordinates, TLE lines): `IBM Plex Mono` (weights: 400 Regular, 500 Medium).

Scale:
- `text-xs`: 11px (line height: 14px) for dense data attributes, TLE previews, and hash suffixes.
- `text-sm`: 13px (line height: 18px) for table rows, form inputs, button labels, and secondary notes.
- `text-base`: 15px (line height: 22px) for primary copy, narrative explanations, and card titles.
- `text-lg`: 18px (line height: 24px) for section headers and metric values.
- `text-xl`: 22px (line height: 28px) for primary view titles.

### 2.3 Spacing, Borders, and Radii

- Radius: `rounded-none` (0px) or `rounded-[3px]` (3px maximum). No larger radii permitted.
- Borders: `1px solid var(--rule-hairline)`. Active/focused states transition to `1px solid var(--rule-strong)`.
- Shadows: None for layout cards, panels, or buttons. Only a single utility shadow permitted for modal dialogues: `0 4px 12px rgba(26, 26, 24, 0.12)`.
- Spacing: Standard 4px grid. Table padding: 6px vertical, 10px horizontal for dense information packaging.

## 3. Global Layout Architecture

The viewport is split into two primary structural regions: a fixed-width left navigation rail and a responsive main operational deck.

```
+-------------------+---------------------------------------------------------+
| ORBIT LEDGER      | Top Status Strip: Ganache (1337) | Height: 25 | Sepolia: Sync |
| Ground Station    +---------------------------------------------------------+
|                   | Page Title (text-xl font-semibold)                     |
| > Overview        | Single concise purpose statement.                       |
|   Records         +---------------------------------------------------------+
|   Chain Explorer  |                                                         |
|   Consensus Lab   | Main Operational Workspace                              |
|   Consortium PBFT | Dense tables, controls, SVG plots, inspection panels    |
|   Ethereum Bridge |                                                         |
|   Conjunctions    |                                                         |
|   Concepts Hub    |                                                         |
|                   |                                                         |
| [Operator: Node1] |                                                         |
+-------------------+---------------------------------------------------------+
```

### 3.1 Left Navigation Rail

- Fixed width: 220px.
- Background: `canvas-card`. Border right: 1px solid `rule-hairline`.
- Content:
  - Header: System title "ORBIT LEDGER", subtitle "LEO Debris Ground Station", version tag "v1.0.0".
  - Nav Item: Text-only list. Active item has left 3px border in `accent-primary`, background `canvas-sunken`, text `ink-primary font-medium`. Inactive items have text `ink-muted`.
  - Operator Switcher: Fixed footer dropdown allowing the user to switch the active client context between Node 1 Alpha (0x0a70...), Node 2 Beta, Node 3 Gamma, Node 4 Delta, or Examiner Mode.

### 3.2 Top Status Strip

- Height: 32px.
- Background: `canvas-sunken`. Border bottom: 1px solid `rule-hairline`.
- Text: 11px monospace.
- Displays:
  - EVM Network: `GANACHE: 127.0.0.1:8545 (ID: 1337)` or `SEPOLIA: 11155111`.
  - Layer A Height: `HEIGHT: 25 BLOCKS`.
  - Last Anchored Root: `ANCHORED: 0x8f2d...41e8 (TX: #14)`.
  - Unspent UTXO Pool: `UTXO POOL: 4 UNSPENT`.

## 4. Page Specifications (8 Distinct Pages)

### Page 1: System Overview (`#overview`)
- Purpose: Operational summary of orbital tracking state, anchored roots, and key metrics.
- Sections:
  - Metric Strip: 4 compact numeric cells:
    - Tracked Debris Fragments: 393 unique objects (100 Iridium 33, 293 Cosmos 2251).
    - Ingested Epoch Records: 1,000 records.
    - Layer A Chain State: 25 blocks (40 records/block) + Genesis.
    - Ethereum Anchor State: 25/25 blocks anchored on-chain.
  - SVG Visualizer 1: Altitude vs Inclination Scatter Plot.
    - X-axis: Inclination (deg) from 70° to 90°.
    - Y-axis: Semimajor Axis (km) from 6800 km to 7300 km.
    - Data points: 500 Iridium points plotted at ~86.3° (marked in burnt orange dots), 500 Cosmos points plotted at ~74.05° (marked in dark slate dots).
    - Demonstrates clearly that the two collision debris clouds occupy distinct orbital shells.
  - Recent Anchoring Activity Table: Last 5 anchored blocks with Layer A block index, SHA-256 Merkle root, Ethereum transaction hash, gas used, and timestamp UTC.

### Page 2: Orbital Records Catalogue (`#records`)
- Purpose: Searchable, dense catalog of all 1,000 ingested orbital ephemeris records.
- Controls:
  - Filter by Operator/Object Group: `All`, `Iridium 33 Debris`, `Cosmos 2251 Debris`.
  - Search input: by NORAD Catalog ID or Object Designator.
  - Record count indicator: "Displaying 40 of 1,000 records (Page 1 of 25)".
- Table Columns:
  - NORAD ID (monospace, right-aligned).
  - Object Designator (e.g. `1997-051FU`).
  - Constellation / Source (`Iridium 33` or `Cosmos 2251`).
  - Epoch UTC (e.g. `2026-07-01 00:05:44`).
  - Inclination (°).
  - Period (min).
  - Record SHA-256 Hash (truncated with copy button).
  - Inspect Button: Opens slide-out panel displaying full TLE lines and raw parameters.

### Page 3: Chain Explorer and Merkle Verifier (`#explorer`)
- Purpose: Interactive audit tool for inspecting blocks, headers, Merkle trees, and proof validation.
- Block Browser:
  - Horizontal block selector: Genesis (Block 0) through Block 25.
  - Block Header Detail Card: Block Index, Previous Block Hash, Merkle Root, Proposer, Timestamp UTC, Difficulty, Nonce, Block Hash.
  - Tamper Simulation Button: "Inject Bit Flip in Record #12".
    - When clicked, modifies one character in Record 12, recalculates the block hash, and visually shows the chain integrity check failing with red hairline borders and an explanation of the cascade effect across subsequent blocks.
    - Reset Chain Button returns to deterministic state.
- Merkle Proof Inspector:
  - Interactive tree diagram showing the 40 leaf hashes and their pair aggregations up to the root.
  - Record selector to test a proof: Click any record from the block to load its sibling path (`bytes32[6] proof`).
  - "Verify in JavaScript" button: Runs the SHA-256 pair walk in the browser, showing matching root.
  - "Verify On-Chain (EVM)" button: Executes `DebrisLedger.verifyRecord()` via `eth_call`, returning gas used (0) and boolean confirmation (`true`).

### Page 4: Consensus Engine Lab (`#consensus`)
- Purpose: Hands-on comparison of Proof of Work, Proof of Stake, and Proof of Authority.
- Mode Selector: Tab control switching between `Proof of Work`, `Proof of Stake`, `Proof of Authority`.
- PoW Sub-View:
  - Target Difficulty Slider: 1 to 5 leading hex zeros.
  - Mine Candidate Block Button.
  - Live Ticking Readout: Current Nonce, Elapsed Milliseconds, Hash Rate (kH/s), Candidate Hash.
  - Output summary: "Block 26 mined at difficulty 3 in 284 ms after 3,921 iterations."
- PoS Sub-View:
  - Stake Table: 4 Operators with assigned ODC stakes (40%, 30%, 20%, 10%).
  - Slot Proposer Simulator: Step through 10 slots.
  - Output Log: Displays deterministic pseudo-random seed, integer modulo threshold, and selected operator.
- PoA Sub-View:
  - Validator Whitelist: 4 authorized node addresses.
  - Round-robin schedule timeline showing which operator is authorized for Block N, N+1, N+2.
  - Test Unauthorized Proposal Button: Attempts to submit a block signed by an unauthorized key; displays immediate rejection.

### Page 5: Consortium PBFT Simulator (`#consortium`)
- Purpose: Four-node consortium state machine executing Castro-Liskov PBFT with interactive Byzantine fault injection.
- Node Console Grid: 4 rectangular cards representing:
  - Node 1 (Alpha, Primary): Honest / Faulty toggle.
  - Node 2 (Beta): Honest / Faulty toggle.
  - Node 3 (Gamma): Honest / Faulty toggle.
  - Node 4 (Delta): Honest / Faulty toggle.
- Fault Modes per Node: `Honest (Normal)`, `Offline (Silent)`, `Conflicting (Byzantine Double-Sign)`.
- Consensus Step Buttons:
  - `Propose Batch (Pre-Prepare)`
  - `Exchange Votes (Prepare)`
  - `Commit Block (Commit)`
  - `Auto-Run Round`
- Message Audit Log: Dense chronological terminal log detailing message broadcasts:
  - `[PRE-PREPARE] Node 1 broadcasts proposal for Block 26 (Hash: 0x4a9b...)`
  - `[PREPARE] Node 2 received valid proposal, broadcasts vote`
  - `[PREPARE] Node 3 received valid proposal, broadcasts vote`
  - `[PREPARE] Node 4 is OFFLINE: no message sent`
  - `[QUORUM] 3 matching prepare votes collected (Quorum 2f + 1 = 3 satisfied)`
  - `[COMMIT] Nodes 1, 2, 3 broadcast commit messages`
  - `[COMMITTED] Block 26 finalized with 3/4 operator signatures.`
- Fault Scenarios Explanation Card: Explains why 1 faulty node passes (3 honest nodes >= 3 required) while 2 faulty nodes halt the protocol (2 honest nodes < 3 required).

### Page 6: Ethereum Bridge and Tokens (`#ethereum`)
- Purpose: Interface for smart contract interaction, token balances, root anchoring, and data purchasing.
- Network and Wallet Status:
  - Network Indicator: Ganache Local (1337) or Sepolia (11155111).
  - Active Account: Address, ETH balance, ODC balance.
  - If Ganache: Fast-switch buttons between 4 pre-funded accounts.
  - If Sepolia: Connect MetaMask button with network validation.
- Deployed Contracts Directory:
  - Displays contract addresses for `DebrisLedger`, `DataCredit`, `ConjunctionMonitor`, `AlertCertificate`.
  - Links directly to Etherscan for Sepolia deployments.
- Data Monetization Deck:
  - Block Access Table: List of private high-precision data blocks.
  - Columns: Block Index, Publisher Operator, Price (100 ODC), Access Status (`Locked` or `Purchased`).
  - Action: "Buy Access" button. Triggers two-step flow:
    1. `dataCredit.approve(debrisLedgerAddress, 100 * 10^18)`.
    2. `debrisLedger.buyAccess(blockIndex, publisherAddress)`.
    3. UI updates instantly to `Purchased` and unlocks download of raw high-precision telemetry.

### Page 7: Conjunction Screening and Alerts (`#conjunctions`)
- Purpose: Orbital screening console detecting close approaches, submitting oracle reports, and viewing minted certificates.
- Threshold Controls:
  - Screening Threshold Slider: 5 km to 150 km (default: 50 km).
  - Epoch Window Selector: July 1 to July 4, 2026.
  - "Run Screening Engine" Button: Propagates TLEs via SGP4 in `satellite.js` and evaluates pairwise minimum distances.
- SVG Visualizer 2: Miss Distance vs Threshold Plot.
  - Scatter plot of evaluated conjunction events over time.
  - Horizontal red threshold line. Events below the threshold are marked in burnt orange.
- Screening Results Table:
  - Object 1 (e.g. `IRIDIUM 33 DEB 34376`).
  - Object 2 (e.g. `COSMOS 2251 DEB 34634`).
  - Approach Epoch UTC.
  - Miss Distance (metres and kilometres).
  - Status: `Within Threshold` or `Clear`.
  - Action: "Submit Oracle Report to Contract".
- Verified Alert Certificates Deck:
  - Displays minted ERC721 `AlertCertificate` tokens with Token ID, Owner, Object Pair, Miss Distance (m), and Epoch.
  - Duplicate Alert Test Button: Re-submits the exact same conjunction report to show contract revert: `ConjunctionAlreadyReported`.

### Page 8: Blockchain Concepts Lab (`#concepts`)
- Purpose: Interactive educational compendium directly satisfying theoretical syllabus topics.
- Tab 1: Interactive UTXO Double-Spend Lab.
  - Visual UTXO Pool displaying 4 initial unspent outputs.
  - Form: Create Transaction (Select Input UTXO, Enter Recipient Address, Enter Amount).
  - Transaction 1 Submission: Succeeds, creates new UTXO, marks original UTXO as spent.
  - Attempt Double-Spend: Select the already-spent UTXO and submit to a different recipient.
  - Result: Simulator rejects with red border, showing `Error: DoubleSpendDetected - UTXO [txid:index] already consumed in block #4`.
- Tab 2: Wallets and Key Management.
  - Hot versus Cold Wallets comparison table.
  - Live derivation demo: Mnemonic -> Seed -> Extended Private Key -> Public Key -> Address.
- Tab 3: Token Standards and Economic Models.
  - ERC20 vs ERC721 technical comparison table.
  - ICO vs STO regulatory, legal, and operational differences.
  - DeFi primitives (Automated Market Makers, Liquidity Pools) and Metaverse asset tokenization.
- Tab 4: Enterprise and Consortium Platforms.
  - Comprehensive comparison matrix: Hyperledger Fabric, Corda, Ripple, Quorum, and Public Ethereum.
  - Consensus algorithms: Paxos, Raft, PBFT, and PoW.
- Tab 5: Bitcoin vs Ethereum Architecture.
  - Deep-dive comparison: UTXO model vs Account model, Script vs Turing-complete EVM, block propagation, and gas mechanics.

## 5. UI Component Specifications

### 5.1 Tables
- Dense presentation: `py-1.5 px-2.5 text-xs`.
- Header: `bg-canvas-sunken text-ink-muted uppercase tracking-wider font-semibold border-b border-rule-strong`.
- Zebra striping: alternate rows on `bg-canvas-bg` and `bg-canvas-card`.
- Row hover: subtle background transition to `#EBE6DC`.
- Alignment: Text left-aligned; Numbers, Nonces, and Hashes right-aligned or monospace left-aligned.

### 5.2 Buttons
- Primary Action: `bg-accent-primary text-white hover:bg-accent-hover font-medium px-3 py-1.5 rounded-[3px] text-xs border border-transparent`.
- Secondary Action: `bg-canvas-card text-ink-primary hover:bg-canvas-sunken font-medium px-3 py-1.5 rounded-[3px] text-xs border border-rule-strong`.
- Danger/Tamper Action: `bg-status-fail text-white hover:bg-red-800 font-medium px-3 py-1.5 rounded-[3px] text-xs border border-transparent`.
- Disabled State: `opacity-50 cursor-not-allowed bg-canvas-sunken text-ink-subtle border-rule-hairline`.

### 5.3 Inputs and Selects
- Background: `bg-canvas-card text-ink-primary text-xs px-2.5 py-1.5 border border-rule-strong rounded-[3px] focus:outline-none focus:border-accent-primary`.

### 5.4 Hash and Address Representation
- Default rendering: Monospace font, truncated with ellipsis: `0x0a70...af922` or `5f4dcc...a991`.
- Interaction: Single click copies full value to clipboard and shows brief inline label "COPIED". Hover shows tooltip with full 64-character hex string.

### 5.5 Hand-Made SVG Charts
- Chart 1 (Altitude vs Inclination):
  - ViewBox: `0 0 600 280`.
  - Axes: 1px hairline lines in `#B8B2A4`. Grid lines dashed in `#D8D3C8`.
  - Data marks: Clean SVG circles radius 2.5px. Iridium points fill `#C2410C`, Cosmos points fill `#475569`.
- Chart 2 (Miss Distance vs Threshold):
  - ViewBox: `0 0 600 240`.
  - Horizontal reference threshold line in `#991B1B` with stroke-dasharray `4 2`.
  - Conjunction event vertical stems in `#6B675E` topped with circular marks.

## 6. Microcopy and State Rules

- Plain, Specific Technical Copy:
  - Good: "Mining block 14 at difficulty 3: searching nonces."
  - Bad: "Crunching the numbers..."
  - Good: "Anchor confirmed: Ethereum transaction 0x4f8a... mined in block #18."
  - Bad: "Magic is happening!"
- Empty States:
  - Must state the exact reason and required user action.
  - Example: "No conjunction alerts logged. Adjust the screening threshold above 40 km or click 'Run Screening Engine' to evaluate current orbital ephemerides."
- Error States:
  - Must display the technical failure reason, contract error name if reverted, and remediation step.
  - Example: "Transaction Reverted: ConjunctionAlreadyReported. Object pair (34376, 34634) at epoch 2026-07-02T14:10:00Z has already been certified in Token ID #2."
