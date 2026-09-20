// Optional Chrome checks for shared navigation and independent saved preferences.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('test-results', {recursive:true});
const base = process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index.html');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.locator('#header-currency').selectOption('KES');
  await page.locator('[data-onboard]').first().click();
  assert.equal(await page.locator('#currency').inputValue(),'KES');
  await page.locator('#first-name').fill('Amos');
  await page.locator('#goal').selectOption('Start saving');
  await page.locator('#knowledge').selectOption('Beginner');
  await page.locator('#onboarding-form [type=submit]').click();
  await page.waitForURL('**/dashboard.html');
  await page.goto(base+'/module.html?id=2');
  await page.locator('[data-action=lesson]').first().click();
  await page.locator('[data-action=start-test]').click();
  await page.locator('#assessment-form input[value="1"]').check();
  const saved = await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1'));
  await page.locator('#theme-toggle').click();
  await page.locator('#header-currency').selectOption('RWF');
  await page.locator('[data-language]').selectOption('fr');
  assert.equal(await page.locator('#assessment-form input[value="1"]').isChecked(),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),saved);
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#header-currency').inputValue(),'RWF');
  await page.locator('[data-language]').selectOption('en');
  await page.goto(base+'/index.html');
  assert.match(await page.locator('.home-progress').textContent(),/10 XP/);
  await page.screenshot({path:'test-results/moneyguide-home-light.png',fullPage:true});
  await page.goto(base+'/dashboard.html');
  await page.screenshot({path:'test-results/moneyguide-dashboard-light.png',fullPage:true});
  for (const theme of ['light','dark']) {
    if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('#theme-toggle').click();
    for(const width of [1440,1200,1024,768,390,320]) {
      await page.setViewportSize({width,height:900});
      for(const route of ['index.html','dashboard.html','module.html?id=2']) {
        await page.goto(base+'/'+route);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${width} ${route}`);
        assert.equal(await page.evaluate(()=>[...document.images].some(i=>i.complete && !i.naturalWidth)),false);
      }
      if(width<1200) {
        await page.locator('.menu-toggle').click();
        assert.equal(await page.locator('#navigation-panel').evaluate(e=>e.inert),false);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
        assert.equal(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),true);
      }
    }
    await page.setViewportSize({width:1440,height:1000});
  }
  await page.goto(base+'/index.html');
  await page.screenshot({path:'test-results/moneyguide-home-dark.png',fullPage:true});
  await page.locator('#site-footer [data-info=privacy]').click();
  assert.match(await page.locator('#platform-info').textContent(),/browser/);
  await page.keyboard.press('Escape');
  await page.locator('#site-footer [data-set-language=es]').click();
  assert.equal(await page.locator('[data-language]').inputValue(),'es');
  await page.locator('#site-footer [data-set-language=en]').click();
  await page.locator('#profile-control').click();
  assert.match(await page.locator('#platform-info-body').textContent(),/Amos/);
  await page.locator('#platform-info-body a').click();
  await page.waitForURL('**/index.html?profile=edit');
  assert.equal(await page.locator('#onboarding-dialog').evaluate(e=>e.open),true);
  assert.equal(await page.locator('#first-name').inputValue(),'Amos');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.menu-toggle').click();
  await page.locator('#profile-control').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),true);
  await page.screenshot({path:'test-results/moneyguide-home-mobile-final.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: theme, currency, language persistence; quiz preservation; real homepage progress; profile editing; footer; mobile menu keyboard behavior; both themes across six widths.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
