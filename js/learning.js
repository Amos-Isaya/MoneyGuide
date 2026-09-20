// One reusable renderer serves all ten modules; their content lives in modules.js.
(() => {
  const page = document.body.dataset.page;
  if (!['dashboard', 'module', 'certificate'].includes(page)) return;
  const profile = getProfile();
  if (!MoneyGuideAuth.current()) return;
  if (!profile) { window.location.replace('index.html?onboard=1&next='+encodeURIComponent(MoneyGuideAuth.destination(location.href))); return; }
  const i18n = MoneyGuideI18n;
  const t = i18n.t;
  const store = MoneyGuideProgress;
  const main = document.querySelector('#main');
  const id = Number(new URLSearchParams(window.location.search).get('id'));
  const module = MoneyGuideModules.find(item => item.id === id);
  let cardIndex = 0;
  let cardFlipped = false;
  let testOpen = false;
  let questionIndex = module ? store.get(id).question : 0;
  const checkFeedback = {};

  // Escape dynamic values before placing them in an HTML template.
  function escape(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }
  function button(text, action, extra = '') { return `<button class="button" data-action="${action}" ${extra}>${escape(text)}</button>`; }
  function moduleLink(moduleId, text, suffix = '', className = 'button') { return `<a class="${className}" href="module.html?id=${moduleId}${suffix}">${escape(text)} <span aria-hidden="true">↗</span></a>`; }
  function certLink(moduleId) { return `<a class="text-link" href="certificate.html?id=${moduleId}">${escape(t('viewCertificate'))} ↗</a>`; }
  function status(p) { return p.certificate ? t('earned') : store.completed(p) ? t('completed') : p.started ? t('inProgress') : t('notStarted'); }
  function activityCount(p) { return p.lessons.length + p.checks.length + p.cards.length + Number(p.summary); }
  function reportError(error) {
    const banner = document.querySelector('#storage-error');
    banner.textContent = t(error.message === 'damagedStorage' ? 'damagedStorage' : 'storageError');
    banner.hidden = false;
    banner.scrollIntoView({ block: 'nearest' });
  }
  function save(action) {
    try { action(); document.querySelector('#storage-error').hidden = true; return true; }
    catch (error) { reportError(error); return false; }
  }
  function profileHeader() {
    const total = store.totals();
    document.querySelector('#profile-name').textContent = (profile.fullName || profile.firstName);
    document.querySelector('#avatar').textContent = Array.from((profile.fullName || profile.firstName))[0].toUpperCase();
    document.querySelector('#profile-level').textContent = t('level') + ' ' + total.level + ' · ' + t('level' + total.level);
  }
  function moduleCard(item, recommendedId) {
    const p = store.get(item.id);
    const percent = Math.round((activityCount(p) + Number(p.bestScore >= 8)) / 18 * 100);
    const isComplete = store.completed(p);
    const isRecommended = item.id === recommendedId;
    const action = isComplete ? t('review') : p.started ? t('resume') : t('start');
    return `<a class="module-card learning-card ${isRecommended ? 'featured' : ''} ${isComplete ? 'is-complete' : ''} ${p.started && !isComplete ? 'is-active' : ''}" href="module.html?id=${item.id}" aria-labelledby="module-title-${item.id} module-action-${item.id}">
      <div class="card-top"><span class="module-index">${String(item.id).padStart(2, '0')}</span><span class="status">${isComplete ? MoneyGuideCards.icon('check') : ''}${escape(isComplete ? t('completed') : status(p))}</span></div>
      <div class="module-card-content"><p class="module-number">${escape(isRecommended ? t('recommended') : t('module') + ' ' + item.id)}</p><h3 id="module-title-${item.id}">${escape(i18n.title(item.id))}</h3><p lang="en">${escape(item.description)}</p></div>
      <div class="module-meta"><span>${t('beginner')}</span><span>${t('moduleMeta')}</span></div>
      <div class="module-card-progress"><div><span>${p.certificate ? t('earned') : t('activityProgress')}</span><strong>${percent}%</strong></div><progress value="${percent}" max="100" aria-label="${escape(i18n.title(item.id))}: ${percent}%"></progress></div>
      <span class="button card-navigation" id="module-action-${item.id}">${escape(action)}${MoneyGuideCards.arrow()}</span>
    </a>`;
  }
  function certificateCard(item) {
    const certificate = store.get(item.id).certificate;
    return `<a class="certificate-mini ${certificate ? 'is-earned' : 'is-pending'}" href="${certificate ? 'certificate' : 'module'}.html?id=${item.id}" aria-labelledby="certificate-title-${item.id} certificate-action-${item.id}">
      <div class="certificate-card-top">${MoneyGuideCards.icon('certificate')}<span>${t('certificateNumber')} ${String(item.id).padStart(2, '0')}</span></div>
      <div class="certificate-card-copy"><span class="status">${certificate ? t('earned') : t('notEarned')}</span><h3 id="certificate-title-${item.id}">${escape(i18n.title(item.id))}</h3>${certificate ? `<p>${t('completed')} ${date(certificate.date)}</p><p class="certificate-card-score">${t('score')}: <strong>${certificate.score * 10}%</strong></p>` : `<p>${t('earnCertificate')}</p>`}</div>
      <div class="premium-card-bottom"><span class="text-link" id="certificate-action-${item.id}">${certificate ? t('viewCertificate') : t('start')}</span>${MoneyGuideCards.arrow()}</div>
    </a>`;
  }
  function toolCard(title, description, icon, index) {
    return `<button type="button" class="premium-card tool-card" data-tool="${title}" aria-labelledby="tool-title-${index} tool-state-${index}">
      <div class="premium-card-top">${MoneyGuideCards.icon(icon)}<span class="card-index">0${index}</span></div>
      <h3 id="tool-title-${index}">${t(title)}</h3><p>${t(description)}</p>
      <div class="premium-card-bottom"><span id="tool-state-${index}" class="availability">${t('openTool')}</span>${MoneyGuideCards.arrow()}</div>
    </button>`;
  }
  function dashboard() {
    const total = store.totals();
    const next = MoneyGuideModules.find(item => !store.completed(store.get(item.id)));
    const last = MoneyGuideModules.find(item => item.id === store.lastModule && !store.completed(store.get(item.id)));
    const current = last || next || MoneyGuideModules[0];
    const currentProgress = store.get(current.id);
    const selectedGoal = goals.indexOf(profile.goal);
    main.innerHTML = `
      <div class="welcome"><p class="eyebrow">${t('journey')}</p><h1>${escape(t('welcome', { name: (profile.fullName || profile.firstName) }))}</h1><p>${t('welcomeSub')}</p></div>
      <section class="dashboard-hero" aria-labelledby="continue-title">
        <div class="dashboard-hero-copy"><p class="eyebrow">${t('resume')}</p><h2 id="continue-title">${escape(i18n.title(current.id))}</h2><p lang="en">${escape(current.description)}</p><div class="hero-actions">${moduleLink(current.id, currentProgress.started ? t('resume') : t('start'))}<span>${t('module')} ${String(current.id).padStart(2,'0')} / 10</span></div></div>
        <img src="assets/financial-growth.webp" width="1400" height="934" alt="A small plant growing among everyday coins">
      </section>
      <nav class="dashboard-section-nav" aria-label="${t('upNext')}">${[['modules','featureLearn'],['practice','featurePractice'],['moneyguide-plan','featureCoach'],['tools','featureTools'],['progress','featureProgress'],['certificates','featureCertificates']].map(([target,key]) => `<a href="#${target}">${t(key)}</a>`).join('')}</nav>
      <section class="progress-overview" id="progress" aria-labelledby="progress-title">
        <div class="section-heading"><h2 id="progress-title">${t('progress')}</h2><span class="level-pill">${t('level')} ${total.level} · ${t('level' + total.level)}</span></div>
        <div class="stat-grid metric-cards">
          <a class="metric-card" href="#modules"><span>${t('modulesCompleted')}</span><strong>${total.finished}<small> / 10</small></strong>${MoneyGuideCards.arrow()}</a>
          <a class="metric-card" href="#certificates"><span>${t('certificatesEarned')}</span><strong>${total.certificates}<small> / 10</small></strong>${MoneyGuideCards.arrow()}</a>
          <div class="metric-card"><span>${t('xp')}</span><strong>${total.xp}</strong>${MoneyGuideCards.icon('progress')}</div>
          <div class="metric-card level-metric"><span>${t('currentLevel')}</span><strong>${t('level' + total.level)}</strong><small>${t('level')} ${total.level} / 5</small></div>
        </div>
        <div class="overall-progress-label"><span>${t('overall')}</span><strong>${total.percent}%</strong></div><progress value="${total.percent}" max="100" aria-label="${t('overall')}"></progress>
      </section>
      <section class="path-panel" aria-labelledby="path-title"><div><h2 id="path-title">${t('path')}</h2><p>${t('pathNote')}</p></div><ol class="path-steps">${MoneyGuideModules.map(item => `<li><a class="${store.completed(store.get(item.id)) ? 'done' : ''}" href="module.html?id=${item.id}" aria-label="${escape(i18n.title(item.id))}" title="${escape(i18n.title(item.id))}">${item.id}</a></li>`).join('')}</ol></section>
      <div class="dashboard-columns expanded-columns">
        <section id="modules" aria-labelledby="modules-title"><div class="module-heading"><div><p class="eyebrow">${t('journey')}</p><h2 id="modules-title">${t('modules')}</h2></div><span class="muted">10 ${t('modules').toLowerCase()}</span></div>
        <div class="module-grid">${MoneyGuideModules.map(item => moduleCard(item, next ? next.id : null)).join('')}</div></section>
        <aside class="learning-aside"><section class="next-card"><p class="eyebrow">${t('next')}</p><h2>${next ? escape(i18n.title(next.id)) : t('completed')}</h2><p>${next ? t('pathNote') : t('allDone')}</p>${moduleLink(next ? next.id : 1, next ? t('start') : t('review'))}</section><section class="goal-card"><span class="eyebrow">${t('goal')}</span><span class="goal-symbol" aria-hidden="true">⚑</span><h2>${escape(t('goal' + selectedGoal))}</h2><div class="goal-meta"><span>${t('currency')}</span><strong>${escape(profile.currency)}</strong></div></section><div class="tip-card"><p>${t('lessonLanguage')}</p></div></aside>
      </div>
      <section id="practice" class="dashboard-section practice-section" aria-labelledby="practice-title"><div class="section-heading"><div><p class="eyebrow">${t('featurePractice')}</p><h2 id="practice-title">${t('practiceIntro')}</h2></div></div>
        <div class="practice-grid"><article class="practice-card"><div class="premium-card-top">${MoneyGuideCards.icon('practice')}<span class="card-index">01</span></div><h3>${t('flashcards')} &amp; ${t('assessment')}</h3><p>${t('flashcardNote')}</p><label for="flash-module">${t('chooseModule')}</label><select id="flash-module">${MoneyGuideModules.map(item => `<option value="${item.id}">${item.id}. ${escape(i18n.title(item.id))}</option>`).join('')}</select><div class="practice-links"><a class="text-link" id="open-flashcards" href="module.html?id=1#flashcards">${t('openCards')}${MoneyGuideCards.arrow()}</a><a class="text-link" id="open-assessment" href="module.html?id=1#assessment">${t('openAssessment')}${MoneyGuideCards.arrow()}</a></div></article>
        <article class="practice-card planned-card"><div class="premium-card-top">${MoneyGuideCards.icon('coach')}<span class="card-index">02</span></div><h3>${t('games')}</h3><p>${t('gamesNote')}</p><span class="availability">${t('soon')}</span></article></div>
      </section>
      <section id="certificates" class="dashboard-section" aria-labelledby="certificates-title"><div class="section-heading"><div><p class="eyebrow">${t('featureEyebrow')}</p><h2 id="certificates-title">${t('certificates')}</h2></div><span class="muted">${total.certificates} / 10</span></div><div class="certificate-grid">${MoneyGuideModules.map(certificateCard).join('')}</div></section>
      <section id="tools" class="dashboard-section tools-section" aria-labelledby="tools-title"><div class="section-heading"><div><p class="eyebrow">${t('featureTools')}</p><h2 id="tools-title">${t('tools')}</h2></div><p>${t('toolsIntro')}</p></div><div class="tool-grid">${[['savingsTool','savingsToolText','savings'],['budgetTool','budgetToolText','budget'],['growthTool','growthToolText','growth'],['loanTool','loanToolText','loan'],['currencyTool','currencyToolText','currency']].map(([title,description,icon],index) => toolCard(title,description,icon,index+1)).join('')}</div></section>`;
    document.querySelector('#flash-module').addEventListener('change', event => { document.querySelector('#open-flashcards').href = 'module.html?id=' + event.target.value + '#flashcards'; document.querySelector('#open-assessment').href = 'module.html?id=' + event.target.value + '#assessment'; });
  }
  function date(value) { return new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value)); }
  function lessonPage() {
    if (!module) { main.innerHTML = `<h1>${t('invalidModule')}</h1><a class="button" href="dashboard.html">${t('back')}</a>`; return; }
    const p = store.get(id);
    main.innerHTML = `
      <a class="back-link" href="dashboard.html">← ${t('back')}</a>
      <header class="module-intro"><p class="eyebrow">${t('module')} ${String(id).padStart(2,'0')} / 10 <span class="status">${status(p)}</span></p><h1>${escape(i18n.title(id))}</h1><p lang="en">${escape(module.introduction)}</p><div class="module-progress-label"><span>${t('contentProgress')}</span><strong id="activity-count">${activityCount(p)} / 17</strong></div><progress id="activity-progress" value="${activityCount(p)}" max="17" aria-label="${t('contentProgress')}"></progress></header>
      <div class="learning-notice"><p>${t('lessonLanguage')}</p><p>${t('exampleNote')}</p></div>
      <nav class="lesson-navigation" aria-label="Module sections"><a href="#lessons">${t('lessons')}</a><a href="#flashcards">${t('flashcards')}</a><a href="#summary">${t('summary')}</a><a href="#assessment">${t('assessment')}</a></nav>
      <section class="objectives panel"><h2>${t('objectives')}</h2><ul lang="en">${module.objectives.map(text => `<li>${escape(text)}</li>`).join('')}</ul></section>
      <div id="lessons">${module.lessons.map((lesson, index) => `<article class="lesson panel" id="lesson-${index}"><p class="eyebrow">${t('lessons')} ${index + 1} / 3</p><h2 lang="en">${escape(lesson.title)}</h2><div lang="en">${lesson.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</div><div class="real-example"><h3>${t('example')}</h3><p lang="en">${escape(lesson.example)}</p></div><div class="takeaway"><strong>${t('takeaway')}</strong><p lang="en">${escape(lesson.takeaway)}</p></div>${button(p.lessons.includes(index) ? t('lessonDone') + ' ✓' : t('markLesson') + ' · +10 XP', 'lesson', `data-index="${index}" ${p.lessons.includes(index) ? 'disabled' : ''}`)}<form class="knowledge-check" data-check="${index}"><fieldset><legend>${t('check')} ${index + 1}</legend><p lang="en">${escape(lesson.check.prompt)}</p>${lesson.check.options.map((option, answer) => `<label class="answer-option" lang="en"><input type="radio" name="check-${index}" value="${answer}" ${p.checks.includes(index) && answer === lesson.check.answer ? 'checked' : ''}>${escape(option)}</label>`).join('')}</fieldset><button class="button secondary" type="submit">${t('checkAnswer')}</button><div class="check-feedback" role="status">${p.checks.includes(index) ? `<strong>${t('correct')} ✓</strong><p lang="en">${escape(lesson.check.explanation)}</p>` : ''}</div></form></article>`).join('')}</div>
      <section class="panel" id="flashcards"><p class="eyebrow">${t('vocabulary')}</p><h2>${t('flashcards')}</h2><p>${t('cardsInstruction')}</p><div id="flashcard-area"></div></section>
      <section class="panel" id="summary"><h2>${t('summary')}</h2><p lang="en">${escape(module.summary)}</p>${button(p.summary ? t('summaryDone') + ' ✓' : t('finishContent'), 'summary', p.summary ? 'disabled' : '')}<details class="source-links"><summary>${t('sources')}</summary><ul>${module.sources.map(([label,url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer" lang="en">${escape(label)} ↗</a></li>`).join('')}</ul></details></section>
      <section class="panel assessment-panel" id="assessment"><p class="eyebrow">${t('assessmentNote')}</p><h2>${t('assessment')}</h2><p>${t('requirements')}</p><div id="assessment-area"></div></section>
      <div id="earned-banner" aria-live="polite"></div>`;
    main.classList.add('lesson-main');
    main.querySelectorAll('[data-check]').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const index = Number(form.dataset.check);
      const selected = form.querySelector('input:checked');
      const feedback = form.querySelector('.check-feedback');
      if (!selected) { feedback.textContent = t('selectAnswer'); return; }
      const correct = Number(selected.value) === module.lessons[index].check.answer;
      if (correct && !save(() => store.check(id, index, (profile.fullName || profile.firstName)))) return;
      checkFeedback[index] = { answer: Number(selected.value), correct };
      feedback.innerHTML = `<strong>${correct ? t('correct') + ' ✓' : t('tryAgain')}</strong><p lang="en">${escape(module.lessons[index].check.explanation)}</p>`;
      updateProgress();
    }));
    drawCard(); drawAssessment(); updateProgress();
  }
  function updateProgress() {
    const p = store.get(id);
    if (!document.querySelector('#activity-count')) return;
    document.querySelector('#activity-count').textContent = activityCount(p) + ' / 17';
    document.querySelector('#activity-progress').value = activityCount(p);
    document.querySelector('.module-intro .status').textContent = status(p);
    document.querySelector('#earned-banner').innerHTML = p.certificate ? `<div class="earned-banner"><strong>${t('earned')} ✓</strong>${certLink(id)}</div>` : '';
    profileHeader();
    if (p.lastResult) drawAssessment();
  }
  function drawCard() {
    const p = store.get(id);
    const card = module.vocabulary[cardIndex];
    document.querySelector('#flashcard-area').innerHTML = `<p class="card-counter" aria-live="polite">${t('cardCount', { current: cardIndex + 1, total: 10 })}</p><button class="flashcard" data-action="flip" aria-pressed="${cardFlipped}" aria-label="${t('flip')}: ${escape(card[0])}"><span class="eyebrow">${cardFlipped ? t('vocabulary') : t('flip')}</span><span lang="en">${escape(card[cardFlipped ? 1 : 0])}</span><small>${p.cards.includes(cardIndex) ? t('reviewed') + ' ✓' : t('flip') + ' ↻'}</small></button><div class="card-controls">${button('← ' + t('previous'), 'previous-card', cardIndex === 0 ? 'disabled' : '')}${button(t('nextButton') + ' →', 'next-card', cardIndex === 9 ? 'disabled' : '')}</div><p class="microcopy" aria-live="polite">${t('cardsReviewed', { count: p.cards.length })}</p>`;
  }
  function drawAssessment() {
    const p = store.get(id);
    const area = document.querySelector('#assessment-area');
    if (p.lastResult) {
      const result = p.lastResult;
      area.innerHTML = `<div class="test-result ${result.score >= 8 ? 'pass' : ''}" role="status"><strong>${result.score >= 8 ? t('passed') : t('notPassed')}</strong><div class="result-score">${result.score} / 10 <small>(${result.score * 10}%)</small></div><p>${result.score >= 8 ? p.certificate ? t('earned') : t('remaining') : t('encouragement')}</p><p>${t('best')}: ${p.bestScore} / 10</p>${p.certificate ? certLink(id) : ''}</div>${button(t('retake'), 'retake')}<div class="answer-review">${module.assessment.map((question, index) => `<details><summary><span aria-hidden="true">${result.answers[index] === question.answer ? '✓' : '↻'}</span> ${t('questionCount', { current: index + 1 })}</summary><p lang="en">${escape(question.prompt)}</p><p>${t('yourAnswer')}: <span lang="en">${escape(question.options[result.answers[index]])}</span></p><p>${t('answer')}: <span lang="en">${escape(question.options[question.answer])}</span></p><p lang="en">${escape(question.explanation)}</p></details>`).join('')}</div>`;
      return;
    }
    if (!testOpen) { area.innerHTML = button(p.answers.some(value => Number.isInteger(value)) ? t('continueTest') : t('startTest'), 'start-test'); return; }
    const question = module.assessment[questionIndex];
    area.innerHTML = `<form id="assessment-form"><p class="eyebrow" id="question-label" tabindex="-1">${t('questionCount', { current: questionIndex + 1 })}</p><fieldset><legend lang="en">${escape(question.prompt)}</legend>${question.options.map((option, index) => `<label class="answer-option" lang="en"><input type="radio" name="assessment-answer" value="${index}" ${p.answers[questionIndex] === index ? 'checked' : ''}>${escape(option)}</label>`).join('')}</fieldset><div class="question-buttons">${button('← ' + t('previous'), 'previous-question', `type="button" ${questionIndex === 0 ? 'disabled' : ''}`)}${questionIndex < 9 ? button(t('nextButton') + ' →', 'next-question', 'type="button"') : `<button class="button" type="submit">${t('submit')}</button>`}</div><p id="test-error" class="error" role="alert"></p></form>`;
    area.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
      if (!save(() => store.answer(id, questionIndex, Number(input.value), (profile.fullName || profile.firstName)))) drawAssessment();
    }));
    area.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const answers = store.get(id).answers;
      const missing = Array.from({length:10},(_, i) => i).find(index => !Number.isInteger(answers[index]));
      if (missing !== undefined) {
        questionIndex = missing; drawAssessment();
        document.querySelector('#test-error').textContent = t('unanswered');
        return;
      }
      if (save(() => store.submit(id, (profile.fullName || profile.firstName)))) { drawAssessment(); updateProgress(); area.scrollIntoView({ block: 'start' }); }
    });
  }
  function certificatePage() {
    const certificate = module ? store.get(id).certificate : null;
    if (!certificate) { main.innerHTML = `<a class="back-link" href="dashboard.html">← ${t('back')}</a><div class="panel"><h1>${t('certificates')}</h1><p>${t('certificateMissing')}</p></div>`; return; }
    main.classList.add('certificate-main');
    main.innerHTML = `<div class="certificate-actions"><a href="dashboard.html">← ${t('back')}</a><div>${button(t('print'), 'print')}${button(t('savePdf'), 'pdf')}</div></div><p class="pdf-help">${t('pdfHelp')}</p><article class="certificate-paper"><div class="certificate-brand">MoneyGuide<span>.</span></div><div class="certificate-rule"></div><p class="eyebrow">${t('issuedBy')}</p><h1>${t('certificateTitle')}</h1><p>${t('certifies')}</p><h2 class="learner-name">${escape(certificate.name)}</h2><p>${t('hasCompleted')}</p><h3>${escape(i18n.title(id))}</h3><div class="certificate-seal" aria-hidden="true">✦<small>MG</small></div><dl class="certificate-details"><div><dt>${t('completionDate')}</dt><dd>${date(certificate.date)}</dd></div><div><dt>${t('score')}</dt><dd>${certificate.score} / 10 · ${certificate.score * 10}%</dd></div></dl><p class="certificate-id">${t('certificateId')}: ${escape(certificate.id)}</p><p class="certificate-footnote">${t('certificateNote')}</p></article>`;
  }
  function render() {
    profileHeader();
    if (page === 'dashboard') dashboard();
    if (page === 'module') lessonPage();
    if (page === 'certificate') certificatePage();
    i18n.apply();
    document.title = (page === 'dashboard' ? t('dashboard') : page === 'certificate' ? t('certificates') : module ? i18n.title(id) : t('modules')) + ' — MoneyGuide';
  }
  main.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const action = control.dataset.action;
    if (action === 'print' || action === 'pdf') { window.print(); return; }
    if (action === 'lesson') {
      if (save(() => store.lesson(id, Number(control.dataset.index), (profile.fullName || profile.firstName)))) { control.textContent = t('lessonDone') + ' ✓'; control.disabled = true; updateProgress(); }
    }
    if (action === 'summary') {
      if (save(() => store.summary(id, (profile.fullName || profile.firstName)))) { control.textContent = t('summaryDone') + ' ✓'; control.disabled = true; updateProgress(); }
    }
    if (action === 'flip') {
      if (!cardFlipped && !save(() => store.card(id, cardIndex, (profile.fullName || profile.firstName)))) return;
      cardFlipped = !cardFlipped; drawCard(); updateProgress();
      document.querySelector('.flashcard').focus({ preventScroll: true });
    }
    if (action === 'previous-card' || action === 'next-card') {
      cardIndex = Math.max(0, Math.min(9, cardIndex + (action === 'next-card' ? 1 : -1)));
      cardFlipped = false; drawCard(); document.querySelector('.flashcard').focus({ preventScroll: true });
    }
    if (action === 'start-test') { testOpen = true; drawAssessment(); document.querySelector('#question-label').focus({ preventScroll: true }); }
    if (action === 'retake' && save(() => store.retake(id, (profile.fullName || profile.firstName)))) { testOpen = true; questionIndex = 0; drawAssessment(); document.querySelector('#question-label').focus({ preventScroll: true }); }
    if (action === 'previous-question' || action === 'next-question') {
      if (action === 'next-question' && !Number.isInteger(store.get(id).answers[questionIndex])) { document.querySelector('#test-error').textContent = t('selectAnswer'); return; }
      const index = Math.max(0, Math.min(9, questionIndex + (action === 'next-question' ? 1 : -1)));
      if (save(() => store.position(id, index, (profile.fullName || profile.firstName)))) { questionIndex = index; drawAssessment(); document.querySelector('#question-label').focus({ preventScroll: true }); }
    }
  });
  if (page === 'module' && module) save(() => store.start(id, (profile.fullName || profile.firstName)));
  render();
  if (store.fault) reportError(new Error('damagedStorage'));
  document.addEventListener('languagechange', () => {
    render();
    // Preserve selected practice answers and explanations when changing language.
    Object.entries(checkFeedback).forEach(([index, result]) => {
      const form = main.querySelector(`[data-check="${index}"]`);
      if (!form) return;
      form.querySelector(`input[value="${result.answer}"]`).checked = true;
      form.querySelector('.check-feedback').innerHTML = `<strong>${t(result.correct ? 'correct' : 'tryAgain')}</strong><p lang="en">${escape(module.lessons[index].check.explanation)}</p>`;
    });
    if (store.fault) reportError(new Error('damagedStorage'));
  });
  document.addEventListener('currencychange', event => {
    profile.currency = event.detail.currency;
    const currencyLabel = document.querySelector('.goal-meta strong');
    if (currencyLabel) currencyLabel.textContent = profile.currency;
  });
  window.addEventListener('storage', event => {
    if (event.key === 'moneyguide.learning.v1') { store.load(); render(); if (store.fault) reportError(new Error('damagedStorage')); }
  });
  if (window.location.hash) requestAnimationFrame(() => { document.getElementById(window.location.hash.slice(1))?.scrollIntoView(); });
})();
