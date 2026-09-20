// Shared navigation, preferences, and footer. Learning rules stay in progress.js.
const MoneyGuideShell = (() => {
  const t = MoneyGuideI18n.t;
  const page = document.body.dataset.page;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brand = '<a class="brand" href="index.html" aria-label="MoneyGuide home"><span class="brand-mark" aria-hidden="true">m<span>↗</span></span>MoneyGuide<span class="brand-dot">.</span></a>';
  const navItems = [['home','navHome','index.html'],['about','navAbout','index.html#about'],['modules','featureLearn','dashboard.html#modules'],['practice','featurePractice','dashboard.html#practice'],['games','learnGaming','games.html'],['tools','navTools','dashboard.html#tools'],['progress','featureProgress','dashboard.html#progress'],['certificates','featureCertificates','dashboard.html#certificates']];
  function link(url, label, extra = '') { return `<a href="${url}" ${url.startsWith('dashboard') || url.startsWith('module') ? 'data-requires-profile' : ''} ${extra}>${label}</a>`; }
  const header = document.querySelector('#site-header');
  header.className = 'site-header';
  header.innerHTML = `<div class="header-inner">${brand}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation-panel"><span class="menu-lines" aria-hidden="true"></span><span data-i18n="menu">${t('menu')}</span></button><div class="navigation-panel" id="navigation-panel"><nav class="top-nav" aria-label="Main navigation">${navItems.map(([id,key,url])=>link(url,`<span data-i18n="${key}">${t(key)}</span>`,`data-nav="${id}"`)).join('')}</nav><div class="header-preferences"><label class="header-select"><span data-i18n="language">${t('language')}</span><select data-language><option value="en">EN</option><option value="es">ES</option><option value="fr">FR</option></select></label><label class="header-select"><span data-i18n="currencyLabel">${t('currencyLabel')}</span><select id="header-currency">${currencies.map(currency=>`<option value="${currency}">${currency}</option>`).join('')}</select></label><button type="button" class="theme-toggle" id="theme-toggle"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg><span class="sr-only" data-i18n="theme">${t('theme')}</span></button><button class="profile-control" type="button" id="profile-control"><span id="avatar" class="avatar" aria-hidden="true">M</span><span id="profile-name">${t('profile')}</span><span id="profile-level" class="sr-only"></span></button></div></div></div>`;
  const footer = document.querySelector('#site-footer');
  footer.className = 'site-footer';
  function footerGroup(title, links) { return `<div class="footer-column"><h2 data-i18n="${title}">${t(title)}</h2>${links.join('')}</div>`; }
  function resource(key) { return `<button type="button" data-info="${key}" data-i18n="${key}">${t(key)}</button>`; }
  footer.innerHTML = `<div class="wrap footer-brand-row">${brand}<p data-i18n="footerTagline">${t('footerTagline')}</p></div><div class="wrap footer-directory">${footerGroup('footerPlatform',navItems.filter(([id])=>['home','about','modules','practice','games','progress'].includes(id)).map(([,key,url])=>link(url,`<span data-i18n="${key}">${t(key)}</span>`)))}${footerGroup('footerLearning',[1,2,3,5,7].map(id=>link('module.html?id='+id,escape(MoneyGuideI18n.title(id)),`data-module-title="${id}"`)))}${footerGroup('featureTools',[['savingsTool','savings'],['budgetTool','budget'],['loanTool','loan'],['currencyTool','currency']].map(([key])=>`<button type="button" data-tool="${key}" data-i18n="${key}">${t(key)}</button>`))}${footerGroup('footerResources',[link('dashboard.html#certificates',`<span data-i18n="certificates">${t('certificates')}</span>`),link('module.html?id=1#flashcards',`<span data-i18n="glossary">${t('glossary')}</span>`),resource('help'),resource('accessibility')])}<div class="footer-column"><h2 data-i18n="language">${t('language')}</h2><button type="button" data-set-language="en" lang="en">English</button><button type="button" data-set-language="es" lang="es">Español</button><button type="button" data-set-language="fr" lang="fr">Français</button><div class="footer-contact"><h3 data-i18n="contact">${t('contact')}</h3><p data-i18n="contactSoon">${t('contactSoon')}</p></div></div></div><div class="footer-legal"><div class="wrap"><p>© ${new Date().getFullYear()} MoneyGuide. <span data-i18n="copyright">${t('copyright')}</span></p><p data-i18n="disclaimer">${t('disclaimer')}</p><nav aria-label="Platform information">${resource('privacy')}${resource('terms')}${resource('accessibility')}</nav></div></div>`;
  const menu = document.querySelector('.menu-toggle');
  const panel = document.querySelector('#navigation-panel');
  const smallScreen = matchMedia('(max-width: 1199px)');
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    menu.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    panel.inert = smallScreen.matches && !open;
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(!menuOpen));
  smallScreen.addEventListener('change', () => setMenu(false));
  setMenu(false);
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && menuOpen) setMenu(false, true); });
  document.addEventListener('click', event => { if(menuOpen && !header.contains(event.target)) setMenu(false); });
  header.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false, smallScreen.matches)));
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  function activeNavigation() {
    let active = page === 'home' ? location.hash === '#about' ? 'about' : 'home' : page === 'certificate' ? 'certificates' : 'modules';
    if (page === 'games') active = 'games';
    if (page === 'account') active = null;
    if (page === 'dashboard') active = ['modules','practice','tools','progress','certificates'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'modules';
    if (page === 'module' && ['#assessment','#flashcards'].includes(location.hash)) active = 'practice';
    header.querySelectorAll('[data-nav]').forEach(a => { if(a.dataset.nav === active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('hashchange', activeNavigation); activeNavigation();
  function currencyPreference() {
    const profile = getProfile();
    if(profile) return profile.currency;
    try { const saved=localStorage.getItem('moneyguide.currency'); return currencies.includes(saved) ? saved : 'USD'; } catch(error) { return 'USD'; }
  }
  function refreshProfile() {
    const profile = getProfile();
    document.querySelector('#profile-name').textContent = MoneyGuideAuth.current() ? MoneyGuideAuth.current().fullName.split(/\s+/)[0] : t('authLogin');
    document.querySelector('#avatar').textContent = profile ? Array.from(profile.firstName)[0].toUpperCase() : 'M';
    document.querySelector('#header-currency').value = currencyPreference();
    document.querySelector('#profile-control').setAttribute('aria-label',t('profile') + (profile ? ': ' + profile.firstName : ''));
  }
  document.querySelector('#header-currency').addEventListener('change', event => {
    const previous = currencyPreference();
    try {
      const profile = getProfile();
      const currency = event.target.value;
      if (profile) { profile.currency = currency; localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
      else localStorage.setItem('moneyguide.currency', currency);
      const input = document.querySelector('#currency'); if(input) input.value = currency;
      document.dispatchEvent(new CustomEvent('currencychange', {detail:{currency}}));
    } catch(error) { event.target.value=previous; window.alert(t('storageError')); }
  });
  function updateThemeButton() {
    const theme = document.documentElement.dataset.theme;
    const control = document.querySelector('#theme-toggle');
    control.setAttribute('aria-label',t(theme === 'dark' ? 'lightTheme' : 'darkTheme'));
    control.setAttribute('title',t(theme === 'dark' ? 'lightTheme' : 'darkTheme'));
    control.setAttribute('aria-pressed',String(theme === 'light'));
  }
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('moneyguide.theme',theme); document.documentElement.dataset.theme=theme; updateThemeButton(); }
    catch(error) { window.alert(t('storageError')); }
  });
  function infoDialog(title, body) {
    let dialog = document.querySelector('#platform-info');
    if(!dialog) {
      dialog = document.createElement('dialog'); dialog.id='platform-info'; dialog.setAttribute('aria-labelledby','platform-info-title');
      dialog.innerHTML='<button class="close-button" type="button">×</button><h2 id="platform-info-title"></h2><div id="platform-info-body"></div>';
      document.body.append(dialog); dialog.querySelector('button').addEventListener('click',()=>dialog.close());
    }
    dialog.querySelector('button').setAttribute('aria-label',t('close'));
    dialog.querySelector('h2').textContent=title;
    dialog.querySelector('#platform-info-body').innerHTML=body;
    dialog.showModal();
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-logout]')) {
      try { MoneyGuideAuth.logout(); } catch(error) { window.alert(t('authStorageError')); location.replace('account.html?mode=login'); }
      return;
    }
    const info=event.target.closest('[data-info]');
    if(info) infoDialog(t(info.dataset.info),`<p>${escape(t(info.dataset.info+'Text'))}</p>`);
    const language=event.target.closest('[data-set-language]');
    if(language) { try { MoneyGuideI18n.setLanguage(language.dataset.setLanguage); } catch(error) { window.alert(t('storageError')); } }
  });
  document.querySelector('#profile-control').addEventListener('click', () => {
    setMenu(false, smallScreen.matches);
    if (!MoneyGuideAuth.current()) { location.href=MoneyGuideAuth.entry('dashboard.html','login'); return; }
    const profile=getProfile();
    if(!profile) { location.href='index.html?onboard=1'; return; }
    infoDialog(t('profile'),`<p>${t('authLocalProfile')}</p><dl class="profile-details"><dt>${t('fullName')}</dt><dd>${escape(profile.fullName || profile.firstName)}</dd><dt>${t('currency')}</dt><dd>${escape(profile.currency)}</dd><dt>${t('primaryGoal')}</dt><dd>${escape(t('goal'+goals.indexOf(profile.goal)))}</dd></dl><a class="button" href="index.html?profile=edit">${t('editProfile')}</a><button class="button secondary logout-button" type="button" data-logout>${t('authLogout')}</button>`);
  });
  document.addEventListener('languagechange', () => {
    refreshProfile(); updateThemeButton();
    footer.querySelectorAll('[data-module-title]').forEach(a=>{a.textContent=MoneyGuideI18n.title(Number(a.dataset.moduleTitle));});
  });
  refreshProfile(); updateThemeButton();
  MoneyGuideI18n.apply();
  return {refreshProfile, setMenu};
})();
