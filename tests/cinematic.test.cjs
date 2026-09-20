// Homepage-specific checks; the learning regression suite remains separate.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.setDefaultTimeout(10000);
 const errors=[],badResponses=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base) && r.status()>=400)badResponses.push(r.url());});
 await page.goto(base+'/index.html');
 assert.equal(await page.locator('.hero-slide').count(),4);
 assert.equal(await page.locator('.hero-slide').nth(2).locator('img').count(),0,'Third image must not load with the first');
 assert.equal(await page.locator('.hero-slide').nth(3).locator('img').count(),0);
 const heading=await page.locator('#hero-title').boundingBox();
 await page.waitForFunction(()=>document.querySelector('[data-slide="1"]').hasAttribute('aria-current'),{},{timeout:5000});
 const opacity=await page.locator('.hero-slide').nth(1).evaluate(e=>parseFloat(getComputedStyle(e).opacity));
 assert(opacity<1,'Background should crossfade, not jump');
 await page.waitForTimeout(1600);
 assert.deepEqual(await page.locator('#hero-title').boundingBox(),heading,'Hero content must stay in place');
 // Manual selection survives the next normal autoplay interval, even after focus leaves.
 await page.locator('[data-slide="3"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-slide="3"]').hasAttribute('aria-current'));
 await page.mouse.move(0,0);await page.locator('[data-slide="3"]').evaluate(e=>e.blur());
 await page.waitForTimeout(4000);
 assert.equal(await page.locator('[data-slide="3"]').getAttribute('aria-current'),'true');
 await page.waitForFunction(()=>document.querySelector('[data-slide="0"]').hasAttribute('aria-current'),{},{timeout:7000});
 await page.locator('#hero-playback').click();
 await page.mouse.move(0,0);await page.locator('#hero-playback').evaluate(e=>e.blur());
 await page.waitForTimeout(4000);
 assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-current'),'true');
 // Inspect each scene and its active top-navigation state, in reading order.
 for(const [id,nav] of [['about','about'],['how-it-works','modules'],['home-practice','practice'],['home-tools','tools'],['home-progress-scene','progress'],['achieve','certificates']]) {
   await page.locator('#'+id).evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-100,behavior:'instant'}));
   await page.waitForTimeout(1200);
   assert.equal(await page.locator('#'+id).evaluate(e=>e.classList.contains('scene-lit')),true);
   assert.equal(await page.locator('.top-nav [aria-current]').getAttribute('data-nav'),nav);
   const h=page.locator('#'+id+' h2').first();
   assert.equal(await h.evaluate(e=>getComputedStyle(e).opacity),'1');
   await page.screenshot({path:'/tmp/moneyguide-cinema-'+id+'.png'});
 }
 // The new cards navigate to working destinations and calculators.
 await page.evaluate(async()=>{await MoneyGuideAuth.register('Amos Isaya','Test-only-passphrase-42');localStorage.setItem('moneyguide.profile',JSON.stringify({firstName:'Amos',currency:'KES',goal:'Start saving',knowledge:'Beginner'}));MoneyGuideProgress.lesson(1,0,'Amos Isaya');});
 await page.reload();
 assert.match(await page.locator('.home-progress').textContent(),/10 XP/);
 assert.equal(await page.locator('.story-meter').getAttribute('aria-valuenow'),'1');
 await page.locator('.home-tool-card').first().click();
 assert.equal(await page.locator('#money-tool').evaluate(e=>e.open),true);
 await page.keyboard.press('Escape');
 await page.locator('#home-practice [data-coming-soon]').click();
 assert.match(await page.locator('#feature-preview').textContent(),/future release/);
 await page.keyboard.press('Escape');
 await page.locator('#home-practice a').nth(1).click();await page.waitForURL('**/module.html?id=1#lesson-0');
 // Both themes, languages and all responsive widths; no forced scroll snapping.
 for(const language of ['en','es','fr']) {
   for(const theme of ['dark','light']) {
     await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/index.html');
     await page.locator('[data-language]').selectOption(language);
     if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
     for(const width of [1440,1024,768,390,320]) {
       await page.setViewportSize({width,height:900});
       assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${language} ${theme} ${width}`);
     }
   }
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/index.html');
 for(let i=0;i<4;i++) {
   await page.locator(`[data-slide="${i}"]`).click();
   await page.waitForFunction(i=>document.querySelector(`[data-slide="${i}"]`).hasAttribute('aria-current'),i);
   assert.equal(await page.locator('.hero-slide').nth(i).evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
   const img=page.locator('.hero-slide').nth(i).locator('img');
   assert.equal(await img.evaluate(e=>e.complete && e.naturalWidth>0),true);

 }
 assert.equal(await page.locator('#hero-playback').isDisabled(),true);
 await page.locator('#home-tools').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('#home-tools h2').evaluate(e=>getComputedStyle(e).animationName),'none');
 // Use a fresh cache to measure what a first-time mobile visitor downloads.
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const mobile=await mobileContext.newPage();
 await mobile.goto(base+'/index.html');
 for(let i=0;i<3;i++) {
   await mobile.locator(`[data-slide="${i}"]`).click();
   await mobile.waitForFunction(i=>document.querySelector(`[data-slide="${i}"]`).hasAttribute('aria-current'),i);
   assert.match(await mobile.locator('.hero-slide').nth(i).locator('img').evaluate(e=>e.currentSrc),/-small\.webp/);
 }
 await mobile.screenshot({path:'/tmp/moneyguide-cinema-mobile.png',fullPage:true});
 await mobileContext.close();
 // Lack of IntersectionObserver must not hide content.
 const fallback=await context.newPage();await fallback.addInitScript(()=>{delete window.IntersectionObserver;});
 await fallback.goto(base+'/index.html');
 assert.equal(await fallback.locator('#sceneTools-title').evaluate(e=>getComputedStyle(e).opacity),'1');
 await fallback.close();
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);
 await browser.close();
 console.log('PASS: four responsive backgrounds, delayed loading, crossfade, stable hero, temporary manual pause, autoplay/pause, all scene transitions/nav states, real progress/tools, three languages/two themes/five widths, reduced motion and observer fallback.');
})().catch(e=>{console.error(e);process.exit(1)});
