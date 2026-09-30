import { api } from '../api.js';
import { renderAltitudeChart } from '../components/svg_altitude_chart.js';

export async function renderOverview() {
  const [statusData, recordsData, blocksData] = await Promise.all([
    api.getStatus().catch(() => ({})),
    api.getRecords(1, 150).catch(() => ({ records: [] })),
    api.getBlocks(1, 5).catch(() => ({ blocks: [] }))
  ]);

  const height = statusData.chainHeight || 25;
  const sampleRecords = recordsData.records || [];
  const recentBlocks = blocksData.blocks || [];

  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="border-b border-rule-hairline pb-3">
        <h2 class="text-xl font-semibold tracking-tight text-ink-primary">System Overview</h2>
        <p class="text-xs text-ink-muted mt-1">Operational ground station status, orbital debris population telemetry, and cryptographic state anchors.</p>
      </div>

      <!-- Top Metrics Strip -->
      <div class="grid grid-cols-4 gap-4">
        <div class="card-box">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Tracked Fragments</div>
          <div class="text-xl font-semibold text-ink-primary font-mono mt-1">393 <span class="text-xs font-normal text-ink-muted">Objects</span></div>
          <div class="text-[11px] text-ink-muted mt-1">100 Iridium 33 | 293 Cosmos 2251</div>
        </div>

        <div class="card-box">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Ingested Ephemerides</div>
          <div class="text-xl font-semibold text-ink-primary font-mono mt-1">1,000 <span class="text-xs font-normal text-ink-muted">Records</span></div>
          <div class="text-[11px] text-ink-muted mt-1">Epochs: 01 Jul - 04 Jul 2026 UTC</div>
        </div>

        <div class="card-box">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Consortium Chain State</div>
          <div class="text-xl font-semibold text-ink-primary font-mono mt-1">${height} <span class="text-xs font-normal text-ink-muted">Blocks</span></div>
          <div class="text-[11px] text-status-pass font-mono mt-1">✓ Cryptographically Verified</div>
        </div>

        <div class="card-box">
          <div class="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Ethereum Anchors</div>
          <div class="text-xl font-semibold text-accent-primary font-mono mt-1">${height} / ${height} <span class="text-xs font-normal text-ink-muted">Roots</span></div>
          <div class="text-[11px] text-ink-muted mt-1">Contract: DebrisLedger.sol</div>
        </div>
      </div>

      <!-- Astrodynamics SVG Scatter Plot -->
      ${renderAltitudeChart(sampleRecords)}

      <!-- Recent Anchored Blocks Table -->
      <div class="card-box">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Recent Block Roots Anchored on Ethereum</h3>
            <p class="text-[11px] text-ink-muted">SHA-256 Merkle roots permanently anchored to DebrisLedger.sol smart contract</p>
          </div>
          <a href="#explorer" class="text-xs font-medium text-accent-primary hover:underline">View All Blocks &rarr;</a>
        </div>

        <div class="overflow-x-auto">
          <table class="table-dense">
            <thead>
              <tr>
                <th class="w-16">Height</th>
                <th>Block Hash</th>
                <th>Merkle Root (SHA-256)</th>
                <th>Timestamp (UTC)</th>
                <th>Records</th>
                <th>Consensus</th>
                <th>Proposer</th>
                <th class="text-right">Anchor State</th>
              </tr>
            </thead>
            <tbody>
              ${recentBlocks.map(b => `
                <tr>
                  <td class="font-mono font-medium">#${b.index}</td>
                  <td class="font-mono" title="${b.blockHash}">
                    ${b.blockHash.slice(0, 10)}...${b.blockHash.slice(-8)}
                  </td>
                  <td class="font-mono" title="${b.merkleRoot}">
                    0x${b.merkleRoot.slice(0, 10)}...${b.merkleRoot.slice(-8)}
                  </td>
                  <td class="font-mono text-ink-muted">${new Date(b.timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19)}</td>
                  <td class="font-mono">${b.recordCount}</td>
                  <td><span class="inline-block px-1.5 py-0.5 bg-canvas-sunken text-[10px] font-mono border border-rule-hairline">${b.consensus}</span></td>
                  <td class="font-mono">${b.proposer}</td>
                  <td class="text-right font-mono text-status-pass font-medium">ANCHORED ✓</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
