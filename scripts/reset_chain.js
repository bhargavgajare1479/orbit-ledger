const { processSeedData } = require('./seed_data_processor');

console.log('Resetting Orbit Ledger chain state to clean deterministic seed...');
processSeedData();
console.log('✓ Chain state reset complete.');
