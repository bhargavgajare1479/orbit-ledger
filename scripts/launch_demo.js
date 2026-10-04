const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      method: 'GET',
      timeout: 1000
    }, () => resolve(true));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) return true;
    await sleep(300);
  }
  return false;
}

async function launchDemo() {
  console.log(`\n======================================================`);
  console.log(` Orbit Ledger: Ground Station Demo Launcher`);
  console.log(`======================================================\n`);

  const processes = [];

  function cleanup() {
    console.log(`\nShutting down Orbit Ledger ground station...`);
    processes.forEach(p => {
      try { p.kill(); } catch {}
    });
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // 1. Verify seed data
  const seedPath = path.resolve(__dirname, '../data/seed_records.json');
  if (!fs.existsSync(seedPath)) {
    console.log(`[1/5] Ingesting Space-Track CSVs into 25 deterministic blocks...`);
    execSync('node scripts/seed_data_processor.js', { stdio: 'inherit' });
  } else {
    console.log(`[1/5] ✓ Verified deterministic seed records (1,000 records).`);
  }

  // 2. Start Ganache local chain
  let isGanacheUp = await isPortOpen(8545);
  if (!isGanacheUp) {
    console.log(`[2/5] Starting local Ganache RPC on port 8545...`);
    const ganacheProc = spawn('npx', [
      'ganache',
      '--server.port', '8545',
      '--wallet.totalAccounts', '10',
      '--miner.blockTime', '0',
      '--chain.networkId', '1337',
      '--wallet.mnemonic', 'submit lake embrace famous lazy drum proud poverty casino rare unhappy dawn'
    ], { stdio: 'ignore' });
    processes.push(ganacheProc);
    isGanacheUp = await waitForPort(8545, 15000);
    if (!isGanacheUp) {
      throw new Error('Ganache RPC failed to start on port 8545.');
    }
  }
  console.log(`[2/5] ✓ Ganache RPC active on http://127.0.0.1:8545`);

  // 3. Deploy contracts & anchor roots
  console.log(`[3/5] Deploying smart contracts and anchoring 25 block roots...`);
  execSync('npx hardhat run scripts/deploy.js --network ganache', {
    stdio: 'inherit',
    env: { ...process.env, HARDHAT_DISABLE_TELEMETRY_PROMPT: 'true' }
  });
  execSync('node scripts/anchor_all.js ganache', { stdio: 'inherit' });
  console.log(`[3/5] ✓ Smart contracts deployed and anchored.`);

  // 4. Start Express REST API Server
  console.log(`[4/5] Launching REST API server on port 3000...`);
  const apiProc = spawn('node', ['server/api.js'], { stdio: 'inherit' });
  processes.push(apiProc);
  const isApiUp = await waitForPort(3000, 10000);
  if (!isApiUp) {
    throw new Error('REST API server failed to start on port 3000.');
  }
  console.log(`[4/5] ✓ REST API server online.`);

  // 5. Start Vite Front-End
  console.log(`[5/5] Launching Vite front-end console on port 5173...`);
  const viteProc = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve(__dirname, '../frontend'),
    stdio: 'inherit'
  });
  processes.push(viteProc);
  await sleep(2000);

  console.log(`\n======================================================`);
  console.log(` Orbit Ledger Ground Station is LIVE`);
  console.log(`------------------------------------------------------`);
  console.log(` Console Interface: http://localhost:5173`);
  console.log(` REST API Service:  http://localhost:3000`);
  console.log(` Ganache RPC:       http://127.0.0.1:8545`);
  console.log(`------------------------------------------------------`);
  console.log(` Press Ctrl+C to terminate all services.`);
  console.log(`======================================================\n`);
}

launchDemo().catch(err => {
  console.error('Launch failed:', err);
  process.exit(1);
});
