/**
 * Renders an austere hand-made SVG scatter plot: Altitude vs. Inclination.
 * Shows the two distinct orbital planes from the 2009 collision.
 * @param {Array} records Sample of orbital records (e.g. 100-200 points)
 * @returns {string} Raw SVG HTML markup
 */
export function renderAltitudeChart(records = []) {
  const width = 640;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Domain boundaries
  // Inclination: 70° to 90°
  const minInc = 70;
  const maxInc = 92;
  // Semimajor Axis: 6800 km to 7300 km
  const minAlt = 6800;
  const maxAlt = 7300;

  const scaleX = (inc) => padding.left + ((inc - minInc) / (maxInc - minInc)) * plotW;
  const scaleY = (alt) => padding.top + plotH - ((alt - minAlt) / (maxAlt - minAlt)) * plotH;

  // Generate data points
  let pointsHtml = '';
  for (const r of records) {
    if (!r.inclinationDeg || !r.semimajorAxisKm) continue;
    const cx = scaleX(r.inclinationDeg);
    const cy = scaleY(r.semimajorAxisKm);
    const isIridium = r.operator === 'Node-1-Alpha' || (r.objectName && r.objectName.includes('IRIDIUM'));
    const color = isIridium ? '#C2410C' : '#475569';

    pointsHtml += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.5" fill="${color}" opacity="0.75">
      <title>${r.objectName || 'Object'} (${r.noradCatId})\nInc: ${r.inclinationDeg.toFixed(2)}° | Axis: ${r.semimajorAxisKm.toFixed(1)} km</title>
    </circle>`;
  }

  // Grid lines
  let gridHtml = '';
  // Vertical grid: 70, 75, 80, 85, 90 deg
  for (let inc = 70; inc <= 90; inc += 5) {
    const x = scaleX(inc);
    gridHtml += `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + plotH}" stroke="#D8D3C8" stroke-dasharray="3,3" stroke-width="1" />`;
    gridHtml += `<text x="${x}" y="${padding.top + plotH + 16}" fill="#6B675E" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle">${inc}°</text>`;
  }

  // Horizontal grid: 6900, 7000, 7100, 7200 km
  for (let alt = 6900; alt <= 7200; alt += 100) {
    const y = scaleY(alt);
    gridHtml += `<line x1="${padding.left}" y1="${y}" x2="${padding.left + plotW}" y2="${y}" stroke="#D8D3C8" stroke-dasharray="3,3" stroke-width="1" />`;
    gridHtml += `<text x="${padding.left - 8}" y="${y + 3}" fill="#6B675E" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="end">${alt}</text>`;
  }

  return `
    <div class="card-box">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-primary">Debris Orbital Shells: Altitude vs. Inclination</h3>
          <p class="text-[11px] text-ink-muted">Empirical Space-Track ephemeris distribution showing distinct collision planes</p>
        </div>
        <div class="flex items-center space-x-3 text-[11px] font-mono">
          <span class="flex items-center"><span class="w-2.5 h-2.5 bg-[#C2410C] mr-1.5 inline-block"></span> Iridium 33 (~86.3°)</span>
          <span class="flex items-center"><span class="w-2.5 h-2.5 bg-[#475569] mr-1.5 inline-block"></span> Cosmos 2251 (~74.1°)</span>
        </div>
      </div>
      <div class="w-full overflow-x-auto">
        <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-[640px] h-auto bg-canvas-sunken border border-rule-hairline">
          ${gridHtml}
          <!-- Axes -->
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotH}" stroke="#B8B2A4" stroke-width="1.5" />
          <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${padding.left + plotW}" y2="${padding.top + plotH}" stroke="#B8B2A4" stroke-width="1.5" />
          
          <!-- Axis Labels -->
          <text x="${padding.left + plotW / 2}" y="${height - 8}" fill="#1A1A18" font-size="11" font-weight="500" text-anchor="middle">Orbital Inclination (Degrees)</text>
          <text x="14" y="${padding.top + plotH / 2}" fill="#1A1A18" font-size="11" font-weight="500" text-anchor="middle" transform="rotate(-90, 14, ${padding.top + plotH / 2})">Semimajor Axis (km)</text>

          <!-- Data Points -->
          ${pointsHtml}
        </svg>
      </div>
    </div>
  `;
}
