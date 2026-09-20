const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.MONEYGUIDE_URL || 'http://localhost:3101';
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/index.html');assert.equal(await page.locator('.cinematic-actions a[href="games.html"]').count(),1);
 await page.locator('.cinematic-actions a[href="games.html"]').click();await page.waitForURL('**/games.html');
 await page.evaluate(()=>localStorage.setItem('moneyguide.learning.v1','untouched-test-marker'));
 await page.locator('[data-start="budget"]').click();await page.locator('[data-lock]').click();
 for(let i=0;i<3;i++){await page.locator('[data-choice="0"]').click();await page.locator('[data-next]').click();}
 assert.match(await page.locator('.game-result-score').innerText(),/100/);assert.match(await page.locator('#game-arena').innerText(),/Savings goal reached/);
 await page.locator('[data-exit]').last().click();
 for(const id of ['sort','scam']){
  await page.locator(`[data-start="${id}"]`).click();
  const rounds=id==='sort'?8:6;
  for(let i=0;i<rounds;i++){
   const answer=await page.evaluate(async(id)=>{const data=await import('./js/game-data.js');const heading=document.querySelector('#game-arena h2').textContent;return (id==='sort'?data.sorting:data.scams).find(x=>x.title===heading).answer;},id);
   await page.locator(`[data-choice="${answer}"]`).focus();await page.keyboard.press('Enter');
   assert(await page.locator('[data-choice]').first().isDisabled());assert(await page.locator('.game-feedback').isVisible());await page.locator('[data-next]').click();
  }
  assert.match(await page.locator('.game-result-score').innerText(),/100/);await page.locator('[data-exit]').last().click();
 }
 await page.reload();
 for(const id of ['budget','sort','scam'])assert.match(await page.locator(`[data-best="${id}"]`).innerText(),/100\/100/);
 assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),'untouched-test-marker');
 await page.locator('[data-start="sort"]').click();await page.locator('[data-choice="0"]').click();await page.locator('[data-exit]').first().click();
 assert.match(await page.locator('[data-best="sort"]').innerText(),/1 completed game/);
 await page.locator('[data-start="budget"]').click();
 await page.locator('#game-food').fill('250');await page.locator('#game-fun').fill('300');
 assert.equal(await page.locator('#reserve-value').innerText(),'0');await page.locator('[data-lock]').click();
 for(let i=0;i<3;i++){await page.locator('[data-choice="1"]').click();await page.locator('[data-next]').click();}
 assert.match(await page.locator('.game-result-score').innerText(),/^0/);assert.match(await page.locator('#game-arena').innerText(),/Best score: 100/);
 await page.locator('[data-replay]').click();assert(await page.locator('#game-food').isVisible());await page.locator('[data-exit]').first().click();
 for(const width of [1440,1280,1200]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>{const nav=document.querySelector('.top-nav').getBoundingClientRect(),prefs=document.querySelector('.header-preferences').getBoundingClientRect();return nav.right<=prefs.left+1;}),`navigation overlap at ${width}`);
 }
 for(const theme of ['dark','light'])for(const width of [1440,1024,768,390,320]){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${theme} ${width} library overflow`);
  await page.locator('[data-start="budget"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${theme} ${width} arena overflow`);await page.locator('[data-exit]').first().click();
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/moneyguide-games-mobile.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-start="scam"]').click();assert.equal(await page.locator('.game-panel').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.locator('[data-exit]').first().click();
 for(const lang of ['es','fr','en']){await page.evaluate(lang=>MoneyGuideI18n.setLanguage(lang),lang);assert.equal(await page.locator('[data-start]').count(),3);}
 await page.evaluate(()=>localStorage.setItem('moneyguide.games.v1','bad-data'));await page.reload();assert.match(await page.locator('#game-storage-note').innerText(),/could not be read/);assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.games.v1')),'bad-data');
 assert.deepEqual(errors,[]);console.log('PASS: all 3 games, full scores, feedback, keyboard, replay exit, persistence, XP isolation, 5 widths, 2 themes, 3 languages, reduced motion, damaged storage, no JS errors');
} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
