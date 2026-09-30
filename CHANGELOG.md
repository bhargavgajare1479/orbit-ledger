# Changelog: Orbit Ledger Development Record

## [1.0.0] - 2026-09-30

### Initial Complete Release
- Documents First Strategy: Authored eight foundational specifications in `/docs`:
  - `PRD.md`: Problem analysis, user personas, MoSCoW prioritization, functional acceptance criteria.
  - `TRD.md`: Architecture diagrams, data models, canonical hashing formulas, SHA-256 vs. Keccak-256 rationale, EVM precompile 0x02 integration, consensus specifications, contract interfaces, and stack justifications.
  - `UI_SPEC.md`: Austere ground-station design system tokens, typography rules, component layouts, and copy constraints.
  - `SYLLABUS_MAP.md`: 100% topic cross-reference mapping across all six university modules.
  - `TEST_PLAN.md`: Unit test definitions, integration tests, preflight checks, and manual checklists.
  - `DEPLOYMENT.md`: Ganache local setup, Sepolia deployment, and demo-day contingency matrix.
  - `TASKS.md`: 11-phase ordered implementation plan.
  - `PRESENTATION.md`: 11-slide presentation outline, 10-minute demo script, and 30 likely viva questions.
- Data Preprocessing and Ingestion:
  - Processed `iridium_33_july2026.csv` (4,920 rows) and `cosmos_2251_july2026.csv` (25,653 rows).
  - Deduplicated by `(NORAD_CAT_ID, EPOCH)`.
  - Extracted 1,000 canonical records across 25 blocks of 40 records spanning July 1 to July 4, 2026.
  - Preserved 20 raw duplicate records in `data/duplicates_demo.json` for live duplicate rejection testing.
- Layer A Blockchain Engine:
  - Custom Block creation with canonical SHA-256 header hashing.
  - Custom Merkle tree construction with Bitcoin-standard odd leaf duplication and 32-byte sibling proof generation.
  - Full chain validation and real-time tamper cascade detection.
  - Consensus algorithms: Proof of Work (Hashcash nonce search with adjustable difficulty), Proof of Stake (stake-weighted lottery), Proof of Authority (clique-style round-robin rotation), and 4-node PBFT consortium state machine with Byzantine fault injection.
  - Standalone Bitcoin UTXO ledger with transaction inputs, outputs, and double-spending rejection.
- Layer B EVM Smart Contracts (Solidity 0.8.24):
  - `DataCredit.sol`: OpenZeppelin v5 ERC20 utility token (ODC) with 1,000,000 initial supply.
  - `AlertCertificate.sol`: OpenZeppelin v5 ERC721 non-fungible certificate (OCC) for verified conjunction alerts.
  - `DebrisLedger.sol`: Root anchoring storage, pure on-chain SHA-256 Merkle proof verifier via EVM precompile `0x02`, and dataset access purchasing.
  - `ConjunctionMonitor.sol`: Integer 3D Euclidean distance evaluation in metres, squared threshold comparison, duplicate alert prevention, and automatic NFT minting.
- REST API and Astrodynamics Oracle Service:
  - Express server on port 3000 exposing Layer A status, blocks, Merkle proofs, PBFT triggers, and UTXO transactions.
  - SGP4 orbital propagation oracle using `satellite.js` deriving integer Cartesian coordinates and submitting certified alerts to EVM contracts.
- Front-End Console (Vite + Vanilla JS + Tailwind):
  - Austere ground-station interface adhering to `UI_SPEC.md` tokens.
  - Self-hosted IBM Plex Sans and IBM Plex Mono fonts.
  - Client-side hash router supporting eight distinct pages.
  - Two hand-made SVG charts: Altitude vs. Inclination scatter plot and Miss Distance vs. Threshold plot.
- Test and Deployment Automation:
  - Comprehensive 43-test automated test suite (27 Layer A + 16 Layer B) passing with zero failures.
  - Autonomous 10-step end-to-end integration lifecycle script (`scripts/demo_e2e.js`).
  - Preflight environment verification script (`scripts/preflight.js`).
  - Single-command demo launcher (`scripts/launch_demo.js`).
