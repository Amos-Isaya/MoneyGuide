const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
const password='Only-a-demo-passphrase-42';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/module.html?id=7#assessment');
  await page.waitForURL('**/account.html?**');
  assert.match(await page.locator('.account-notice').textContent(),/not secure authentication/);
  await page.locator('#account-submit').click();
  assert.match(await page.locator('#name-error').textContent(),/full name/);
  await page.locator('#full-name').fill('Amos Isaya');
  await page.locator('#account-password').fill('short');await page.locator('#confirm-password').fill('short');
  await page.locator('#account-submit').click();assert.match(await page.locator('#password-error').textContent(),/12/);
  await page.locator('#account-password').fill(password);await page.locator('#confirm-password').fill('different');
  await page.locator('#account-submit').click();assert.match(await page.locator('#confirm-error').textContent(),/do not match/);
  await page.locator('[data-password-toggle=account-password]').click();assert.equal(await page.locator('#account-password').getAttribute('type'),'text');
  await page.locator('[data-password-toggle=account-password]').click();assert.equal(await page.locator('#account-password').getAttribute('type'),'password');
  await page.locator('#confirm-password').fill(password);await page.locator('#account-submit').click();
  await page.waitForURL('**/index.html?onboard=1&**');
  assert.equal(await page.locator('#first-name').inputValue(),'Amos');
  const raw=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));
  assert.equal(raw.includes(password),false);
  const account=await page.evaluate(()=>JSON.parse(localStorage.getItem('moneyguide.demoAccount.v1')));
  assert.equal(account.verifier.length,64);assert.equal(account.salt.length,32);
  await page.locator('#currency').selectOption('RWF');await page.locator('#goal').selectOption('Start saving');await page.locator('#knowledge').selectOption('Beginner');
  await page.locator('#onboarding-form [type=submit]').click();
  await page.waitForURL('**/module.html?id=7#assessment');
  await page.locator('[data-action=lesson]').first().click();
  const progress=await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1'));
  await page.goto(base+'/dashboard.html');assert.match(await page.locator('h1').textContent(),/Amos Isaya/);
  await page.locator('#profile-control').click();await page.locator('[data-logout]').click();
  await page.waitForURL('**/account.html?mode=login');
  await page.goto(base+'/index.html');assert.doesNotMatch(await page.locator('.home-progress').textContent(),/Amos/);
  await page.goto(base+'/dashboard.html');await page.waitForURL('**/account.html?**');
  await page.locator('#full-name').fill('Amos Isaya');await page.locator('#account-password').fill('wrong-password');await page.locator('#account-submit').click();
  await page.locator('#account-error').waitFor({state:'visible'});
  assert.match(await page.locator('#account-error').textContent(),/do not match/);
  await page.locator('#account-password').fill(password);await page.locator('#account-submit').click();await page.waitForURL('**/dashboard.html');
  assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),progress);
  await page.reload();assert.match(await page.locator('h1').textContent(),/Amos Isaya/);
  // Registration may not overwrite the existing account/progress.
  await page.goto(base+'/account.html?mode=register');
  await page.locator('#full-name').fill('Another Learner');await page.locator('#account-password').fill(password);await page.locator('#confirm-password').fill(password);await page.locator('#account-submit').click();
  await page.locator('#account-error').waitFor({state:'visible'});
  assert.match(await page.locator('#account-error').textContent(),/already exists/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),progress);
  // Safe return destinations, not arbitrary URLs supplied in the query string.
  assert.equal(await page.evaluate(()=>MoneyGuideAuth.destination('https://example.com/')),'dashboard.html');
  assert.equal(await page.evaluate(()=>MoneyGuideAuth.destination('javascript:alert(1)')),'dashboard.html');
  await page.goto(base+'/account.html?mode=login');
  for(const language of ['en','es','fr']) {
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('[data-language]').selectOption(language);
    for(const theme of ['dark','light']) {
      if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('#theme-toggle').click();
      for(const width of [1440,1024,768,390,320]) {
        await page.setViewportSize({width,height:900});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${language} ${theme} ${width}`);
      }
      await page.setViewportSize({width:1440,height:1000});
    }
  }
  await page.locator('[data-language]').selectOption('en');await page.locator('#theme-toggle').click();
  await page.goto(base+'/account.html?mode=register');
  await page.screenshot({path:'/tmp/moneyguide-signup-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/moneyguide-signup-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'/index.html');
  await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  assert(await page.locator('#about').evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('payments-scene')));
  await page.screenshot({path:'/tmp/moneyguide-payment-scene.png'});
  await page.locator('#achieve').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  assert(await page.locator('#achieve').evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('growth-scene')));
  await page.screenshot({path:'/tmp/moneyguide-growth-scene.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#achieve').evaluate(e=>getComputedStyle(e,'::before').transform),'none');
  assert.equal(await page.locator('[data-reveal]').first().evaluate(e=>getComputedStyle(e).opacity),'1');
  // Logout also ends another tab's demo session.
  const other=await context.newPage();
  await other.goto(base+'/account.html?mode=login');
  await other.evaluate(password=>MoneyGuideAuth.login('Amos Isaya',password),password);
  await other.goto(base+'/dashboard.html');
  await page.evaluate(()=>MoneyGuideAuth.logout());
  await other.waitForURL('**/account.html?mode=login');
  assert.equal(await other.evaluate(()=>MoneyGuideAuth.current()),null);
  await other.close();
  // Adopting a pre-account learning profile does not reset its saved activities.
  const legacyContext=await browser.newContext();
  const legacy=await legacyContext.newPage();
  await legacy.goto(base+'/index.html');
  await legacy.evaluate(()=>{
    localStorage.setItem('moneyguide.profile',JSON.stringify({firstName:'Amos',currency:'RWF',goal:'Start saving',knowledge:'Beginner'}));
    MoneyGuideProgress.lesson(1,0,'Amos');
  });
  const legacyProgress=await legacy.evaluate(()=>localStorage.getItem('moneyguide.learning.v1'));
  await legacy.goto(base+'/account.html?mode=register');
  await legacy.locator('#full-name').fill('Amos Isaya');
  await legacy.locator('#account-password').fill(password);await legacy.locator('#confirm-password').fill(password);
  await legacy.locator('#account-submit').click();await legacy.waitForURL('**/dashboard.html');
  assert.equal(await legacy.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),legacyProgress);
  await legacyContext.close();
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: registration validation, password visibility, salted verifier, login/logout, guarded routes, destination preservation, personalization, retained progress, duplicate-account protection, themes/languages/responsiveness, three scenes and reduced motion.');
})().catch(e=>{console.error(e);process.exit(1)});
