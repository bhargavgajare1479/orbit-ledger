import { api } from '../api.js';

export async function renderRecords() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  let currentPage = 1;
  let currentSearch = '';
  let currentOperator = 'all';

  async function loadData() {
    const data = await api.getRecords(currentPage, 30, currentSearch, currentOperator);
    renderTable(data);
  }

  function renderTable(data) {
    const records = data.records || [];
    const total = data.total || 0;
    const totalPages = data.totalPages || 1;

    const html = `
      <div class="border-b border-rule-hairline pb-3 flex justify-between items-end">
        <div>
          <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Orbital Ephemeris Catalogue</h2>
          <p class="text-xs text-ink-muted mt-1">Deduplicated Space-Track OMM records from the 2009 Iridium-Cosmos collision clouds.</p>
        </div>
        <div class="text-xs font-mono text-ink-muted">
          Total Indexed: <strong class="text-ink-primary">${total}</strong> records
        </div>
      </div>

      <!-- Controls Strip -->
      <div class="card-box flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center space-x-3">
          <input
            type="text"
            id="rec-search"
            placeholder="Search NORAD ID, Object Name..."
            value="${currentSearch}"
            class="bg-canvas-bg border border-rule-strong text-xs px-2.5 py-1.5 w-64 focus:outline-none focus:border-accent-primary font-mono"
          />
          <select id="rec-operator" class="bg-canvas-bg border border-rule-strong text-xs px-2.5 py-1.5 focus:outline-none focus:border-accent-primary">
            <option value="all" ${currentOperator === 'all' ? 'selected' : ''}>All Operators</option>
            <option value="Node-1-Alpha" ${currentOperator === 'Node-1-Alpha' ? 'selected' : ''}>Iridium 33 (Node-1-Alpha)</option>
            <option value="Node-2-Beta" ${currentOperator === 'Node-2-Beta' ? 'selected' : ''}>Cosmos 2251 (Node-2-Beta)</option>
          </select>
          <button id="rec-filter-btn" class="btn-primary">Filter</button>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center space-x-2 text-xs font-mono">
          <button id="rec-prev" class="btn-secondary px-2 py-1" ${currentPage <= 1 ? 'disabled' : ''}>&larr; Prev</button>
          <span class="text-ink-muted">Page ${currentPage} of ${totalPages}</span>
          <button id="rec-next" class="btn-secondary px-2 py-1" ${currentPage >= totalPages ? 'disabled' : ''}>Next &rarr;</button>
        </div>
      </div>

      <!-- Dense Table -->
      <div class="card-box p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table-dense">
            <thead>
              <tr>
                <th class="w-20">NORAD ID</th>
                <th>Object Name</th>
                <th>Designator</th>
                <th>Operator</th>
                <th>Epoch (UTC)</th>
                <th class="text-right">Inclination</th>
                <th class="text-right">Period</th>
                <th class="text-right">Semimajor Axis</th>
                <th>Record SHA-256 Hash</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${records.length === 0 ? `
                <tr>
                  <td colspan="10" class="text-center py-8 text-ink-muted">
                    No matching records found. Try adjusting your search query or operator filter.
                  </td>
                </tr>
              ` : records.map(r => `
                <tr>
                  <td class="font-mono font-medium">${r.noradCatId}</td>
                  <td class="font-medium">${r.objectName}</td>
                  <td class="font-mono text-ink-muted">${r.objectId}</td>
                  <td>
                    <span class="inline-block px-1.5 py-0.5 text-[10px] font-mono border ${r.operator === 'Node-1-Alpha' ? 'border-[#C2410C]/40 text-accent-primary bg-canvas-sunken' : 'border-[#475569]/40 text-[#475569] bg-canvas-sunken'}">
                      ${r.operator}
                    </span>
                  </td>
                  <td class="font-mono text-ink-muted">${r.epoch.replace('T', ' ').slice(0, 19)}</td>
                  <td class="text-right font-mono">${r.inclinationDeg.toFixed(2)}°</td>
                  <td class="text-right font-mono">${r.periodMin.toFixed(1)} min</td>
                  <td class="text-right font-mono">${r.semimajorAxisKm.toFixed(1)} km</td>
                  <td class="font-mono" title="${r.recordHash}">
                    ${r.recordHash.slice(0, 8)}...${r.recordHash.slice(-6)}
                  </td>
                  <td class="text-right">
                    <button class="rec-inspect-btn text-accent-primary hover:underline text-[11px] font-medium" data-record='${JSON.stringify(r).replace(/'/g, "&apos;")}'>
                      Inspect
                    </button>
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
    container.querySelector('#rec-filter-btn')?.addEventListener('click', () => {
      currentSearch = container.querySelector('#rec-search').value;
      currentOperator = container.querySelector('#rec-operator').value;
      currentPage = 1;
      loadData();
    });

    container.querySelector('#rec-search')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentSearch = container.querySelector('#rec-search').value;
        currentOperator = container.querySelector('#rec-operator').value;
        currentPage = 1;
        loadData();
      }
    });

    container.querySelector('#rec-prev')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadData();
      }
    });

    container.querySelector('#rec-next')?.addEventListener('click', () => {
      currentPage++;
      loadData();
    });

    container.querySelectorAll('.rec-inspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = JSON.parse(e.currentTarget.getAttribute('data-record').replace(/&apos;/g, "'"));
        showRecordModal(r);
      });
    });
  }

  function showRecordModal(r) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="bg-canvas-card border border-rule-strong max-w-2xl w-full p-6 space-y-4 shadow-lg text-ink-primary">
        <div class="flex justify-between items-start border-b border-rule-hairline pb-2">
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider">${r.objectName} (NORAD #${r.noradCatId})</h3>
            <p class="text-xs text-ink-muted font-mono mt-0.5">${r.recordId}</p>
          </div>
          <button id="modal-close" class="text-ink-muted hover:text-ink-primary text-lg font-mono">&times;</button>
        </div>

        <div class="grid grid-cols-3 gap-3 text-xs font-mono">
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">EPOCH (UTC)</span>
            <span class="font-medium">${r.epoch}</span>
          </div>
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">INCLINATION</span>
            <span class="font-medium">${r.inclinationDeg}°</span>
          </div>
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">SEMIMAJOR AXIS</span>
            <span class="font-medium">${r.semimajorAxisKm} km</span>
          </div>
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">PERIOD</span>
            <span class="font-medium">${r.periodMin} min</span>
          </div>
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">APOAPSIS</span>
            <span class="font-medium">${r.apoapsisKm} km</span>
          </div>
          <div class="bg-canvas-sunken p-2 border border-rule-hairline">
            <span class="text-ink-muted block text-[10px]">PERIAPSIS</span>
            <span class="font-medium">${r.periapsisKm} km</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Raw Two-Line Elements (TLE)</div>
          <pre class="bg-canvas-sunken border border-rule-hairline p-2 text-xs font-mono select-all overflow-x-auto">${r.tleLine1}\n${r.tleLine2}</pre>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Canonical SHA-256 Record Hash</div>
          <div class="bg-canvas-sunken border border-rule-hairline p-2 text-xs font-mono text-ink-primary break-all select-all">${r.recordHash}</div>
        </div>

        <div class="pt-2 flex justify-end">
          <button id="modal-close-btn" class="btn-secondary">Close Inspector</button>
        </div>
      </div>
    `;

    modalRoot.classList.remove('hidden');

    const closeModal = () => modalRoot.classList.add('hidden');
    modalRoot.querySelector('#modal-close')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
  }

  await loadData();
  return container;
}
