/**
 * Renders an austere hand-made SVG plot: Miss Distances vs. Threshold.
 * @param {Array} candidates Conjunction events from screening engine
 * @param {number} thresholdKm Active screening threshold
 * @returns {string} Raw SVG HTML markup
 */
export function renderConjunctionChart(candidates = [], thresholdKm = 50) {
  const width = 640;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const count = Math.max(candidates.length, 1);
  const maxDist = Math.max(thresholdKm * 1.5, ...candidates.map(c => c.missDistanceKm), 100);

  const scaleX = (idx) => padding.left + (idx / Math.max(count - 1, 1)) * plotW;
  const scaleY = (dist) => padding.top + plotH - (dist / maxDist) * plotH;

  // Horizontal Threshold line
  const thresholdY = scaleY(thresholdKm);

  let eventsHtml = '';
  candidates.forEach((c, idx) => {
    const cx = scaleX(idx);
    const cy = scaleY(c.missDistanceKm);
    const isAlert = c.missDistanceKm <= thresholdKm;
    const color = isAlert ? '#C2410C' : '#6B675E';

    // Stem line from axis to point
    eventsHtml += `<line x1="${cx.toFixed(1)}" y1="${(padding.top + plotH).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${color}" stroke-width="1.2" opacity="0.6" />`;
    // Dot
    eventsHtml += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${isAlert ? '4' : '3'}" fill="${color}">
      <title>Pair: ${c.object1Id} vs ${c.object2Id}\nMiss: ${c.missDistanceKm} km\nThreshold: ${thresholdKm} km</title>
    </circle>`;
  });

  return `
    <div class="card-box">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Conjunction Miss Distance vs. Alert Threshold</h3>
          <p class="text-[11px] text-ink-muted">Evaluated orbital encounters against certified screening limit</p>
        </div>
        <div class="flex items-center space-x-3 text-[11px] font-mono">
          <span class="flex items-center"><span class="w-3 h-0.5 bg-[#991B1B] mr-1.5 inline-block"></span> Threshold (${thresholdKm} km)</span>
          <span class="flex items-center"><span class="w-2.5 h-2.5 bg-[#C2410C] mr-1.5 inline-block"></span> Alert Event</span>
        </div>
      </div>
      <div class="w-full overflow-x-auto">
        <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-[640px] h-auto bg-canvas-sunken border border-rule-hairline">
          <!-- Threshold line -->
          <line x1="${padding.left}" y1="${thresholdY}" x2="${padding.left + plotW}" y2="${thresholdY}" stroke="#991B1B" stroke-dasharray="4,2" stroke-width="1.5" />
          <text x="${padding.left + plotW - 4}" y="${thresholdY - 6}" fill="#991B1B" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="end">THRESHOLD: ${thresholdKm} KM</text>

          <!-- Axes -->
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotH}" stroke="#B8B2A4" stroke-width="1.5" />
          <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${padding.left + plotW}" y2="${padding.top + plotH}" stroke="#B8B2A4" stroke-width="1.5" />

          <!-- Axis Labels -->
          <text x="${padding.left + plotW / 2}" y="${height - 8}" fill="#1A1A18" font-size="11" font-weight="500" text-anchor="middle">Evaluated Fragment Conjunction Events</text>
          <text x="14" y="${padding.top + plotH / 2}" fill="#1A1A18" font-size="11" font-weight="500" text-anchor="middle" transform="rotate(-90, 14, ${padding.top + plotH / 2})">Miss Distance (km)</text>

          <!-- Events -->
          ${eventsHtml}
        </svg>
      </div>
    </div>
  `;
}
