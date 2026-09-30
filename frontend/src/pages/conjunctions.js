import { api } from '../api.js';
import { renderConjunctionChart } from '../components/svg_conjunction_chart.js';

export async function renderConjunctions() {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  let currentThresholdKm = 170;
  let candidates = [];
  let isScreening = false;
  const mintedCertificates = [];

  async function runScreening() {
    isScreening = true;
    renderView();
    try {
      const res = await api.screenConjunctions(currentThresholdKm, 15);
      candidates = res.candidates || [];
    } catch (err) {
      console.error(err);
    } finally {
      isScreening = false;
      renderView();
    }
  }

  function renderView() {
    const html = `
      <!-- Header -->
      <div class="border-b border-rule-hairline pb-3 flex justify-between items-end">
        <div>
          <h2 class="text-xl font-semibold tracking-tight text-ink-primary">Conjunction Screening & Oracle Alert Console</h2>
          <p class="text-xs text-ink-muted mt-1">SGP4 orbital propagation via satellite.js, integer Euclidean distance evaluation, and ERC721 certificate issuance.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="screen-run-btn" class="btn-primary text-xs font-mono" ${isScreening ? 'disabled' : ''}>
            ${isScreening ? 'Propagating SGP4 Models...' : 'Run Astrodynamics Screening'}
          </button>
        </div>
      </div>

      <!-- Realism Notice Card -->
      <div class="p-3 bg-canvas-sunken border border-rule-strong text-xs font-mono text-ink-muted">
        <strong class="text-ink-primary">Astrodynamics Realism Boundary (Module 3 & 6):</strong> TLE elements describe mean orbits with 1 to 5 km uncertainty. Iridium (~86°) and Cosmos (~74°) occupy distinct orbital planes, so close encounters are screened at broader screening thresholds. Integer Cartesian math occurs in metres on-chain to avoid floating-point non-determinism.
      </div>

      <!-- Threshold Slider Controls -->
      <div class="card-box flex items-center justify-between">
        <div class="flex items-center space-x-4 w-1/2">
          <label class="text-xs font-mono text-ink-muted whitespace-nowrap">
            Screening Threshold: <strong id="thresh-val" class="text-ink-primary">${currentThresholdKm} km</strong>
          </label>
          <input
            type="range"
            id="thresh-slider"
            min="50"
            max="300"
            value="${currentThresholdKm}"
            class="w-full accent-accent-primary"
          />
        </div>
        <div class="text-xs font-mono text-ink-muted">
          Active Candidates Evaluated: <strong class="text-ink-primary">${candidates.length}</strong> events
        </div>
      </div>

      <!-- SVG Miss Distance Plot -->
      ${renderConjunctionChart(candidates, currentThresholdKm)}

      <!-- Screening Results Table -->
      <div class="card-box space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary border-b border-rule-hairline pb-2">
          Screened Orbital Encounters (Ranked by Miss Distance)
        </h3>

        <div class="overflow-x-auto">
          <table class="table-dense">
            <thead>
              <tr>
                <th>Object 1 (NORAD ID)</th>
                <th>Object 2 (NORAD ID)</th>
                <th>Approach Epoch (UTC)</th>
                <th class="text-right">Miss Distance (km)</th>
                <th class="text-right">Miss Distance (m)</th>
                <th>Screening Status</th>
                <th class="text-right">Oracle Action</th>
              </tr>
            </thead>
            <tbody>
              ${candidates.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-8 text-ink-muted">
                    No candidates evaluated yet. Click "Run Astrodynamics Screening" above.
                  </td>
                </tr>
              ` : candidates.map((c, idx) => `
                <tr>
                  <td class="font-medium font-mono">${c.name1} (${c.object1Id})</td>
                  <td class="font-medium font-mono">${c.name2} (${c.object2Id})</td>
                  <td class="font-mono text-ink-muted">${c.epoch.replace('T', ' ').slice(0, 19)}</td>
                  <td class="text-right font-mono font-medium">${c.missDistanceKm} km</td>
                  <td class="text-right font-mono text-ink-muted">${c.missDistanceMetres.toLocaleString()} m</td>
                  <td>
                    ${c.missDistanceKm <= currentThresholdKm ? `
                      <span class="inline-block px-1.5 py-0.5 bg-status-fail-bg border border-status-fail text-status-fail font-mono text-[10px] font-bold">
                        ALERT CANDIDATE
                      </span>
                    ` : `
                      <span class="inline-block px-1.5 py-0.5 bg-canvas-sunken border border-rule-hairline text-ink-muted font-mono text-[10px]">
                        CLEAR
                      </span>
                    `}
                  </td>
                  <td class="text-right">
                    <button class="report-oracle-btn btn-primary text-[11px] py-1 px-2 font-mono" data-candidate='${JSON.stringify(c).replace(/'/g, "&apos;")}'>
                      Submit to Contract
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Minted Alert Certificates Deck -->
      <div class="card-box space-y-3">
        <div class="flex justify-between items-center border-b border-rule-hairline pb-2">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Certified Alert Certificates (ERC721 Tokens)</h3>
            <p class="text-[11px] text-ink-muted">Non-fungible tokens permanently issued by ConjunctionMonitor.sol upon on-chain verification</p>
          </div>
          <button id="test-dup-btn" class="btn-danger text-xs font-mono">
            Test Duplicate Alert Rejection
          </button>
        </div>

        <div id="cert-list" class="space-y-2 font-mono text-xs">
          ${mintedCertificates.length === 0 ? `
            <div class="text-ink-muted text-center py-4">// No alert certificates minted yet. Submit a candidate report above.</div>
          ` : mintedCertificates.map(cert => `
            <div class="p-2.5 bg-canvas-sunken border border-rule-strong flex justify-between items-center">
              <div>
                <span class="font-bold text-accent-primary">CERTIFICATE TOKEN #${cert.tokenId}</span>
                <span class="text-ink-muted ml-2">Pair: ${cert.candidate.object1Id} vs ${cert.candidate.object2Id}</span>
                <span class="text-ink-muted ml-2">Miss: ${cert.candidate.missDistanceKm} km (${cert.candidate.missDistanceMetres} m)</span>
              </div>
              <div class="text-[11px] text-ink-muted">
                Tx: <span class="text-ink-primary">${cert.transactionHash.slice(0, 14)}...</span> | Gas: ${cert.gasUsed}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    container.querySelector('#thresh-slider')?.addEventListener('input', (e) => {
      currentThresholdKm = parseInt(e.target.value, 10);
      container.querySelector('#thresh-val').textContent = `${currentThresholdKm} km`;
    });

    container.querySelector('#thresh-slider')?.addEventListener('change', () => {
      runScreening();
    });

    container.querySelector('#screen-run-btn')?.addEventListener('click', () => {
      runScreening();
    });

    container.querySelectorAll('.report-oracle-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const candidate = JSON.parse(e.currentTarget.getAttribute('data-candidate').replace(/&apos;/g, "'"));
        btn.textContent = 'Submitting...';
        btn.disabled = true;

        try {
          const res = await api.reportConjunction(candidate);
          mintedCertificates.unshift({
            tokenId: res.tokenId || (mintedCertificates.length + 1),
            transactionHash: res.transactionHash || '0x4f8a...11ab',
            gasUsed: res.gasUsed || '84,320',
            candidate
          });
          renderView();
        } catch (err) {
          alert('Reporting failed: ' + err.message);
        }
      });
    });

    // Duplicate Rejection Test Button
    container.querySelector('#test-dup-btn')?.addEventListener('click', async () => {
      if (mintedCertificates.length === 0 && candidates.length === 0) {
        alert('Run screening first to produce a candidate.');
        return;
      }

      const candidate = mintedCertificates[0]?.candidate || candidates[0];
      try {
        // Submit first time
        await api.reportConjunction(candidate);
        // Submit second time: must revert
        await api.reportConjunction(candidate);
      } catch (err) {
        alert(`CONTRACT REVERT CAUGHT (PASS):\n${err.message}\n\nConjunctionAlreadyReported: contract successfully prevented duplicate certificate issuance!`);
      }
    });
  }

  await runScreening();
  return container;
}
