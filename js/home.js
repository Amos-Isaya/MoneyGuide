// Homepage previews read the same saved progress as the learning dashboard.
(() => {
  const t = MoneyGuideI18n.t;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderPreviews() {
    const profile = getProfile();
    const progress = MoneyGuideProgress;
    const totals = progress.totals();
    const next = MoneyGuideModules.find(module => !progress.completed(progress.get(module.id))) || MoneyGuideModules[0];
    const title = MoneyGuideI18n.title(next.id);
    document.querySelector('#home-learning-preview').innerHTML = `<a class="home-recommended" href="module.html?id=${next.id}" data-requires-profile><div><p class="eyebrow">${t('featuredLearning')}</p><h3>${escape(title)}</h3><p lang="en">${escape(next.description)}</p><span class="recommend-meta">${t('moduleMeta')}</span></div><span class="recommend-number" aria-hidden="true">${String(next.id).padStart(2,'0')}</span><span class="text-link">${t('start')}${MoneyGuideCards.arrow()}</span></a><div class="home-progress"><p class="eyebrow">${t('progress')}</p><strong class="home-progress-number">${totals.percent}<small>%</small></strong><progress value="${totals.percent}" max="100" aria-label="${t('overall')}"></progress><p>${profile ? escape(t('welcome',{name:profile.firstName})) : t('guestProgress')}</p><div><span>${totals.xp} XP · ${t('level')} ${totals.level}</span><a href="dashboard.html#progress" data-requires-profile>${t('viewProgress')} ↗</a></div></div>`;
    const earned = MoneyGuideModules.find(module => progress.get(module.id).certificate);
    const certificate = earned ? progress.get(earned.id).certificate : null;
    const moduleId = earned ? earned.id : next.id;
    document.querySelector('#home-certificate-preview').innerHTML = `<a class="home-certificate" href="${certificate ? 'certificate' : 'module'}.html?id=${moduleId}" data-requires-profile><div class="certificate-preview-top"><span>MoneyGuide</span>${MoneyGuideCards.icon('certificate')}</div><p class="eyebrow">${certificate ? t('earned') : t('nextMilestone')}</p><h3>${escape(MoneyGuideI18n.title(moduleId))}</h3><p>${certificate ? escape(certificate.name) + ' · ' + certificate.score * 10 + '%' : t('earnCertificate')}</p><span class="certificate-preview-caption">${certificate ? t('completed') + ' · ' + new Intl.DateTimeFormat(MoneyGuideI18n.language, {dateStyle:'medium'}).format(new Date(certificate.date)) : t('certificatePreview')}</span><span class="text-link">${certificate ? t('viewCertificate') : t('start')}${MoneyGuideCards.arrow()}</span></a>`;
  }
  renderPreviews();
  document.addEventListener('languagechange', renderPreviews);
  window.addEventListener('storage', event => { if(event.key === 'moneyguide.learning.v1') { MoneyGuideProgress.load(); renderPreviews(); } });
  // Content is visible by default. Motion is added only when supported and requested.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(section => { section.classList.add('reveal-ready'); observer.observe(section); });
  }
})();
