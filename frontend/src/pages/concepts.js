import { api } from '../api.js';

export async function renderConcepts() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  let currentTab = 'utxo';
  let utxoData = await api.getUTXOPool().catch(() => ({ utxoPool: [], txHistory: [] }));

  function renderView() {
    const html = `
      <!-- Header -->
      <div class="border-b border-rule-hairline pb-3">
        <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Curriculum Concepts & Theoretical Reference Hub</h2>
        <p class="text-xs text-ink-muted mt-1">Interactive laboratories, architecture matrices, and academic reference guides satisfying Modules 1 through 6.</p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex space-x-2 border-b border-rule-strong pb-px text-xs font-mono overflow-x-auto">
        <button id="tab-utxo" class="px-4 py-2 border-b-2 font-medium whitespace-nowrap ${currentTab === 'utxo' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          1. UTXO Double-Spend Lab
        </button>
        <button id="tab-wallets" class="px-4 py-2 border-b-2 font-medium whitespace-nowrap ${currentTab === 'wallets' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          2. Hot vs. Cold Wallets
        </button>
        <button id="tab-tokens" class="px-4 py-2 border-b-2 font-medium whitespace-nowrap ${currentTab === 'tokens' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          3. Token Standards & DeFi
        </button>
        <button id="tab-consortium" class="px-4 py-2 border-b-2 font-medium whitespace-nowrap ${currentTab === 'consortium' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          4. Fabric, Corda & Quorum
        </button>
        <button id="tab-comparison" class="px-4 py-2 border-b-2 font-medium whitespace-nowrap ${currentTab === 'comparison' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          5. Bitcoin vs. Ethereum
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="concepts-content" class="space-y-4">
        ${currentTab === 'utxo' ? renderUTXOTab() : ''}
        ${currentTab === 'wallets' ? renderWalletsTab() : ''}
        ${currentTab === 'tokens' ? renderTokensTab() : ''}
        ${currentTab === 'consortium' ? renderConsortiumTab() : ''}
        ${currentTab === 'comparison' ? renderComparisonTab() : ''}
      </div>
    `;

    container.innerHTML = html;
    bindEvents();
  }

  function renderUTXOTab() {
    const pool = utxoData.utxoPool || [];
    return `
      <div class="grid grid-cols-3 gap-6">
        <!-- Pool Table -->
        <div class="card-box space-y-3 col-span-2">
          <div class="flex justify-between items-center border-b border-rule-hairline pb-2">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Current Unspent Transaction Output (UTXO) Pool</h3>
            <span class="text-xs font-mono text-ink-muted">${pool.length} Unspent Outputs</span>
          </div>

          <div class="overflow-x-auto">
            <table class="table-dense">
              <thead>
                <tr>
                  <th>Outpoint (TxId : Index)</th>
                  <th>Locking Script / Recipient Address</th>
                  <th class="text-right">Value (Credits)</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                ${pool.map(u => `
                  <tr>
                    <td class="font-mono text-[11px]">${u.txId.slice(0, 8)}...:${u.outputIndex}</td>
                    <td class="font-mono text-[11px]">${u.address}</td>
                    <td class="text-right font-mono font-medium">${u.value.toLocaleString()}</td>
                    <td class="text-right">
                      <button class="select-utxo-btn text-accent-primary hover:underline text-[11px] font-mono" data-txid="${u.txId}" data-index="${u.outputIndex}" data-val="${u.value}">
                        Select as Input
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Spend Form -->
        <div class="card-box space-y-4 col-span-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Compose Transaction
          </h3>

          <div class="space-y-3 text-xs font-mono">
            <div>
              <label class="text-[10px] text-ink-muted block uppercase">Selected Input Outpoint</label>
              <input id="tx-input-outpoint" type="text" readonly placeholder="Click 'Select as Input' in pool" class="w-full bg-canvas-sunken border border-rule-strong p-1.5 text-xs font-mono" />
            </div>

            <div>
              <label class="text-[10px] text-ink-muted block uppercase">Recipient 1 Address</label>
              <input id="tx-recip-1" type="text" value="1BobLegitimateRecipientAddress" class="w-full bg-canvas-bg border border-rule-strong p-1.5 text-xs font-mono" />
            </div>

            <div>
              <label class="text-[10px] text-ink-muted block uppercase">Spend Amount</label>
              <input id="tx-amount" type="number" value="1000" class="w-full bg-canvas-bg border border-rule-strong p-1.5 text-xs font-mono" />
            </div>

            <div class="pt-2 flex flex-col space-y-2">
              <button id="tx-submit-btn" class="btn-primary w-full text-xs font-mono">
                Submit Legitimate Spend
              </button>
              <button id="tx-doublespend-btn" class="btn-danger w-full text-xs font-mono">
                Simulate Double-Spend (Spend Again)
              </button>
            </div>

            <div id="tx-result-box" class="p-2.5 bg-canvas-sunken border border-rule-hairline text-[11px] space-y-1">
              <div class="text-ink-muted">// Output status from UTXO engine will appear here</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWalletsTab() {
    return `
      <div class="card-box space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Hot versus Cold Wallets: Architectural and Security Comparison
        </h3>
        <table class="table-dense">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Hot Wallets (e.g. MetaMask, Web Apps)</th>
              <th>Cold Wallets (e.g. Ledger, Trezor, Paper)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-medium">Internet Connectivity</td>
              <td>Continuously online; keys held in memory or browser storage.</td>
              <td>Air-gapped; never connects directly to the internet.</td>
            </tr>
            <tr>
              <td class="font-medium">Signing Mechanism</td>
              <td>Browser extension / application process signs payloads.</td>
              <td>Secure Enclave (CC EAL5+ chip) displays and signs on-device.</td>
            </tr>
            <tr>
              <td class="font-medium">Vulnerability Profile</td>
              <td>Phishing, malicious smart contract approvals, clipboard malware.</td>
              <td>Physical loss or paper seed compromise only.</td>
            </tr>
            <tr>
              <td class="font-medium">Use Case in Orbit Ledger</td>
              <td>Automated ground station oracle daemon for continuous reporting.</td>
              <td>Operator root consortium keys authorizing initial governance charters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTokensTab() {
    return `
      <div class="grid grid-cols-2 gap-6">
        <div class="card-box space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            ERC20 vs. ERC721 Token Standards
          </h3>
          <table class="table-dense">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>ERC20 (Fungible)</th>
                <th>ERC721 (Non-Fungible)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-medium">Fungibility</td>
                <td>Identical, interchangeable units.</td>
                <td>Each token has a unique uint256 ID.</td>
              </tr>
              <tr>
                <td class="font-medium">Storage Model</td>
                <td>mapping(address => uint256) balances</td>
                <td>mapping(uint256 => address) owners</td>
              </tr>
              <tr>
                <td class="font-medium">Orbit Ledger Role</td>
                <td>DataCredit (ODC): batch access fees.</td>
                <td>AlertCertificate (OCC): conjunction alerts.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-box space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            ICO vs. STO & DeFi Primitives
          </h3>
          <ul class="text-xs space-y-2 text-ink-muted">
            <li><strong class="text-ink-primary font-mono">ICO (Initial Coin Offering):</strong> Unregulated crowdsale of utility tokens; high speculation risk; lacks legal equity or dividend rights.</li>
            <li><strong class="text-ink-primary font-mono">STO (Security Token Offering):</strong> Regulated digital securities compliant with SEC/regulatory frameworks; backed by real underlying assets or cash flows.</li>
            <li><strong class="text-ink-primary font-mono">DeFi & AMMs:</strong> Automated market makers (x * y = k) eliminate order books via liquidity pools; flash loans permit uncollateralized single-transaction borrowing.</li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderConsortiumTab() {
    return `
      <div class="card-box space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Enterprise and Consortium Blockchains Comparison Matrix (Module 4 & 6)
        </h3>
        <table class="table-dense">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Consensus Model</th>
              <th>Cryptocurrency</th>
              <th>Smart Contract Model</th>
              <th>Primary Enterprise Domain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-medium">Hyperledger Fabric</td>
              <td>Execute-Order-Validate (Raft / PBFT)</td>
              <td>None (Permissioned token optional)</td>
              <td>Chaincode (Go, Node.js, Java)</td>
              <td>Enterprise supply chain, healthcare, trade finance.</td>
            </tr>
            <tr>
              <td class="font-medium">R3 Corda</td>
              <td>Pluggable Notary Pools (Raft / BFT)</td>
              <td>None (State transitions)</td>
              <td>Kotlin / Java Contracts</td>
              <td>Regulated banking, interbank settlements.</td>
            </tr>
            <tr>
              <td class="font-medium">Ripple (XRPL)</td>
              <td>Ripple Protocol Consensus (RPCA / UNL)</td>
              <td>XRP (Native bridge currency)</td>
              <td>Hooks / Escrow primitives</td>
              <td>Cross-border remittance, FX corridors.</td>
            </tr>
            <tr>
              <td class="font-medium">Quorum</td>
              <td>Istanbul BFT (IBFT) / Raft</td>
              <td>ETH (Zero gas price configurable)</td>
              <td>Solidity (EVM Private Transactions)</td>
              <td>Institutional finance, consortium settlement.</td>
            </tr>
            <tr>
              <td class="font-medium">Orbit Ledger (This Project)</td>
              <td>4-Node PBFT (f=1) + EVM Anchoring</td>
              <td>DataCredit (ODC) Utility Token</td>
              <td>Solidity 0.8.24 + SHA-256 Precompile</td>
              <td>Space situational awareness, space debris tracking.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderComparisonTab() {
    return `
      <div class="card-box space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Bitcoin versus Ethereum Architectural Comparison (Module 2 vs. Module 3)
        </h3>
        <table class="table-dense">
          <thead>
            <tr>
              <th>Architectural Feature</th>
              <th>Bitcoin (Nakamoto Ledger)</th>
              <th>Ethereum (World Computer)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-medium">State Model</td>
              <td>UTXO (Unspent Transaction Outputs)</td>
              <td>Account Model (EOA + Contract storage)</td>
            </tr>
            <tr>
              <td class="font-medium">Scripting Capability</td>
              <td>Non-Turing complete stack-based Script</td>
              <td>Turing complete EVM bytecode with arbitrary loops</td>
            </tr>
            <tr>
              <td class="font-medium">Cryptographic Hash</td>
              <td>Double SHA-256 (FIPS 180-4)</td>
              <td>Keccak-256 (Pre-NIST Sponge construction)</td>
            </tr>
            <tr>
              <td class="font-medium">Block Time & Target</td>
              <td>~10 minutes (Difficulty retargeting every 2016 blocks)</td>
              <td>~12 seconds (PoS slot epochs)</td>
            </tr>
            <tr>
              <td class="font-medium">Double Spending Solution</td>
              <td>Exclusion of spent outpoints from unspent pool</td>
              <td>Account sequential nonces preventing replay</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelector('#tab-utxo')?.addEventListener('click', () => { currentTab = 'utxo'; renderView(); });
    container.querySelector('#tab-wallets')?.addEventListener('click', () => { currentTab = 'wallets'; renderView(); });
    container.querySelector('#tab-tokens')?.addEventListener('click', () => { currentTab = 'tokens'; renderView(); });
    container.querySelector('#tab-consortium')?.addEventListener('click', () => { currentTab = 'consortium'; renderView(); });
    container.querySelector('#tab-comparison')?.addEventListener('click', () => { currentTab = 'comparison'; renderView(); });

    if (currentTab === 'utxo') {
      let selectedInput = null;

      container.querySelectorAll('.select-utxo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const txId = e.target.getAttribute('data-txid');
          const index = parseInt(e.target.getAttribute('data-index'), 10);
          const val = parseInt(e.target.getAttribute('data-val'), 10);
          selectedInput = { txId, outputIndex: index, val };
          container.querySelector('#tx-input-outpoint').value = `${txId.slice(0, 16)}...:${index} (${val} credits)`;
        });
      });

      // Legitimate Spend
      container.querySelector('#tx-submit-btn')?.addEventListener('click', async () => {
        const resultBox = container.querySelector('#tx-result-box');
        if (!selectedInput) {
          alert('Please select an input UTXO from the table first.');
          return;
        }

        const recip = container.querySelector('#tx-recip-1').value;
        const amount = parseInt(container.querySelector('#tx-amount').value, 10);

        try {
          const inputs = [{ txId: selectedInput.txId, outputIndex: selectedInput.outputIndex }];
          const outputs = [{ address: recip, value: amount }];
          if (selectedInput.val > amount) {
            outputs.push({ address: '1AliceChangeAddress', value: selectedInput.val - amount });
          }

          const res = await api.submitUTXO(inputs, outputs);
          resultBox.innerHTML = `
            <div class="text-status-pass font-bold">✓ TRANSACTION CONFIRMED</div>
            <div>TxId: ${res.transaction.txId.slice(0, 20)}...</div>
            <div>Consumed Input: ${selectedInput.txId.slice(0, 10)}...:${selectedInput.outputIndex}</div>
            <div>Outputs Created: ${outputs.length} | Fee: ${res.transaction.fee}</div>
          `;
          utxoData = await api.getUTXOPool();
          renderView();
        } catch (err) {
          resultBox.innerHTML = `<div class="text-status-fail font-bold">✖ ERROR: ${err.message}</div>`;
        }
      });

      // Double Spend Attempt
      container.querySelector('#tx-doublespend-btn')?.addEventListener('click', async () => {
        const resultBox = container.querySelector('#tx-result-box');
        if (!selectedInput) {
          alert('Please select an input UTXO from the table first.');
          return;
        }

        try {
          const inputs = [{ txId: selectedInput.txId, outputIndex: selectedInput.outputIndex }];
          const outputs = [{ address: '1CharlieAdversaryAddress', value: selectedInput.val }];
          await api.submitUTXO(inputs, outputs);
        } catch (err) {
          resultBox.innerHTML = `
            <div class="text-status-fail font-bold">✖ DOUBLE SPEND REJECTED (PASS)</div>
            <div class="text-ink-primary font-mono">${err.message}</div>
            <div class="text-[10px] text-ink-muted">Verification rule: UTXO was already deleted from the unspent pool when spent previously.</div>
          `;
        }
      });
    }
  }

  renderView();
  return container;
}
