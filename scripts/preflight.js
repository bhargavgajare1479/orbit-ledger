const fs = require('fs');
const path = require('path');
const http = require('http');

async function checkRpc(url) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });

    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsedRes = JSON.parse(data);
          resolve(parsedRes.result !== undefined);
        } catch {
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.write(postData);
    req.end();
  });
}

async function runPreflight() {
  console.log(`\n======================================================`);
  console.log(` Orbit Ledger: System Preflight Environment Verifier`);
  console.log(`======================================================\n`);

  let allPassed = true;

  // 1. Node.js Version Check
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (major === 20) {
    console.log(`[PASS] Node.js Version: ${nodeVersion} (LTS Iron pinned)`);
  } else {
    console.log(`[FAIL] Node.js Version: ${nodeVersion} (Required: v20.x for Ganache/Hardhat compatibility). Run 'nvm use 20'.`);
    allPassed = false;
  }

  // 2. Data Seed Integrity Check
  const seedPath = path.resolve(__dirname, '../data/seed_records.json');
  if (fs.existsSync(seedPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      if (data.totalRecords === 1000 && data.totalBlocks === 25) {
        console.log(`[PASS] Seed Records Integrity: 1,000 records across 25 blocks verified.`);
      } else {
        console.log(`[FAIL] Seed Records: Incorrect count (records: ${data.totalRecords}, blocks: ${data.totalBlocks}). Run 'npm run seed'.`);
        allPassed = false;
      }
    } catch {
      console.log(`[FAIL] Seed Records file corrupted. Run 'npm run seed'.`);
      allPassed = false;
    }
  } else {
    console.log(`[FAIL] Seed Records file missing (${seedPath}). Run 'npm run seed'.`);
    allPassed = false;
  }

  // 3. Deployment Artifacts Check
  const ganacheDepPath = path.resolve(__dirname, '../deployments/ganache.json');
  if (fs.existsSync(ganacheDepPath)) {
    const dep = JSON.parse(fs.readFileSync(ganacheDepPath, 'utf8'));
    const contracts = dep.contracts || {};
    if (contracts.DebrisLedger && contracts.DataCredit && contracts.ConjunctionMonitor && contracts.AlertCertificate) {
      console.log(`[PASS] Smart Contract Deployments: All 4 contracts present in deployments/ganache.json.`);
    } else {
      console.log(`[FAIL] Incomplete contract deployment artifact. Run 'npm run deploy:local'.`);
      allPassed = false;
    }
  } else {
    console.log(`[WARN] deployments/ganache.json missing. Will be generated automatically during 'npm run demo'.`);
  }

  // 4. Ganache RPC Reachability Check
  const rpcReachable = await checkRpc('http://127.0.0.1:8545');
  if (rpcReachable) {
    console.log(`[PASS] Ganache Local RPC: Active and responding on port 8545.`);
  } else {
    console.log(`[INFO] Ganache Local RPC: Not running. (Will be launched automatically by 'npm run demo').`);
  }

  // 5. Frontend Build Verification
  const frontendDistPath = path.resolve(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(frontendDistPath)) {
    console.log(`[PASS] Frontend Build: Production bundle verified in frontend/dist/.`);
  } else {
    console.log(`[INFO] Frontend Build: Not yet built (dev server will run via Vite).`);
  }

  console.log(`\n------------------------------------------------------`);
  if (allPassed) {
    console.log(` PREFLIGHT RESULT: ALL CORE CHECKS PASSED ✓`);
    console.log(` System is ready for live demonstration and examination.`);
  } else {
    console.log(` PREFLIGHT RESULT: ATTENTION REQUIRED ✖`);
    console.log(` Resolve flagged items above before proceeding.`);
  }
  console.log(`------------------------------------------------------\n`);

  process.exit(allPassed ? 0 : 1);
}

runPreflight();
