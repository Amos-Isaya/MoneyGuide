(() => {
  const t=MoneyGuideI18n.t;
  const params=new URLSearchParams(location.search);
  let registering=params.get('mode')!=='login';
  let firstVisit=false;
  try {
    if (!MoneyGuideAuth.hasAccount()) { registering=true; firstVisit=true; }
  } catch(error) { /* Let submission display the existing storage error. */ }
  const next=MoneyGuideAuth.destination(params.get('next'));
  const form=document.querySelector('#account-form');
  const name=document.querySelector('#full-name');
  const password=document.querySelector('#account-password');
  const confirm=document.querySelector('#confirm-password');
  let busy=false;
  const eye='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg>';
  function paint() {
    document.querySelector('#account-title').textContent=t(registering?'authCreate':'authLogin');
    document.querySelector('#account-submit').textContent=t(busy?'authWorking':registering?'authCreate':'authLogin');
    document.querySelector('#confirm-group').hidden=!registering;
    confirm.disabled=!registering;
    password.autocomplete=registering?'new-password':'current-password';
    name.autocomplete=registering?'name':'username';
    document.querySelector('#password-help').hidden=!registering;
    const switcher=document.querySelector('#account-switch');
    switcher.textContent=t(registering?'authHaveAccount':'authNeedAccount');
    switcher.href=MoneyGuideAuth.entry(next,registering?'login':'register');
    switcher.parentElement.hidden=firstVisit;
    document.querySelectorAll('[data-password-toggle]').forEach(button=>{
      if(!button.innerHTML) button.innerHTML=eye;
      const shown=document.getElementById(button.dataset.passwordToggle).type==='text';
      button.setAttribute('aria-label',t(shown?'authHide':'authShow'));
      button.setAttribute('aria-pressed',String(shown));
    });
  }
  paint();
  if(firstVisit) {
    const hint=document.createElement('p');
    hint.className='account-origin-hint'; hint.dataset.i18n='authFirstVisit'; hint.textContent=t('authFirstVisit');
    document.querySelector('.account-notice').after(hint);
  }
  document.addEventListener('languagechange',()=>{paint();clearErrors();});
  document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
    const input=document.getElementById(button.dataset.passwordToggle);
    input.type=input.type==='password'?'text':'password'; paint(); input.focus();
  }));
  function clearErrors() {
    ['name-error','password-error','confirm-error','account-error'].forEach(id=>document.getElementById(id).textContent='');
    [name,password,confirm].forEach(input=>input.removeAttribute('aria-invalid'));
  }
  form.addEventListener('input',clearErrors);
  function error(input,id,key) {
    input.setAttribute('aria-invalid','true'); document.getElementById(id).textContent=t(key);
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault(); if(busy)return; clearErrors();
    if(!MoneyGuideAuth.validName(name.value)) error(name,'name-error','authNameError');
    if(registering ? !MoneyGuideAuth.validPassword(password.value) : !password.value) error(password,'password-error',registering?'authPasswordError':'authPasswordRequired');
    if(registering && password.value!==confirm.value) error(confirm,'confirm-error','authConfirmError');
    const invalid=form.querySelector('[aria-invalid="true"]');
    if(invalid) {invalid.focus();return;}
    busy=true; paint();
    form.querySelectorAll('input,button').forEach(control=>control.disabled=true);
    form.setAttribute('aria-busy','true');
    try {
      await MoneyGuideAuth[registering?'register':'login'](name.value,password.value);
      password.value='';confirm.value='';
      const success=document.querySelector('#account-success');
      success.hidden=false;success.textContent=t(registering?'authCreated':'authLoggedIn');success.focus();
      document.querySelector('.account-card').classList.add('is-success');
      const destination=getProfile()?next:'index.html?onboard=1&next='+encodeURIComponent(next);
      setTimeout(()=>location.replace(destination),matchMedia('(prefers-reduced-motion: reduce)').matches?0:550);
    } catch(err) {
      const known=['authNameError','authPasswordError','authExists','authUnsupported','authCredentials','authMissing','authDamaged','authSessionFailed'];
      document.querySelector('#account-error').textContent=t(known.includes(err.message)?err.message:'authStorageError');
      password.value='';confirm.value='';
      busy=false;form.querySelectorAll('input,button').forEach(control=>control.disabled=false);
      form.removeAttribute('aria-busy');paint();password.focus();
    }
  });
})();
