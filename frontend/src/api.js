const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  getStatus: () => request('/api/status'),
  getBlocks: (page = 1, limit = 10) => request(`/api/blocks?page=${page}&limit=${limit}`),
  getBlock: (index) => request(`/api/blocks/${index}`),
  getProof: (blockIndex, recordIndex) => request(`/api/blocks/${blockIndex}/proof/${recordIndex}`),
  tamperRecord: (blockIndex, recordIndex, field, value) =>
    request('/api/tamper', {
      method: 'POST',
      body: JSON.stringify({ blockIndex, recordIndex, field, value })
    }),
  resetChain: () => request('/api/reset-chain', { method: 'POST' }),
  mineBlock: (difficulty = 1) =>
    request('/api/mine', {
      method: 'POST',
      body: JSON.stringify({ difficulty })
    }),
  getPoSSample: (slot = 0) => request(`/api/consensus/pos/sample?slot=${slot}`),
  getPoASchedule: () => request('/api/consensus/poa/schedule'),
  stepPBFT: (candidateHash) =>
    request('/api/consensus/pbft/step', {
      method: 'POST',
      body: JSON.stringify({ candidateHash })
    }),
  setPBFTFaults: (nodeId, mode) =>
    request('/api/consensus/pbft/faults', {
      method: 'POST',
      body: JSON.stringify({ nodeId, mode })
    }),
  screenConjunctions: (thresholdKm = 150, limit = 15) =>
    request(`/api/conjunctions/screen?thresholdKm=${thresholdKm}&limit=${limit}`),
  reportConjunction: (candidate, network = 'ganache') =>
    request('/api/conjunctions/report', {
      method: 'POST',
      body: JSON.stringify({ candidate, network })
    }),
  getUTXOPool: () => request('/api/utxo/pool'),
  submitUTXO: (inputs, outputs) =>
    request('/api/utxo/submit', {
      method: 'POST',
      body: JSON.stringify({ inputs, outputs })
    }),
  getRecords: (page = 1, limit = 40, search = '', operator = 'all') =>
    request(`/api/records?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&operator=${encodeURIComponent(operator)}`)
};
