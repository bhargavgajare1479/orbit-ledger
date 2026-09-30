const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { UTXOLedger } = require('../../chain/utxo/utxo_ledger');

describe('UTXO Ledger and Double-Spend Tests', () => {
  let ledger;

  beforeEach(() => {
    ledger = new UTXOLedger();
  });

  test('Initializes with genesis unspent transaction outputs', () => {
    const pool = ledger.getUTXOPool();
    assert.equal(pool.length, 4);
    assert.equal(ledger.getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'), 5000);
    assert.equal(ledger.getBalance('1CounterpartyOperator1AlphaAddress'), 3000);
  });

  test('Executes valid transaction spending UTXO and creating new outputs', () => {
    const pool = ledger.getUTXOPool();
    const aliceUTXO = pool.find(u => u.address === '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    const inputs = [{ txId: aliceUTXO.txId, outputIndex: aliceUTXO.outputIndex }];
    const outputs = [
      { address: '1BobRecipientAddress', value: 3500 },
      { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 1400 } // Change
    ];

    const tx = ledger.spend(inputs, outputs);
    assert.ok(tx.txId);
    assert.equal(tx.fee, 100); // 5000 - (3500 + 1400) = 100 fee

    // Original UTXO should be deleted
    const updatedPool = ledger.getUTXOPool();
    assert.equal(updatedPool.find(u => u.txId === aliceUTXO.txId && u.outputIndex === aliceUTXO.outputIndex), undefined);

    // New UTXOs exist
    assert.equal(ledger.getBalance('1BobRecipientAddress'), 3500);
    assert.equal(ledger.getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'), 1400);
  });

  test('Rejects double-spending attempt consuming an already spent UTXO', () => {
    const pool = ledger.getUTXOPool();
    const aliceUTXO = pool.find(u => u.address === '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    const inputs = [{ txId: aliceUTXO.txId, outputIndex: aliceUTXO.outputIndex }];
    const outputs1 = [{ address: '1BobRecipientAddress', value: 4900 }];
    const outputs2 = [{ address: '1CharlieAdversaryAddress', value: 4900 }];

    // Transaction 1: spends Alice's UTXO to Bob
    ledger.spend(inputs, outputs1);

    // Transaction 2: attempts to spend Alice's identical UTXO to Charlie
    assert.throws(
      () => {
        ledger.spend(inputs, outputs2);
      },
      /DoubleSpendDetected/
    );
  });

  test('Rejects transaction when outputs exceed inputs', () => {
    const pool = ledger.getUTXOPool();
    const aliceUTXO = pool.find(u => u.address === '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'); // 5000 value

    const inputs = [{ txId: aliceUTXO.txId, outputIndex: aliceUTXO.outputIndex }];
    const outputs = [{ address: '1BobRecipientAddress', value: 6000 }]; // 6000 > 5000

    assert.throws(
      () => {
        ledger.spend(inputs, outputs);
      },
      /InsufficientFunds/
    );
  });
});
