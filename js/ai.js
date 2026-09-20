import { calculatePlan } from './finance.js';
import { askMoneyGuide, renderActions } from './ai-client.js';

// app.js owns profile persistence; AI reads it but never sends the first name.
function startMoneyGuide() {
  const profile = getProfile();
  if (profile && document.querySelector('#budget-form')) initializeMoneyGuide(profile);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startMoneyGuide, { once: true });
else startMoneyGuide();

function initializeMoneyGuide(profile) {
  const $ = selector => document.querySelector(selector);
  const form = $('#budget-form');
  $('#ai-workspace').hidden = false;
  let budget = null;
  let planController;
  let revision = 0;
  const money = value => profile.currency === 'Other' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' currency units' : new Intl.NumberFormat(undefined, { style: 'currency', currency: profile.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const context = () => ({ goal: profile.goal, knowledge: profile.knowledge, currency: profile.currency, budget });
  $('#plan-goal').textContent = 'Goal: ' + profile.goal + ' · Currency: ' + profile.currency;
  $('#plan-level').textContent = profile.knowledge + ' guidance';
  document.addEventListener('currencychange', event => {
    profile.currency = event.detail.currency;
    // Currency selection is not an exchange-rate conversion.
    form.reset(); budget = null; invalidatePlan(); showResults();
    $('#plan-goal').textContent = 'Goal: ' + profile.goal + ' · Currency: ' + profile.currency;
    $('#budget-error').textContent = '';
    $('#plan-status').textContent = 'Currency changed. Enter amounts in ' + profile.currency + ' to calculate a new plan.';
  });

  function invalidatePlan() {
    revision++;
    planController?.abort();
    planController = null;
    $('#generate-plan').disabled = false;
    $('#explain-plan').disabled = false;
    $('#plan-answer').hidden = true;
    $('#plan-status').textContent = '';
  }
  function showResults() {
    const results = $('#plan-results');
    results.replaceChildren(); results.hidden = !budget;
    if (budget) {
      const p = calculatePlan(budget);
      const rows = [ ['Monthly income', money(p.income)], ['Monthly expenses', money(p.expenses)], ['Remaining', money(p.remaining)], ['Savings target', money(p.target)], ['Already saved', money(p.saved)], ['Scenario savings / month', money(p.monthlySavings)], ['Estimated time', p.months === null ? 'No funded timeline yet' : p.months === 0 ? 'Target covered' : p.months + ' months'], ['Monthly buffer / shortfall', money(p.buffer)] ];
      results.append(...rows.map(([label, value]) => {
        const cell = document.createElement('div');
        const term = document.createElement('dt'); term.textContent = label;
        const detail = document.createElement('dd'); detail.textContent = value;
        cell.append(term, detail); return cell;
      }));
      $('#plan-assumptions').textContent = 'Illustrative scenario: save 80% of a positive remainder and keep 20% as a buffer. This is not an affordability recommendation. Assumes stable monthly take-home income and all expenses entered, consistent contributions, and no interest, fees or inflation. Existing savings count toward the target. ' + (p.remaining < 0 ? 'Your entered expenses exceed income; review the shortfall before planning new savings.' : 'Adjust the inputs to explore a different scenario.');
    } else $('#plan-assumptions').textContent = 'Start with your saved goal, or add monthly numbers above for a savings scenario.';
    document.dispatchEvent(new CustomEvent('moneyguidebudgetchange', { detail: budget }));
  }
  form.addEventListener('input', () => {
    if (!budget) return;
    budget = null; invalidatePlan(); showResults();
    $('#plan-status').textContent = 'Numbers changed. Calculate again to update your plan.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, Number(value)]));
      calculatePlan(values);
      invalidatePlan(); budget = values; showResults();
      $('#budget-error').textContent = '';
      $('#plan-status').textContent = 'Your calculations are ready. Build your personalized plan when you are ready.';
      $('#moneyguide-plan').scrollIntoView({ block: 'start' });
    } catch (error) { $('#budget-error').textContent = error.message; }
  });
  $('#demo-budget').addEventListener('click', () => {
    for (const [key, value] of Object.entries({ income: 2000, expenses: 1500, target: 3000, saved: 0 })) form.elements.namedItem(key).value = value;
    form.requestSubmit();
    $('#plan-status').textContent = 'Demo scenario calculated in your selected currency. Replace these sample numbers at any time.';
  });
  $('#clear-budget').addEventListener('click', () => {
    form.reset(); budget = null; invalidatePlan(); showResults(); $('#budget-error').textContent = '';
  });

  async function buildPlan(mode) {
    planController?.abort();
    const controller = new AbortController(); planController = controller;
    const version = revision;
    $('#generate-plan').disabled = true; $('#explain-plan').disabled = true;
    $('#plan-answer').hidden = true;
    $('#plan-status').textContent = mode === 'explain' ? 'MoneyGuide is explaining your plan...' : 'MoneyGuide is building your personalized plan...';
    try {
      const answer = await askMoneyGuide(mode, context(), controller);
      if (version !== revision) return;
      $('#insight-title').textContent = mode === 'explain' ? 'Why this plan?' : 'MoneyGuide Insight';
      $('#plan-insight').textContent = answer.insight;
      renderActions(answer, $('#plan-actions'));
      $('#plan-answer').hidden = false;
      $('#plan-status').textContent = 'Personalized with NVIDIA Nemotron.';
    } catch (error) {
      if (version !== revision) return;
      $('#plan-status').textContent = (budget ? 'Your calculations are ready, but personalized AI insights are temporarily unavailable. ' : 'Your goal is ready, but personalized AI insights are temporarily unavailable. ') + (error.name === 'AbortError' ? 'The request timed out. Please try again.' : error.message);
    } finally {
      if (planController === controller) { $('#generate-plan').disabled = false; $('#explain-plan').disabled = false; planController = null; }
    }
  }
  $('#generate-plan').addEventListener('click', () => buildPlan('plan'));
  $('#explain-plan').addEventListener('click', () => buildPlan('explain'));
  showResults();
}
