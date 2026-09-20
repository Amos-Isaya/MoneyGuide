// Homepage summaries reuse the learning store; this file never awards XP or changes progress.
(() => {
  const t = MoneyGuideI18n.t;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderPreviews() {
    const profile=getProfile();
    const progress=MoneyGuideProgress;
    const totals=profile?progress.totals():{percent:0,xp:0,level:1,finished:0,certificates:0};
    const next=MoneyGuideModules.find(module=>!profile || !progress.completed(progress.get(module.id))) || MoneyGuideModules[0];
    document.querySelector('#home-learning-preview').innerHTML=`<a class="home-recommended" data-reveal="card" href="module.html?id=${next.id}" data-requires-profile><div><p class="eyebrow">${t('featuredLearning')}</p><h3>${escape(MoneyGuideI18n.title(next.id))}</h3><p lang="en">${escape(next.description)}</p><span class="recommend-meta">${t('moduleMeta')}</span></div><span class="recommend-number" aria-hidden="true">${String(next.id).padStart(2,'0')}</span><span class="text-link">${t('start')}${MoneyGuideCards.arrow()}</span></a><div class="home-path-note" data-reveal="text"><p class="eyebrow">${t('path')}</p><p>${t('pathNote')}</p><a class="text-link" href="dashboard.html#modules" data-requires-profile>${t('openModules')} ↗</a></div>`;
    const metrics=[['modulesCompleted',totals.finished+' / 10','modules'],['certificatesEarned',totals.certificates+' / 10','certificates'],['xp',totals.xp+' XP','progress'],['currentLevel',t('level')+' '+totals.level,'progress']];
    document.querySelector('#home-progress-detail').innerHTML=`<div class="home-progress"><div class="story-metrics">${metrics.map(([key,value,target])=>`<a class="metric-card" data-reveal="card" href="dashboard.html#${target}" data-requires-profile><span>${t(key)}</span><strong>${value}</strong>${MoneyGuideCards.arrow()}</a>`).join('')}</div><div class="story-progress-copy" data-reveal="text"><p>${profile?escape(t('welcome',{name:profile.fullName || profile.firstName})):t('guestProgress')}</p><strong>${t('overall')} · ${totals.percent}%</strong></div><div class="story-meter" role="progressbar" aria-label="${t('overall')}" aria-valuenow="${totals.percent}" aria-valuemin="0" aria-valuemax="100"><span class="story-meter-fill" data-reveal="progress" style="width:${totals.percent}%"></span></div><a class="text-link" data-reveal="action" href="dashboard.html#progress" data-requires-profile>${t('viewProgress')} ↗</a></div>`;
    const earned=profile && MoneyGuideModules.find(module=>progress.get(module.id).certificate);
    const certificate=earned?progress.get(earned.id).certificate:null;
    const moduleId=earned?earned.id:next.id;
    document.querySelector('#home-certificate-preview').innerHTML=`<a class="home-certificate" href="${certificate?'certificate':'module'}.html?id=${moduleId}" data-requires-profile><div class="certificate-preview-top"><span>MoneyGuide</span>${MoneyGuideCards.icon('certificate')}</div><p class="eyebrow">${certificate?t('earned'):t('nextMilestone')}</p><h3>${escape(MoneyGuideI18n.title(moduleId))}</h3><p>${certificate?escape(certificate.name)+' · '+certificate.score*10+'%':t('earnCertificate')}</p><span class="certificate-preview-caption">${certificate?t('completed')+' · '+new Intl.DateTimeFormat(MoneyGuideI18n.language,{dateStyle:'medium'}).format(new Date(certificate.date)):t('certificatePreview')}</span><span class="text-link">${certificate?t('viewCertificate'):t('start')}${MoneyGuideCards.arrow()}</span></a>${certificate && totals.finished<10?`<a class="available-certificate" data-requires-profile href="module.html?id=${next.id}"><span>${t('nextMilestone')}</span><strong>${escape(MoneyGuideI18n.title(next.id))}</strong><span>${t('earnCertificate')}</span></a>`:''}<a class="text-link all-certificates" data-requires-profile href="dashboard.html#certificates">${t('sceneAllCertificates')} ↗</a>`;
    document.dispatchEvent(new Event('homecontentchange'));
  }
  renderPreviews();
  document.addEventListener('languagechange',renderPreviews);
  window.addEventListener('storage',event=>{
    if(event.key==='moneyguide.learning.v1') {MoneyGuideProgress.load();renderPreviews();}
  });
})();
