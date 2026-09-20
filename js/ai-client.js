import { actions } from './finance.js';
import { moneyGuideEndpoint } from './api-url.js';

// Plans and the coach share one request contract and the same server-side integration.
export async function askMoneyGuide(mode, context, controller, question = '', history = []) {
  if (location.protocol === 'file:') throw new Error('AI needs the MoneyGuide server. Run npm run dev and open http://localhost:3000.');
  const endpoint = moneyGuideEndpoint();
  const diagnostic = (code, status) => {
    if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) console.warn('[MoneyGuide AI]', { endpoint, code, status });
  };
  const timer = setTimeout(() => controller.abort(), 50000);
  try {
    const payload = { mode, context, question, history: history.slice(-8) };
    while (new TextEncoder().encode(JSON.stringify(payload)).length > 19000 && payload.history.length) payload.history.splice(0, 2);
    let response;
    try {
      response = await fetch(endpoint, { method: 'POST', credentials: 'omit', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      diagnostic('API_CONNECTION_ERROR');
      throw new Error('Cannot reach the MoneyGuide API. Check that the backend is running, API_BASE_URL is correct, and MONEYGUIDE_ALLOWED_ORIGINS on the backend allows this website.');
    }
    const serverMessage = 'The AI backend is not available on this site. Run npm run dev and open http://localhost:3000, or deploy the backend. GitHub Pages and static preview servers cannot run Nemotron.';
    if (response.status === 404 || response.status === 405) { diagnostic('API_ROUTE_MISSING', response.status); throw new Error(serverMessage + ' For a separate Vercel backend, set API_BASE_URL in js/config.js.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error(serverMessage); }
    if (!response.ok) { diagnostic(data.code || 'API_ERROR', response.status); throw new Error((data.error || 'MoneyGuide AI request failed.') + (data.code ? ` [${data.code}]` : '')); }
    if (typeof data.insight !== 'string' || !data.insight.trim() || !Array.isArray(data.steps) || data.steps.some(step => !step || typeof step.text !== 'string' || !Object.hasOwn(actions, step.action))) throw new Error('MoneyGuide received an incomplete answer. Please try again.');
    return data;
  } finally { clearTimeout(timer); }
}

export function renderActions(answer, container) {
  container.replaceChildren(...answer.steps.map(step => {
    const item = document.createElement('li');
    const text = document.createElement('p'); text.textContent = step.text;
    const link = document.createElement('a'); link.className = 'action-link'; link.textContent = actions[step.action].label;
    const destination = actions[step.action].target;
    const target = destination.startsWith('#') ? document.querySelector(destination) : null;
    link.href = destination.startsWith('#') && !target ? 'dashboard.html' + destination : destination;
    if (link.getAttribute('href').startsWith('dashboard') || link.getAttribute('href').startsWith('module')) link.setAttribute('data-requires-profile', '');
    link.addEventListener('click', () => document.querySelector('#coach-dialog')?.close());
    if (target) link.addEventListener('click', event => {
      event.preventDefault(); target.scrollIntoView({ block: 'center' });
      (target.querySelector('input') || target).focus();
    });
    item.append(text, link); return item;
  }));
}
