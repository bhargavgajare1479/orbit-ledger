import { api } from '../api.js';

export async function renderConsensus() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  let currentTab = 'pow';
  let isMining = false;

  function renderView() {
    const html = `
      <!-- Header -->
      <div class="border-b border-rule-hairline pb-3">
        <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Consensus Engine Laboratory</h2>
        <p class="text-xs text-ink-muted mt-1">Interactive demonstration of Nakamoto Proof-of-Work, stake-weighted lottery selection, and Proof-of-Authority rotation.</p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex space-x-2 border-b border-rule-strong pb-px text-xs font-mono">
        <button id="tab-pow" class="px-4 py-2 border-b-2 font-medium ${currentTab === 'pow' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          Proof of Work (Nakamoto)
        </button>
        <button id="tab-pos" class="px-4 py-2 border-b-2 font-medium ${currentTab === 'pos' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          Proof of Stake (Weighted Lottery)
        </button>
        <button id="tab-poa" class="px-4 py-2 border-b-2 font-medium ${currentTab === 'poa' ? 'border-accent-primary text-ink-primary bg-canvas-card' : 'border-transparent text-ink-muted hover:text-ink-primary'}">
          Proof of Authority (Consortium Rotation)
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="tab-content" class="space-y-4">
        ${currentTab === 'pow' ? renderPoWContent() : (currentTab === 'pos' ? renderPoSContent() : renderPoAContent())}
      </div>
    `;

    container.innerHTML = html;
    bindEvents();
  }

  function renderPoWContent() {
    return `
      <div class="grid grid-cols-3 gap-6">
        <!-- Controls Column -->
        <div class="card-box space-y-4 col-span-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Mining Parameters
          </h3>

          <div class="space-y-2">
            <label class="text-xs font-mono text-ink-muted flex justify-between">
              <span>Target Difficulty:</span>
              <span id="diff-val" class="font-bold text-ink-primary">2 leading zeros</span>
            </label>
            <input type="range" id="diff-slider" min="1" max="4" value="2" class="w-full accent-accent-primary" />
            <div class="flex justify-between text-[10px] text-ink-muted font-mono">
              <span>Diff 1 (~16)</span>
              <span>Diff 2 (~256)</span>
              <span>Diff 3 (~4K)</span>
              <span>Diff 4 (~65K)</span>
            </div>
          </div>

          <div class="pt-2">
            <button id="pow-mine-btn" class="btn-primary w-full font-mono text-xs">
              ${isMining ? 'Mining in Progress...' : 'Start Nonce Search'}
            </button>
          </div>

          <div class="text-[11px] text-ink-muted border-t border-rule-hairline pt-3">
            <strong>Hashcash Principles (Module 2):</strong> Miner repeatedly hashes candidate header with an incrementing 32-bit nonce until SHA-256 digest satisfies leading hex zero target.
          </div>
        </div>

        <!-- Telemetry & Result Column -->
        <div class="card-box space-y-4 col-span-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Real-Time Mining Telemetry
          </h3>

          <div class="grid grid-cols-3 gap-3 font-mono text-xs">
            <div class="bg-canvas-sunken p-3 border border-rule-hairline">
              <span class="text-ink-muted text-[10px] uppercase block">Iterations / Nonces</span>
              <span id="pow-nonce" class="text-lg font-bold text-ink-primary">0</span>
            </div>
            <div class="bg-canvas-sunken p-3 border border-rule-hairline">
              <span class="text-ink-muted text-[10px] uppercase block">Elapsed Time</span>
              <span id="pow-time" class="text-lg font-bold text-ink-primary">0 ms</span>
            </div>
            <div class="bg-canvas-sunken p-3 border border-rule-hairline">
              <span class="text-ink-muted text-[10px] uppercase block">Hash Rate</span>
              <span id="pow-rate" class="text-lg font-bold text-accent-primary">0 h/s</span>
            </div>
          </div>

          <div class="space-y-1 font-mono text-xs">
            <span class="text-ink-muted text-[10px] uppercase block">Resulting Block Hash (Target: <span id="target-pattern">00...</span>)</span>
            <div id="pow-hash-box" class="bg-canvas-sunken p-3 border border-rule-hairline break-all text-ink-muted">
              // Click "Start Nonce Search" to initiate Hashcash proof of work
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPoSContent() {
    return `
      <div class="grid grid-cols-3 gap-6">
        <div class="card-box space-y-4 col-span-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Consortium Stake Table
          </h3>
          <table class="table-dense">
            <thead>
              <tr>
                <th>Operator</th>
                <th class="text-right">Stake (ODC)</th>
                <th class="text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-medium">Node 1 (Alpha)</td>
                <td class="text-right font-mono">40,000</td>
                <td class="text-right font-mono text-accent-primary font-medium">40%</td>
              </tr>
              <tr>
                <td class="font-medium">Node 2 (Beta)</td>
                <td class="text-right font-mono">30,000</td>
                <td class="text-right font-mono text-accent-primary font-medium">30%</td>
              </tr>
              <tr>
                <td class="font-medium">Node 3 (Gamma)</td>
                <td class="text-right font-mono">20,000</td>
                <td class="text-right font-mono text-accent-primary font-medium">20%</td>
              </tr>
              <tr>
                <td class="font-medium">Node 4 (Delta)</td>
                <td class="text-right font-mono">10,000</td>
                <td class="text-right font-mono text-accent-primary font-medium">10%</td>
              </tr>
            </tbody>
          </table>

          <div class="pt-2">
            <button id="pos-step-btn" class="btn-primary w-full font-mono text-xs">
              Simulate Next Slot Lottery &rarr;
            </button>
          </div>
        </div>

        <div class="card-box space-y-4 col-span-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Slot Proposer Election Log
          </h3>
          <div id="pos-log" class="bg-canvas-sunken p-3 border border-rule-hairline font-mono text-xs space-y-2 min-h-[220px]">
            <div class="text-ink-muted">// Click "Simulate Next Slot Lottery" to run stake-weighted proposer selection</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPoAContent() {
    return `
      <div class="grid grid-cols-3 gap-6">
        <div class="card-box space-y-4 col-span-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Authorized Authority Whitelist
          </h3>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-2 bg-canvas-sunken border border-rule-hairline">
              <span class="text-ink-muted block text-[10px]">INDEX 0: PRIMARY</span>
              <span class="text-ink-primary font-medium">Node-1-Alpha (0x0a70...)</span>
            </div>
            <div class="p-2 bg-canvas-sunken border border-rule-hairline">
              <span class="text-ink-muted block text-[10px]">INDEX 1: REPLICA</span>
              <span class="text-ink-primary font-medium">Node-2-Beta (0x9cab...)</span>
            </div>
            <div class="p-2 bg-canvas-sunken border border-rule-hairline">
              <span class="text-ink-muted block text-[10px]">INDEX 2: REPLICA</span>
              <span class="text-ink-primary font-medium">Node-3-Gamma (0xa4e2...)</span>
            </div>
            <div class="p-2 bg-canvas-sunken border border-rule-hairline">
              <span class="text-ink-muted block text-[10px]">INDEX 3: REPLICA</span>
              <span class="text-ink-primary font-medium">Node-4-Delta (0x1efE...)</span>
            </div>
          </div>
        </div>

        <div class="card-box space-y-4 col-span-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
            Round-Robin Rotation Schedule (Clique Style)
          </h3>
          <div id="poa-schedule-list" class="space-y-2">
            <button id="poa-load-schedule" class="btn-secondary text-xs font-mono">Query Schedule Schedule &rarr;</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelector('#tab-pow')?.addEventListener('click', () => { currentTab = 'pow'; renderView(); });
    container.querySelector('#tab-pos')?.addEventListener('click', () => { currentTab = 'pos'; renderView(); });
    container.querySelector('#tab-poa')?.addEventListener('click', () => { currentTab = 'poa'; renderView(); });

    if (currentTab === 'pow') {
      const slider = container.querySelector('#diff-slider');
      slider?.addEventListener('input', (e) => {
        container.querySelector('#diff-val').textContent = `${e.target.value} leading zero${e.target.value > 1 ? 's' : ''}`;
        container.querySelector('#target-pattern').textContent = '0'.repeat(e.target.value) + '...';
      });

      container.querySelector('#pow-mine-btn')?.addEventListener('click', async () => {
        if (isMining) return;
        isMining = true;
        const diff = parseInt(slider.value, 10);
        const mineBtn = container.querySelector('#pow-mine-btn');
        mineBtn.textContent = 'Mining in Progress...';
        mineBtn.disabled = true;

        try {
          const res = await api.mineBlock(diff);
          container.querySelector('#pow-nonce').textContent = res.iterations.toLocaleString();
          container.querySelector('#pow-time').textContent = `${res.durationMs} ms`;
          container.querySelector('#pow-rate').textContent = `${(res.hashRate / 1000).toFixed(1)} kH/s`;

          const hashBox = container.querySelector('#pow-hash-box');
          hashBox.innerHTML = `
            <div class="text-status-pass font-bold mb-1">✓ SOLVED CANDIDATE BLOCK</div>
            <div class="text-ink-primary select-all">${res.blockHash}</div>
            <div class="text-[11px] text-ink-muted mt-1">Nonce: ${res.nonce} | Difficulty: ${res.difficulty} hex zeros</div>
          `;
        } catch (err) {
          alert('Mining failed: ' + err.message);
        } finally {
          isMining = false;
          mineBtn.textContent = 'Start Nonce Search';
          mineBtn.disabled = false;
        }
      });
    }

    if (currentTab === 'pos') {
      let slot = 1;
      container.querySelector('#pos-step-btn')?.addEventListener('click', async () => {
        const res = await api.getPoSSample(slot++);
        const logBox = container.querySelector('#pos-log');
        logBox.innerHTML = `
          <div class="p-2 bg-canvas-card border border-rule-hairline">
            <span class="text-accent-primary font-bold">SLOT #${res.slot} PROPOSER ELECTED: ${res.selected.id}</span>
            <div class="text-[11px] text-ink-muted">Address: ${res.selected.address} | Stake: ${res.selected.stake.toLocaleString()} ODC (${(res.selected.share * 100).toFixed(0)}%)</div>
            <div class="text-[11px] text-ink-muted font-mono mt-1">Seed: ${res.seed.slice(0, 24)}... &rarr; Modulo: ${res.randomInt} / ${res.totalStake}</div>
          </div>
        ` + logBox.innerHTML;
      });
    }

    if (currentTab === 'poa') {
      container.querySelector('#poa-load-schedule')?.addEventListener('click', async () => {
        const res = await api.getPoASchedule();
        const list = container.querySelector('#poa-schedule-list');
        list.innerHTML = res.schedule.map(s => `
          <div class="flex justify-between items-center p-2 bg-canvas-sunken border border-rule-hairline font-mono text-xs">
            <span>Block #${s.blockIndex}</span>
            <span class="font-medium text-ink-primary">${s.proposer.id}</span>
            <span class="text-ink-muted">${s.proposer.address.slice(0, 10)}...</span>
            <span class="text-status-pass text-[11px]">AUTHORIZED ✓</span>
          </div>
        `).join('');
      });
    }
  }

  renderView();
  return container;
}
