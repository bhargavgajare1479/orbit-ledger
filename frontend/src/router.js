import { renderOverview } from './pages/overview.js';
import { renderRecords } from './pages/records.js';
import { renderExplorer } from './pages/explorer.js';
import { renderConsensus } from './pages/consensus.js';
import { renderConsortium } from './pages/consortium.js';
import { renderEthereum } from './pages/ethereum.js';
import { renderConjunctions } from './pages/conjunctions.js';
import { renderConcepts } from './pages/concepts.js';

const routes = {
  overview: renderOverview,
  records: renderRecords,
  explorer: renderExplorer,
  consensus: renderConsensus,
  consortium: renderConsortium,
  ethereum: renderEthereum,
  conjunctions: renderConjunctions,
  concepts: renderConcepts
};

export class Router {
  constructor(contentElement) {
    this.contentElement = contentElement;
    this.currentRoute = null;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Initial route handling
    if (!window.location.hash) {
      window.location.hash = '#overview';
    } else {
      this.handleRoute();
    }
  }

  async handleRoute() {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    const routeKey = rawHash.split('/')[0] || 'overview';
    const handler = routes[routeKey] || routes.overview;

    this.currentRoute = routeKey;
    this.updateNav(routeKey);

    this.contentElement.innerHTML = `
      <div class="p-8 text-center text-xs font-mono text-ink-muted">
        Loading view [${routeKey}]...
      </div>
    `;

    try {
      const rendered = await handler();
      this.contentElement.innerHTML = '';
      if (typeof rendered === 'string') {
        this.contentElement.innerHTML = rendered;
      } else if (rendered instanceof HTMLElement) {
        this.contentElement.appendChild(rendered);
      }
    } catch (err) {
      this.contentElement.innerHTML = `
        <div class="p-4 bg-status-fail-bg border border-status-fail text-status-fail text-xs font-mono">
          Failed to render view [${routeKey}]: ${err.message}
        </div>
      `;
    }
  }

  updateNav(activeKey) {
    document.querySelectorAll('.nav-item').forEach(el => {
      const itemRoute = el.getAttribute('data-route');
      if (itemRoute === activeKey) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
}
