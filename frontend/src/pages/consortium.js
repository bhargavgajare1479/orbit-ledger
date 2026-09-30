import { api } from '../api.js';

export async function renderConsortium() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  const nodeStates = {
    'Node-1-Alpha': 'honest',
    'Node-2-Beta': 'honest',
    'Node-3-Gamma': 'honest',
    'Node-4-Delta': 'honest'
  };

  function renderView() {
    const html = `
      <!-- Header -->
      <div class="border-b border-rule-hairline pb-3 flex justify-between items-end">
        <div>
          <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Consortium PBFT State Machine</h2>
          <p class="text-xs text-ink-muted mt-1">Four-node Castro-Liskov Byzantine Fault Tolerance consensus with interactive fault injection.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="pbft-reset-btn" class="btn-secondary text-xs font-mono">Reset All Nodes to Honest</button>
          <button id="pbft-run-btn" class="btn-primary text-xs font-mono">Run PBFT Round (3 Phases)</button>
        </div>
      </div>

      <!-- Protocol Formula Header -->
      <div class="p-3 bg-canvas-sunken border border-rule-strong text-xs font-mono flex items-center justify-between text-ink-primary">
        <span>CONSORTIUM PARAMETERS: N = 4 nodes | Max Tolerable Faults f = 1 | Quorum Required = 2f + 1 = 3 votes</span>
        <span class="text-accent-primary font-bold">STATE: READY</span>
      </div>

      <!-- Four Operator Node Cards -->
      <div class="grid grid-cols-4 gap-4">
        <!-- Node 1 -->
        <div class="card-box space-y-3 border ${nodeStates['Node-1-Alpha'] === 'honest' ? 'border-rule-hairline' : 'border-status-fail'}">
          <div class="flex justify-between items-center border-b border-rule-hairline pb-1.5">
            <span class="text-xs font-bold text-ink-primary">Node 1 (Alpha)</span>
            <span class="text-[10px] font-mono text-accent-primary font-medium">PRIMARY</span>
          </div>
          <div class="text-[11px] text-ink-muted font-mono">0x0a70...af922</div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-mono text-ink-muted block">Fault Mode</label>
            <select data-node="Node-1-Alpha" class="node-mode-select w-full bg-canvas-bg border border-rule-strong text-xs py-1 px-1.5 font-mono focus:outline-none focus:border-accent-primary">
              <option value="honest" ${nodeStates['Node-1-Alpha'] === 'honest' ? 'selected' : ''}>Honest (Normal)</option>
              <option value="offline" ${nodeStates['Node-1-Alpha'] === 'offline' ? 'selected' : ''}>Offline (Silent)</option>
              <option value="conflicting" ${nodeStates['Node-1-Alpha'] === 'conflicting' ? 'selected' : ''}>Conflicting (Byzantine)</option>
            </select>
          </div>
        </div>

        <!-- Node 2 -->
        <div class="card-box space-y-3 border ${nodeStates['Node-2-Beta'] === 'honest' ? 'border-rule-hairline' : 'border-status-fail'}">
          <div class="flex justify-between items-center border-b border-rule-hairline pb-1.5">
            <span class="text-xs font-bold text-ink-primary">Node 2 (Beta)</span>
            <span class="text-[10px] font-mono text-ink-muted">REPLICA</span>
          </div>
          <div class="text-[11px] text-ink-muted font-mono">0x9cab...d432d5</div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-mono text-ink-muted block">Fault Mode</label>
            <select data-node="Node-2-Beta" class="node-mode-select w-full bg-canvas-bg border border-rule-strong text-xs py-1 px-1.5 font-mono focus:outline-none focus:border-accent-primary">
              <option value="honest" ${nodeStates['Node-2-Beta'] === 'honest' ? 'selected' : ''}>Honest (Normal)</option>
              <option value="offline" ${nodeStates['Node-2-Beta'] === 'offline' ? 'selected' : ''}>Offline (Silent)</option>
              <option value="conflicting" ${nodeStates['Node-2-Beta'] === 'conflicting' ? 'selected' : ''}>Conflicting (Byzantine)</option>
            </select>
          </div>
        </div>

        <!-- Node 3 -->
        <div class="card-box space-y-3 border ${nodeStates['Node-3-Gamma'] === 'honest' ? 'border-rule-hairline' : 'border-status-fail'}">
          <div class="flex justify-between items-center border-b border-rule-hairline pb-1.5">
            <span class="text-xs font-bold text-ink-primary">Node 3 (Gamma)</span>
            <span class="text-[10px] font-mono text-ink-muted">REPLICA</span>
          </div>
          <div class="text-[11px] text-ink-muted font-mono">0xa4e2...Bea4d2</div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-mono text-ink-muted block">Fault Mode</label>
            <select data-node="Node-3-Gamma" class="node-mode-select w-full bg-canvas-bg border border-rule-strong text-xs py-1 px-1.5 font-mono focus:outline-none focus:border-accent-primary">
              <option value="honest" ${nodeStates['Node-3-Gamma'] === 'honest' ? 'selected' : ''}>Honest (Normal)</option>
              <option value="offline" ${nodeStates['Node-3-Gamma'] === 'offline' ? 'selected' : ''}>Offline (Silent)</option>
              <option value="conflicting" ${nodeStates['Node-3-Gamma'] === 'conflicting' ? 'selected' : ''}>Conflicting (Byzantine)</option>
            </select>
          </div>
        </div>

        <!-- Node 4 -->
        <div class="card-box space-y-3 border ${nodeStates['Node-4-Delta'] === 'honest' ? 'border-rule-hairline' : 'border-status-fail'}">
          <div class="flex justify-between items-center border-b border-rule-hairline pb-1.5">
            <span class="text-xs font-bold text-ink-primary">Node 4 (Delta)</span>
            <span class="text-[10px] font-mono text-ink-muted">REPLICA</span>
          </div>
          <div class="text-[11px] text-ink-muted font-mono">0x1efE...0101ab</div>
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-mono text-ink-muted block">Fault Mode</label>
            <select data-node="Node-4-Delta" class="node-mode-select w-full bg-canvas-bg border border-rule-strong text-xs py-1 px-1.5 font-mono focus:outline-none focus:border-accent-primary">
              <option value="honest" ${nodeStates['Node-4-Delta'] === 'honest' ? 'selected' : ''}>Honest (Normal)</option>
              <option value="offline" ${nodeStates['Node-4-Delta'] === 'offline' ? 'selected' : ''}>Offline (Silent)</option>
              <option value="conflicting" ${nodeStates['Node-4-Delta'] === 'conflicting' ? 'selected' : ''}>Conflicting (Byzantine)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Execution Log & Phase Tracer -->
      <div class="card-box space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Protocol Phase Message Audit Trail
        </h3>
        <div id="pbft-log-box" class="bg-canvas-sunken p-3 border border-rule-hairline font-mono text-xs space-y-1.5 min-h-[200px] max-h-[360px] overflow-y-auto">
          <div class="text-ink-muted">// Click "Run PBFT Round" to trigger pre-prepare, prepare, and commit phases</div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.node-mode-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const nodeId = e.target.getAttribute('data-node');
        const mode = e.target.value;
        nodeStates[nodeId] = mode;
        await api.setPBFTFaults(nodeId, mode);
        renderView();
      });
    });

    container.querySelector('#pbft-reset-btn')?.addEventListener('click', async () => {
      Object.keys(nodeStates).forEach(k => { nodeStates[k] = 'honest'; });
      await api.setPBFTFaults('reset', 'honest');
      renderView();
    });

    container.querySelector('#pbft-run-btn')?.addEventListener('click', async () => {
      const logBox = container.querySelector('#pbft-log-box');
      logBox.innerHTML = `<div class="text-ink-muted">Executing PBFT round...</div>`;

      try {
        const res = await api.stepPBFT();
        logBox.innerHTML = res.log.map(entry => {
          let color = 'text-ink-primary';
          if (entry.status === 'SUCCESS' || entry.quorumReached) color = 'text-status-pass font-bold';
          if (entry.status === 'BYZANTINE' || entry.status === 'SILENT') color = 'text-[#D97706]';
          if (entry.status === 'CONSENSUS_FAILED' || entry.status === 'FAILED') color = 'text-status-fail font-bold';

          return `
            <div class="flex items-start space-x-2">
              <span class="text-ink-muted text-[10px] w-24 flex-shrink-0">[${entry.phase}]</span>
              <span class="${color}">${entry.message}</span>
            </div>
          `;
        }).join('');

        if (res.committed) {
          logBox.innerHTML += `
            <div class="p-2 mt-2 bg-status-pass-bg border border-status-pass text-status-pass text-xs font-bold">
              ✓ CONSENSUS ACHIEVED: Block committed with signatures from: ${res.signers.join(', ')}.
            </div>
          `;
        } else {
          logBox.innerHTML += `
            <div class="p-2 mt-2 bg-status-fail-bg border border-status-fail text-status-fail text-xs font-bold">
              ✖ CONSENSUS HALTED: Safe protocol halt triggered. Split-brain avoided because honest nodes could not reach quorum of 3.
            </div>
          `;
        }
      } catch (err) {
        logBox.innerHTML = `<div class="text-status-fail">Error: ${err.message}</div>`;
      }
    });
  }

  renderView();
  return container;
}
