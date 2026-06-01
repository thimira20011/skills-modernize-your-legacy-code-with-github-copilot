const path = require('path');

// Require the module under test
const acct = require(path.resolve(__dirname, '..', 'index.js'));

describe('Accounting core functions', () => {
  beforeEach(() => {
    // reset balance to initial value
    acct.writeBalance(1000.00);
  });

  test('initial balance is 1000.00', () => {
    expect(acct.readBalance()).toBe(1000.00);
  });

  test('formatBalance pads and formats correctly', () => {
    expect(acct.formatBalance(1000)).toBe('001000.00');
    expect(acct.formatBalance(12.5)).toBe('000012.50');
  });

  test('writeBalance updates balance', () => {
    acct.writeBalance(1250.75);
    expect(acct.readBalance()).toBe(1250.75);
  });
});

describe('Operations (interactive logic) via injected prompts', () => {
  beforeEach(() => {
    acct.writeBalance(1000.00);
  });

  test('TOTAL displays current balance', async () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    await acct.operations('TOTAL');
    console.log = originalLog;
    expect(logs.some(l => l.includes('Current balance'))).toBeTruthy();
  });

  test('CREDIT increases the balance', async () => {
    acct.setQuestionFn(() => Promise.resolve('250.00'));
    await acct.operations('CREDIT');
    expect(acct.readBalance()).toBe(1250.00);
  });

  test('DEBIT decreases the balance when sufficient funds', async () => {
    acct.setQuestionFn(() => Promise.resolve('100.00'));
    await acct.operations('DEBIT');
    expect(acct.readBalance()).toBe(900.00);
  });

  test('DEBIT with insufficient funds leaves balance unchanged', async () => {
    acct.writeBalance(50.00);
    acct.setQuestionFn(() => Promise.resolve('100.00'));
    const before = acct.readBalance();
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    await acct.operations('DEBIT');
    console.log = originalLog;
    const after = acct.readBalance();
    expect(after).toBe(before);
    expect(logs.some(l => l.includes('Insufficient funds'))).toBeTruthy();
  });
});
