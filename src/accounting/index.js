#!/usr/bin/env node
const readline = require('readline');

// In-memory data store (simulates DataProgram STORAGE-BALANCE)
let storageBalance = 1000.00;

function round2(n) {
  return Math.round(n * 100) / 100;
}

function readBalance() {
  return storageBalance;
}

function writeBalance(newBalance) {
  storageBalance = round2(newBalance);
}

function formatBalance(n) {
  const fixed = round2(n).toFixed(2); // e.g. "1000.00"
  const [intPart, dec] = fixed.split('.');
  const paddedInt = intPart.length < 6 ? '0'.repeat(6 - intPart.length) + intPart : intPart;
  return `${paddedInt}.${dec}`; // matches COBOL output like 001000.00
}

let rl = null;
let question = (prompt) => {
  return Promise.reject(new Error('No question function available; call setQuestionFn or run main()'));
};

function setQuestionFn(fn) {
  question = fn;
}

async function operations(passedOperation) {
  const op = (passedOperation || '').toString().trim().toUpperCase();

  if (op === 'TOTAL') {
    const bal = readBalance();
    console.log('Current balance: ' + formatBalance(bal));
    return;
  }

  if (op === 'CREDIT') {
    const input = await question('Enter credit amount: ');
    const amount = parseFloat(input);
    if (!Number.isFinite(amount) || amount < 0) {
      console.log('Invalid amount. Credit aborted.');
      return;
    }
    const bal = readBalance();
    writeBalance(bal + amount);
    console.log('Amount credited. New balance: ' + formatBalance(readBalance()));
    return;
  }

  if (op === 'DEBIT') {
    const input = await question('Enter debit amount: ');
    const amount = parseFloat(input);
    if (!Number.isFinite(amount) || amount < 0) {
      console.log('Invalid amount. Debit aborted.');
      return;
    }
    const bal = readBalance();
    if (bal >= amount) {
      writeBalance(bal - amount);
      console.log('Amount debited. New balance: ' + formatBalance(readBalance()));
    } else {
      console.log('Insufficient funds for this debit.');
    }
    return;
  }

  console.log('Unknown operation: ' + passedOperation);
}

async function main() {
  // create readline interface only when running interactively
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  // default question implementation uses rl
  question = (prompt) => new Promise(resolve => rl.question(prompt, answer => resolve(answer)));

  while (true) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = (await question('Enter your choice (1-4): ')).trim();

    if (choice === '1') {
      await operations('TOTAL');
    } else if (choice === '2') {
      await operations('CREDIT');
    } else if (choice === '3') {
      await operations('DEBIT');
    } else if (choice === '4') {
      console.log('Exiting the program. Goodbye!');
      break;
    } else {
      console.log('Invalid choice, please select 1-4.');
    }
  }

  rl.close();
}

if (require.main === module) {
  main();
}

// Exports for later unit/integration tests in Node.js port
module.exports = { readBalance, writeBalance, formatBalance, operations, setQuestionFn };
