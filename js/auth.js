// DEMO ONLY: client-side checks can be bypassed and do not protect data.
// Replace this provider with server/API calls and server-managed sessions for production.
const MoneyGuideAuth = (() => {
  const ACCOUNT = 'moneyguide.demoAccount.v1';
  const SESSION = 'moneyguide.demoSession.v1';
  const LOGOUT = 'moneyguide.demoLogout';
  const iterations = 600000;
  function account() {
    const raw = localStorage.getItem(ACCOUNT);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (value.version !== 1 || typeof value.fullName !== 'string' || !value.fullName.trim() || value.fullName.length > 100 || !/^[a-f0-9]{32}$/.test(value.salt) || !/^[a-f0-9]{64}$/.test(value.verifier) || typeof value.id !== 'string') throw new Error();
      return value;
    } catch (error) { throw new Error('authDamaged'); }
  }
  function current() {
    try {
      const user = account();
      const session = JSON.parse(sessionStorage.getItem(SESSION));
      if (user && session?.id === user.id && session.logout === localStorage.getItem(LOGOUT)) return {id:user.id,fullName:user.fullName};
    } catch (error) { /* A missing or unreadable session is signed out. */ }
    return null;
  }
  const hex = bytes => Array.from(bytes, byte=>byte.toString(16).padStart(2,'0')).join('');
  async function verifier(password,salt) {
    if (!window.crypto?.subtle) throw new Error('authUnsupported');
    const material = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bytes = Uint8Array.from(salt.match(/.{2}/g),pair=>parseInt(pair,16));
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:bytes,iterations},material,256);
    return hex(new Uint8Array(bits));
  }
  function startSession(user) {
    sessionStorage.setItem(SESSION,JSON.stringify({id:user.id,logout:localStorage.getItem(LOGOUT)}));
  }
  function validName(name) { return typeof name==='string' && name.trim().length>=2 && name.trim().length<=100; }
  function validPassword(password) { return typeof password==='string' && password.length>=12 && password.length<=128 && password.trim().length>0; }
  async function register(fullName,password) {
    if(!validName(fullName)) throw new Error('authNameError');
    if(!validPassword(password)) throw new Error('authPasswordError');
    if(account()) throw new Error('authExists');
    if(!window.crypto?.subtle) throw new Error('authUnsupported');
    const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    const user={version:1,id:crypto.randomUUID(),fullName:fullName.trim(),salt,verifier:await verifier(password,salt)};
    // Check again after the asynchronous work, so another tab is not overwritten.
    if(account()) throw new Error('authExists');
    localStorage.setItem(ACCOUNT,JSON.stringify(user));
    try { startSession(user); } catch(error) { throw new Error('authSessionFailed'); }
    return current();
  }
  async function login(fullName,password) {
    const user=account();
    if(!user) throw new Error('authMissing');
    const candidate=await verifier(password,user.salt);
    if(user.fullName.toLocaleLowerCase()!==fullName.trim().toLocaleLowerCase() || candidate!==user.verifier) throw new Error('authCredentials');
    startSession(user); return current();
  }
  function logout() {
    sessionStorage.removeItem(SESSION);
    localStorage.setItem(LOGOUT,String(Date.now())+'-'+Math.random());
    location.replace('account.html?mode=login');
  }
  // Only allow app-owned learning destinations, never arbitrary redirect URLs.
  function destination(value) {
    try {
      const base=new URL('.',location.href);
      const url=new URL(value || 'dashboard.html',base);
      const file=url.pathname.slice(base.pathname.length);
      if(url.origin!==base.origin || !url.pathname.startsWith(base.pathname) || !['dashboard.html','module.html','certificate.html'].includes(file)) return 'dashboard.html';
      const id=url.searchParams.get('id');
      if(file!=='dashboard.html' && !/^(?:[1-9]|10)$/.test(id || '')) return 'dashboard.html';
      const hash=/^#[a-z0-9-]+$/i.test(url.hash)?url.hash:'';
      return file+(file==='dashboard.html'?'':'?id='+id)+hash;
    } catch(error) {return 'dashboard.html';}
  }
  function entry(next='dashboard.html',mode) {
    let exists=false;
    try { exists=Boolean(account()); } catch(error) { exists=true; }
    return 'account.html?mode='+(mode || (exists?'login':'register'))+'&next='+encodeURIComponent(destination(next));
  }
  const protectedPage=['dashboard','module','certificate'].includes(document.body.dataset.page);
  function guard() {
    if(protectedPage && !current()) {
      location.replace(entry(location.pathname.split('/').pop()+location.search+location.hash));
      return false;
    }
    return true;
  }
  guard();
  window.addEventListener('pageshow',event=>{
    if (guard() && event.persisted) location.reload();
  });
  window.addEventListener('storage',event=>{
    if([LOGOUT,ACCOUNT].includes(event.key) || event.key===null) {
      if(!current()) { sessionStorage.removeItem(SESSION); location.replace('account.html?mode=login'); }
    }
  });
  // Capture all entry points, including footer tools, before their click handlers run.
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-onboard],[data-requires-profile],[data-home-destination],[data-tool]');
    if(!target || current()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    location.href=entry(target.getAttribute('href') || (target.hasAttribute('data-tool')?'dashboard.html#tools':'dashboard.html'));
  },true);
  return {current,register,login,logout,entry,destination,validName,validPassword, hasAccount: () => Boolean(account())};
})();
