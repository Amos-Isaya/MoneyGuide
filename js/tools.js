// The five tools share a dialog. Inputs stay in memory, separate from learning data.
(() => {
  const t = MoneyGuideI18n.t;
  const calculate = MoneyGuideCalculators;
  const defaults = {
    savingsTool: {goal:5000, saved:500, months:12},
    budgetTool: {income:1500, housing:500, food:200, transport:100, education:100, debt:50, other:100, saving:150},
    growthTool: {initial:1000, monthly:100, rate:5, months:120},
    loanTool: {principal:10000, rate:6, months:36},
    currencyTool: {amount:100, from:'USD', to:'EUR', exchange:''}
  };
  const drafts = {};
  let active;
  const dialog = document.createElement('dialog');
  dialog.id = 'money-tool';
  dialog.setAttribute('aria-labelledby','money-tool-title');
  document.body.append(dialog);
  function money(amount, currency = getProfile()?.currency || document.querySelector('#header-currency')?.value || 'USD') {
    const locale = MoneyGuideI18n.language;
    if (currency === 'Other') return new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(amount) + ' ' + t('toolOther');
    return new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'code',maximumFractionDigits:2}).format(amount);
  }
  function number(amount) { return new Intl.NumberFormat(MoneyGuideI18n.language,{maximumFractionDigits:8}).format(amount); }
  function field(id, key, max = 1e12, min = 0, step = 'any') {
    return `<label for="tool-${id}">${t(key)}<input id="tool-${id}" name="${id}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" required></label>`;
  }
  const months = () => field('months','toolMonths',600,1,1);
  const rate = () => field('rate','toolRate',100);
  const expenseKeys = ['housing','food','transport','education','debt','other'];
  const expenseLabels = ['toolHousing','toolFood','toolTransport','toolEducation','toolDebt','toolOtherExpense'];
  function currencySelect(id,key) {
    return `<label for="tool-${id}">${t(key)}<select id="tool-${id}" name="${id}">${currencies.map(code=>`<option value="${code}">${code==='Other'?t('toolOther'):code}</option>`).join('')}</select></label>`;
  }
  function fields() {
    if(active==='savingsTool') return field('goal','toolGoal')+field('saved','toolSaved')+months();
    if(active==='budgetTool') return field('income','toolIncome')+expenseKeys.map((id,i)=>field(id,expenseLabels[i])).join('')+field('saving','toolBudgetSaving');
    if(active==='growthTool') return field('initial','toolInitial')+field('monthly','toolContribution')+rate()+months();
    if(active==='loanTool') return field('principal','toolPrincipal')+rate()+months();
    return field('amount','toolAmount')+currencySelect('from','toolFrom')+currencySelect('to','toolTo')+field('exchange','toolExchangeRate',1e12,0.000000000001)+`<button type="button" class="button secondary" id="tool-swap">${t('toolSwap')}</button>`;
  }
  function remember() {
    if(!active) return;
    drafts[active] = Object.fromEntries(new FormData(dialog.querySelector('form')));
  }
  function render() {
    const note = {savingsTool:'toolSavingsNote',budgetTool:'toolBudgetNote',growthTool:'toolGrowthNote',loanTool:'toolLoanNote',currencyTool:'toolExchangeNote'}[active];
    const currency = getProfile()?.currency || document.querySelector('#header-currency')?.value || 'USD';
    dialog.innerHTML = `<button type="button" class="close-button" aria-label="${t('close')}">×</button><p class="eyebrow">MoneyGuide · ${t('featureTools')}</p><h2 id="money-tool-title">${t(active)}</h2><p class="tool-introduction">${active==='currencyTool'?t('toolManual'):t('toolSample')}</p><div class="calculator-layout"><form id="tool-form" novalidate><h3>${t('toolInputs')}</h3>${active==='currencyTool'?'':`<p class="tool-unit">${t('toolUnits')}: ${currency==='Other'?t('toolOther'):currency}</p>`}<div class="calculator-fields">${fields()}</div><p class="tool-fineprint">${active==='currencyTool'?t('toolNeedRate'):t('toolLimits')}</p><button type="reset" class="button secondary">${t('toolReset')}</button></form><section class="calculator-results" aria-label="${t('toolResults')}"><p class="eyebrow">${t('toolResults')}</p><p id="tool-status" role="status" aria-live="polite"></p><div id="tool-output"></div></section></div><div class="tool-notes"><p>${t(note)}</p>${active==='currencyTool'?'':`<p>${t('toolCurrencyNote')}</p>`}<p>${t('toolPrivacy')}</p></div>`;
    const values = drafts[active] || defaults[active];
    Object.entries(values).forEach(([key,value])=>{dialog.querySelector('form').elements.namedItem(key).value=value;});
    dialog.querySelector('.close-button').addEventListener('click',()=>dialog.close());
    const form = dialog.querySelector('form');
    form.addEventListener('submit',event=>event.preventDefault());
    form.addEventListener('input',event=>{
      if(active==='currencyTool' && ['from','to'].includes(event.target.name)) {
        form.elements.exchange.value = form.elements.from.value === form.elements.to.value ? 1 : '';
      }
      remember(); update();
    });
    form.addEventListener('reset',event=>{
      event.preventDefault(); delete drafts[active]; render();
      dialog.querySelector('input').focus();
    });
    dialog.querySelector('#tool-swap')?.addEventListener('click',()=>{
      const from=form.elements.from.value;
      form.elements.from.value=form.elements.to.value; form.elements.to.value=from;
      const rateValue=Number(form.elements.exchange.value);
      form.elements.exchange.value=rateValue>0 ? 1/rateValue : '';
      remember(); update();
    });
    update();
  }
  function metric(key, value, primary=false) {
    return `<div class="tool-metric${primary?' is-primary':''}"><span>${t(key)}</span><strong>${value}</strong></div>`;
  }
  function bars(items) {
    const max=Math.max(...items.map(item=>Math.max(0,item[1])),1);
    return `<div class="tool-chart">${items.map(([label,value])=>`<div class="tool-chart-row"><div><span>${label}</span><strong>${money(value)}</strong></div><div class="tool-track" aria-hidden="true"><span style="width:${Math.max(0,value)/max*100}%"></span></div></div>`).join('')}</div>`;
  }
  function table(headings,rows) {
    return `<details class="tool-breakdown"><summary>${t('toolSchedule')}</summary><div class="tool-table-scroll" tabindex="0" role="region" aria-label="${t('toolSchedule')}"><table><caption class="sr-only">${t(active)}</caption><thead><tr>${headings.map(key=>`<th scope="col">${t(key)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }
  function update() {
    const form=dialog.querySelector('form');
    const output=dialog.querySelector('#tool-output');
    const status=dialog.querySelector('#tool-status');
    const raw=Object.fromEntries(new FormData(form));
    if(active==='currencyTool' && raw.from===raw.to) { form.elements.exchange.value=1; raw.exchange='1'; }
    if(active==='currencyTool') form.elements.exchange.readOnly=raw.from===raw.to;
    const valid=form.checkValidity();
    form.querySelectorAll('input').forEach(input=>input.setAttribute('aria-invalid',String(!input.validity.valid)));
    if(!valid) {
      output.innerHTML='';
      status.textContent=active==='currencyTool' && !raw.exchange?t('toolNeedRate'):t('toolInvalid');
      status.className='tool-validation'; return;
    }
    const v=Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,Number(value)]));
    let html='', summary='';
    try {
      if(active==='savingsTool') {
        const r=calculate.savings(v.goal,v.saved,v.months);
        summary=t('toolMonthly')+': '+money(r.monthly);
        html=metric('toolMonthly',money(r.monthly),true)+metric('toolRemaining',money(r.remaining))+`<progress max="100" value="${r.percent}" aria-label="${t('toolSaved')}"></progress><p>${number(r.percent)}%${r.remaining===0?' · '+t('toolReached'):''}</p>`+bars([[t('toolSaved'),v.saved],[t('toolRemaining'),r.remaining]]);
      } else if(active==='budgetTool') {
        const r=calculate.budget(v.income,expenseKeys.map(key=>v[key]),v.saving);
        const key=r.remaining<0?'toolDeficit':'toolAvailable';
        summary=t(key)+': '+money(Math.abs(r.remaining));
        html=metric(key,money(Math.abs(r.remaining)),true)+metric('toolSpent',money(r.spent))+metric('toolAllocated',money(r.allocated))+bars([[t('toolIncome'),v.income],[t('toolSpent'),r.spent],[t('toolBudgetSaving'),v.saving]]);
      } else if(active==='growthTool') {
        const r=calculate.growth(v.initial,v.monthly,v.rate,v.months);
        summary=t('toolBalance')+': '+money(r.balance);
        html=metric('toolBalance',money(r.balance),true)+metric('toolContributed',money(r.contributed))+metric('toolInterest',money(r.interest))+bars([[t('toolContributed'),r.contributed],[t('toolInterest'),r.interest]])+table(['toolMonth','toolContributed','toolBalance'],r.schedule.map(row=>[row.month,money(row.contributed),money(row.balance)]));
      } else if(active==='loanTool') {
        const r=calculate.loan(v.principal,v.rate,v.months);
        summary=t('toolPayment')+': '+money(r.payment);
        html=metric('toolPayment',money(r.payment),true)+metric('toolTotal',money(r.total))+metric('toolInterest',money(r.interest))+bars([[t('toolPrincipal'),v.principal],[t('toolInterest'),r.interest]])+table(['toolMonth','toolPayment','toolPrincipalPaid','toolInterest','toolLoanBalance'],r.schedule.map(row=>[row.month,money(row.payment),money(row.principal),money(row.interest),money(row.balance)]));
      } else {
        const result=calculate.convert(v.amount,v.exchange);
        summary=t('toolConverted')+': '+money(result,raw.to);
        html=metric('toolConverted',money(result,raw.to),true)+`<p class="exchange-equation">1 ${raw.from==='Other'?t('toolOther'):raw.from} = ${number(v.exchange)} ${raw.to==='Other'?t('toolOther'):raw.to}</p><p>${t('toolManual')}</p>`;
      }
      output.innerHTML=html; status.className='sr-only'; status.textContent=summary;
    } catch(error) { output.innerHTML=''; status.className='tool-validation'; status.textContent=t('toolInvalid'); }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-tool]');
    if(!button || !Object.hasOwn(defaults,button.dataset.tool)) return;
    active=button.dataset.tool;
    if(active==='currencyTool' && !drafts[active]) {
      const currency=getProfile()?.currency || document.querySelector('#header-currency')?.value || 'USD';
      drafts[active]={...defaults[active],from:currency,to:currency==='EUR'?'USD':'EUR'};
    }
    render(); dialog.showModal();
  });
  document.addEventListener('languagechange',()=>{if(dialog.open) {remember();render();}});
  document.addEventListener('currencychange',()=>{if(dialog.open) {remember();render();}});
})();
