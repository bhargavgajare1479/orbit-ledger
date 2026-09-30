import './styles.css';
import { Router } from './router.js';
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const contentElement = document.getElementById('page-content');
  const router = new Router(contentElement);

  // Top Status Bar Polling
  async function refreshTopStatus() {
    try {
      const [status, utxo] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getUTXOPool().catch(() => null)
      ]);

      if (status) {
        document.getElementById('stat-height').textContent = `${status.chainHeight} BLOCKS`;
        document.getElementById('stat-anchored').textContent = `${status.chainHeight} / ${status.chainHeight}`;
        if (status.deployment) {
          document.getElementById('stat-network').textContent = `${status.deployment.network.toUpperCase()}: 127.0.0.1:8545 (${status.deployment.chainId})`;
        }
      }

      if (utxo && utxo.utxoPool) {
        document.getElementById('stat-utxo-count').innerHTML = `UTXO POOL: <strong>${utxo.utxoPool.length} UNSPENT</strong>`;
      }
    } catch {
      // Ignore background refresh errors
    }
  }

  // Operator Context Switcher
  const operatorSelect = document.getElementById('operator-select');
  const activeOperatorText = document.getElementById('stat-active-operator');

  operatorSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    const names = {
      '0': 'Node 1 Alpha (0x0a70...)',
      '1': 'Node 2 Beta (0x9cab...)',
      '2': 'Node 3 Gamma (0xa4e2...)',
      '3': 'Node 4 Delta (0x1efE...)',
      'examiner': 'Examiner Mode (Full Audit)'
    };
    if (activeOperatorText) {
      activeOperatorText.textContent = `OPERATOR: ${names[val] || val}`;
    }
  });

  refreshTopStatus();
  setInterval(refreshTopStatus, 10000);
});
