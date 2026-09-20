// Pure calculations: no page or storage access, so these are easy to test.
const MoneyGuideCalculators = (() => {
  function valid(values) {
    if (values.some(value => !Number.isFinite(value) || value < 0 || value > 1e15)) throw new Error('invalid');
  }
  function monthsValid(months) {
    if (!Number.isInteger(months) || months < 1 || months > 600) throw new Error('invalid');
  }
  function savings(goal, saved, months) {
    valid([goal, saved]); monthsValid(months);
    const remaining = Math.max(0, goal - saved);
    return {remaining, monthly: remaining / months, percent: goal ? Math.min(100, saved / goal * 100) : 100};
  }
  function budget(income, expenses, saving) {
    valid([income, ...expenses, saving]);
    const spent = expenses.reduce((total, amount) => total + amount, 0);
    return {spent, allocated: spent + saving, remaining: income - spent - saving};
  }
  function growth(initial, monthly, annual, months) {
    valid([initial, monthly, annual]); monthsValid(months);
    if (annual > 100) throw new Error('invalid');
    let balance = initial;
    const schedule = [];
    for (let month = 1; month <= months; month++) {
      // Nominal annual rate divided by 12; deposits arrive at month end.
      balance = balance * (1 + annual / 1200) + monthly;
      if (month % 12 === 0 || month === months) schedule.push({month, balance, contributed: initial + monthly * month});
    }
    const contributed = initial + monthly * months;
    return {balance, contributed, interest: balance - contributed, schedule};
  }
  function loan(principal, annual, months) {
    valid([principal, annual]); monthsValid(months);
    if (annual > 100) throw new Error('invalid');
    const rate = annual / 1200;
    // log1p/expm1 keep the fixed-payment formula accurate for very small rates.
    const payment = rate ? principal * rate / -Math.expm1(-months * Math.log1p(rate)) : principal / months;
    let balance = principal;
    const schedule = [];
    for (let month = 1; month <= months; month++) {
      const interest = balance * rate;
      const paidPrincipal = Math.min(balance, payment - interest);
      balance = Math.max(0, balance - paidPrincipal);
      if (month === months) balance = 0;
      schedule.push({month, payment, principal: paidPrincipal, interest, balance});
    }
    return {payment, total: payment * months, interest: Math.max(0, payment * months - principal), schedule};
  }
  function convert(amount, rate) {
    valid([amount, rate]); if (!rate) throw new Error('invalid');
    return amount * rate;
  }
  return {savings, budget, growth, loan, convert};
})();
if (typeof module !== 'undefined') module.exports = MoneyGuideCalculators;
