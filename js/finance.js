// Shared by the browser and backend. Money uses integer minor units for arithmetic.
export const goals = ['Manage my money better', 'Start saving', 'Build credit', 'Buy a car', 'Manage college expenses', 'Learn about investing'];
export const levels = ['Beginner', 'Intermediate', 'Advanced'];
export const currencies = ['USD', 'EUR', 'GBP', 'RWF', 'NGN', 'KES', 'Other'];
export const actions = {
  budget: { label: 'Review your monthly budget', target: '#budget-form' },
  savings: { label: 'Explore your savings target', target: '#savings-target' },
  basics: { label: 'Explore the Budgeting module', target: 'module.html?id=2' },
  goal: { label: 'Adjust your goal or knowledge level', target: 'index.html?profile=edit' }
};
export function calculatePlan(input) {
  const values = ['income', 'expenses', 'target', 'saved'].map(key => {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9 || Math.abs(value * 100 - Math.round(value * 100)) > 0.0001) {
      throw new Error('Use nonnegative amounts up to 1 billion, with at most two decimal places.');
    }
    return Math.round(value * 100);
  });
  const [income, expenses, target, saved] = values;
  const remaining = income - expenses;
  // An editable scenario, not a claim about what the user can afford.
  const monthlySavings = Math.floor(Math.max(0, remaining) * 0.8);
  const stillNeeded = Math.max(0, target - saved);
  return {
    income: income / 100, expenses: expenses / 100, target: target / 100, saved: saved / 100,
    remaining: remaining / 100, monthlySavings: monthlySavings / 100,
    buffer: (remaining - monthlySavings) / 100, stillNeeded: stillNeeded / 100,
    months: !stillNeeded ? 0 : monthlySavings ? Math.ceil(stillNeeded / monthlySavings) : null,
    savingsPercent: income ? Math.round(monthlySavings / income * 10000) / 100 : null
  };
}
