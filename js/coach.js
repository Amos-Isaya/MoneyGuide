// A classic script keeps the chat shell and setup errors usable even on file://.
(() => {
  const $ = selector => document.querySelector(selector);
  const dialog = $('#coach-dialog');
  if (!dialog) return;
  let history = [];
  let budget = null;
  let controller = null;
  let opener;
  const log = $('#coach-history');
  const input = $('#coach-input');
  const status = $('#coach-status');
  const error = $('#coach-error');
  function context() {
    const profile = getProfile();
    let currency = profile?.currency || 'USD';
    if (!profile) {
      try { const saved = localStorage.getItem('moneyguide.currency'); if (['USD','EUR','GBP','RWF','NGN','KES','Other'].includes(saved)) currency = saved; } catch { /* Guest defaults remain usable. */ }
    }
    return { goal: profile?.goal || 'Manage my money better', knowledge: profile?.knowledge || 'Beginner', currency, budget };
  }
  function describeContext() {
    const c = context();
    $('#coach-context').textContent = getProfile() ? `${c.knowledge} guidance · ${c.goal} · ${c.currency}${budget ? ' · Your calculated budget is included' : ''}` : `Start with a question · Beginner guidance · ${c.currency}`;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function bubble(label, text, kind) {
    const div = document.createElement('div'); div.className = 'chat-message chat-' + kind;
    const author = document.createElement('strong'); author.textContent = label;
    const content = document.createElement('p'); content.className = 'ai-text'; content.textContent = text;
    div.append(author, content); log.append(div); scroll(); return div;
  }
  function busy(value) {
    $('#coach-send').disabled = value;
    $('#coach-form').setAttribute('aria-busy', String(value));
    status.textContent = value ? 'MoneyGuide is thinking...' : '';
    status.classList.toggle('is-thinking', value);
  }
  function clear() {
    controller?.abort(); controller = null; history = [];
    log.replaceChildren(); dialog.classList.remove('has-messages'); input.value = ''; error.textContent = ''; busy(false);
  }
  function open(button) {
    opener = button; describeContext();
    if (!dialog.open) dialog.showModal();
    $('#open-coach').setAttribute('aria-expanded', 'true');
    input.focus(); scroll();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-open-coach], #open-coach');
    if (button) { event.preventDefault(); open(button); }
  });
  $('#coach-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { $('#open-coach').setAttribute('aria-expanded', 'false'); opener?.focus({ preventScroll: true }); });
  $('#coach-clear').addEventListener('click', () => { clear(); input.focus(); });
  for (const question of ['How can I save $3,000?', 'What is a credit score?', 'Help me understand my budget.', 'How much should I keep in an emergency fund?']) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = question;
    button.addEventListener('click', () => { input.value = question; input.focus(); });
    $('#coach-questions').append(button);
  }
  document.addEventListener('moneyguidebudgetchange', event => {
    budget = event.detail; clear(); describeContext();
  });
  document.addEventListener('currencychange', () => { budget = null; clear(); describeContext(); });
  $('#coach-form').addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || controller) return;
    const pending = new AbortController(); controller = pending;
    const currentContext = context();
    dialog.classList.add('has-messages');
    const message = bubble('You', question, 'user');
    input.value = ''; error.textContent = ''; busy(true);
    try {
      if (location.protocol === 'file:') throw new Error('AI needs the MoneyGuide server. Run npm run dev and open http://localhost:3000.');
      const { askMoneyGuide, renderActions } = await import('./ai-client.js');
      if (controller !== pending) return;
      const answer = await askMoneyGuide('chat', currentContext, pending, question, history);
      if (controller !== pending) return;
      const reply = bubble('MoneyGuide', answer.insight, 'assistant');
      const list = document.createElement('ul'); list.className = 'plan-actions'; renderActions(answer, list); reply.append(list);
      history.push({ role: 'user', content: question }, { role: 'assistant', content: answer.insight });
      scroll();
    } catch (failure) {
      if (controller !== pending) return;
      message.classList.add('chat-failed');
      const notice = document.createElement('small'); notice.textContent = 'No answer received. You can retry this question.'; message.append(notice);
      error.textContent = failure.name === 'AbortError' ? 'MoneyGuide took too long. Please try again.' : failure.message;
      if (!input.value) input.value = question;
      scroll();
    } finally {
      if (controller === pending) { controller = null; busy(false); if (dialog.open) input.focus(); }
    }
  });
  describeContext();
})();
