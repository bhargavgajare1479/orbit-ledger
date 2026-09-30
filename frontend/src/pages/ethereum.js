import { api } from '../api.js';
import { ethers } from 'ethers';

export async function renderEthereum() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  let statusData = await api.getStatus().catch(() => ({}));
  const contracts = statusData.deployment?.contracts || {};

  // Mock purchased state for demonstration
  const purchasedBlocks = new Set();

  function renderView() {
    const html = `
      <!-- Header -->
      <div class="border-b border-rule-hairline pb-3">
        <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Ethereum Bridge & Tokenized Exchange</h2>
        <p class="text-xs text-ink-muted mt-1">Smart contract directory, ERC20 utility token payments, root anchoring verification, and access rights management.</p>
      </div>

      <!-- Network and Account Overview Strip -->
      <div class="grid grid-cols-4 gap-4 text-xs font-mono">
        <div class="card-box space-y-1">
          <span class="text-[10px] text-ink-muted uppercase block">Active EVM Network</span>
          <div class="text-ink-primary font-bold">GANACHE (Local 1337)</div>
          <span class="text-[10px] text-status-pass">RPC: http://127.0.0.1:8545</span>
        </div>

        <div class="card-box space-y-1">
          <span class="text-[10px] text-ink-muted uppercase block">Active Operator Wallet</span>
          <div class="text-ink-primary font-bold">0x0a70...af922</div>
          <span class="text-[10px] text-ink-muted">Simulated Operator 1 (Alpha)</span>
        </div>

        <div class="card-box space-y-1">
          <span class="text-[10px] text-ink-muted uppercase block">Gas Reserve (ETH)</span>
          <div class="text-ink-primary font-bold">999.82 ETH</div>
          <span class="text-[10px] text-ink-muted">Pre-funded Local Account</span>
        </div>

        <div class="card-box space-y-1">
          <span class="text-[10px] text-ink-muted uppercase block">DataCredit Balance (ODC)</span>
          <div class="text-accent-primary font-bold text-sm">10,000.00 ODC</div>
          <span class="text-[10px] text-ink-muted">Contract: DataCredit.sol</span>
        </div>
      </div>

      <!-- Deployed Contracts Directory -->
      <div class="card-box space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Deployed Smart Contracts Directory (Layer B)
        </h3>
        <div class="grid grid-cols-2 gap-4 text-xs font-mono">
          <div class="p-2.5 bg-canvas-sunken border border-rule-hairline space-y-1">
            <div class="flex justify-between">
              <span class="font-bold text-ink-primary">DebrisLedger.sol</span>
              <span class="text-status-pass text-[10px]">ANCHOR & VERIFIER</span>
            </div>
            <div class="text-ink-muted text-[11px] break-all select-all">${contracts.DebrisLedger || '0x3Fe90355aC5Eea0d38CFE1d8020343488B46237C'}</div>
            <div class="text-[10px] text-ink-muted">Stores block Merkle roots; pure SHA-256 verifyRecord view function.</div>
          </div>

          <div class="p-2.5 bg-canvas-sunken border border-rule-hairline space-y-1">
            <div class="flex justify-between">
              <span class="font-bold text-ink-primary">DataCredit.sol (ODC)</span>
              <span class="text-accent-primary text-[10px]">ERC20 UTILITY</span>
            </div>
            <div class="text-ink-muted text-[11px] break-all select-all">${contracts.DataCredit || '0x70be140c173D14505f104B041b8895aA9f36cc3C'}</div>
            <div class="text-[10px] text-ink-muted">Medium of exchange; handles approve and transferFrom access fees.</div>
          </div>

          <div class="p-2.5 bg-canvas-sunken border border-rule-hairline space-y-1">
            <div class="flex justify-between">
              <span class="font-bold text-ink-primary">ConjunctionMonitor.sol</span>
              <span class="text-status-pass text-[10px]">INTEGER ORACLE</span>
            </div>
            <div class="text-ink-muted text-[11px] break-all select-all">${contracts.ConjunctionMonitor || '0x6c77610A8DBc643d012D666B3f25903d3c5bd44d'}</div>
            <div class="text-[10px] text-ink-muted">Integer distance screening (dx^2 + dy^2 + dz^2 <= threshold^2).</div>
          </div>

          <div class="p-2.5 bg-canvas-sunken border border-rule-hairline space-y-1">
            <div class="flex justify-between">
              <span class="font-bold text-ink-primary">AlertCertificate.sol (OCC)</span>
              <span class="text-accent-primary text-[10px]">ERC721 NFT</span>
            </div>
            <div class="text-ink-muted text-[11px] break-all select-all">${contracts.AlertCertificate || '0x6C01880CfEb73d84636CaB7882a35ab666C9016E'}</div>
            <div class="text-[10px] text-ink-muted">Non-fungible token minted for certified conjunction alerts.</div>
          </div>
        </div>
      </div>

      <!-- Tokenized Data Access Deck -->
      <div class="card-box space-y-3">
        <div class="flex justify-between items-center border-b border-rule-hairline pb-2">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Proprietary Batch Access Marketplace</h3>
            <p class="text-[11px] text-ink-muted">Unlock high-precision orbital telemetry via atomic ERC20 token transfer to the publisher.</p>
          </div>
          <span class="text-xs font-mono text-ink-muted">Fee per Batch: <strong class="text-ink-primary">100 ODC</strong></span>
        </div>

        <div class="overflow-x-auto">
          <table class="table-dense">
            <thead>
              <tr>
                <th class="w-16">Block</th>
                <th>Publisher Operator</th>
                <th>Records</th>
                <th>Merkle Root</th>
                <th>Price</th>
                <th>Access Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3, 4, 5].map(b => `
                <tr>
                  <td class="font-mono font-medium">#${b}</td>
                  <td class="font-mono">${b % 2 === 1 ? 'Node-1-Alpha (0x0a70...)' : 'Node-2-Beta (0x9cab...)'}</td>
                  <td class="font-mono">40 Records</td>
                  <td class="font-mono text-ink-muted">0x4a9b...7f12</td>
                  <td class="font-mono font-medium text-accent-primary">100 ODC</td>
                  <td>
                    ${purchasedBlocks.has(b) ? `
                      <span class="text-status-pass font-mono font-medium text-[11px]">UNLOCKED ✓</span>
                    ` : `
                      <span class="text-ink-muted font-mono text-[11px]">LOCKED 🔒</span>
                    `}
                  </td>
                  <td class="text-right">
                    ${purchasedBlocks.has(b) ? `
                      <button class="btn-secondary text-[11px] py-1 px-2" disabled>Access Granted</button>
                    ` : `
                      <button class="buy-access-btn btn-primary text-[11px] py-1 px-2 font-mono" data-block="${b}">
                        Buy Access (100 ODC)
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.buy-access-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const blockId = parseInt(e.target.getAttribute('data-block'), 10);
        btn.textContent = 'Processing...';
        btn.disabled = true;

        try {
          // Simulate the approve and transferFrom flow
          await new Promise(r => setTimeout(r, 600));
          purchasedBlocks.add(blockId);
          renderView();
        } catch (err) {
          alert('Purchase failed: ' + err.message);
        }
      });
    });
  }

  renderView();
  return container;
}
