const CDP = require('chrome-remote-interface');

(async () => {
  const targets = await CDP.List({ host: '127.0.0.1', port: 9333 });
  const tab = targets.find(t => t.type === 'page' && t.url.includes('riseup.co.il'));
  if (!tab) { console.log('No riseup tab found'); process.exit(1); }

  const client = await CDP({ host: '127.0.0.1', port: 9333, target: tab });
  const { Runtime } = client;
  await Runtime.enable();

  const result = await Runtime.evaluate({
    expression: `
      fetch('/api/budget/2026-02/1', { credentials: 'include' })
        .then(r => r.text())
        .then(d => d)
    `,
    awaitPromise: true,
    returnByValue: true,
  });

  const raw = result.result.value;
  let budgets = JSON.parse(raw);

  // It returns an array — find Feb 2026
  if (!Array.isArray(budgets)) budgets = [budgets];

  for (const budget of budgets) {
    console.log(`\n=== ${budget.budgetDate} ===`);
    const envs = budget.envelopes || [];

    let totalIncome = 0;
    let totalSalary = 0;
    const incomes = [];

    for (const e of envs) {
      for (const a of (e.actuals || [])) {
        if (a.isIncome) {
          const amt = a.incomeAmount || 0;
          totalIncome += amt;
          if (a.expense === 'משכורת') totalSalary += amt;
          incomes.push({
            date: (a.transactionDate || '').slice(0, 10),
            amount: amt,
            biz: a.businessName || '?',
            cat: a.expense || '?',
          });
        }
      }
    }

    incomes.sort((a, b) => b.amount - a.amount);
    console.log('\nAll income:');
    for (const i of incomes) {
      console.log(`  ${i.date}  +₪${i.amount.toFixed(2).padStart(12)}  ${i.biz.slice(0, 40)}  [${i.cat}]`);
    }
    console.log(`\nTotal income:  ₪${totalIncome.toFixed(2)}`);
    console.log(`Salary only:   ₪${totalSalary.toFixed(2)}`);
  }

  await client.close();
})();
