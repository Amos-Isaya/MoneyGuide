// Optional Chrome regression checks for the navigation card system.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  async function selectLanguage(value) {
    const toggle = page.locator('.menu-toggle');
    if (!(await page.locator('[data-language]').isVisible())) await toggle.click();
    await page.locator('[data-language]').selectOption(value);
    if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'true') await toggle.click();
  }
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/index.html');
  assert.equal(await page.locator('.feature-card').count(), 6);
  assert.equal(await page.locator('.feature-card.is-featured').count(), 1);
  await page.locator('#how-it-works').screenshot({path:'/tmp/moneyguide-feature-cards.png'});
  const learn = page.locator('.feature-card').first();
  await learn.focus();
  assert.equal(await learn.evaluate(element => getComputedStyle(element).outlineStyle), 'solid');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#onboarding-dialog').evaluate(dialog=>dialog.open), true);
  await page.keyboard.press('Escape');
  await page.locator('[data-home-destination=practice]').click();
  await page.locator('#first-name').fill('Amos');
  await page.locator('#currency').selectOption('RWF');
  await page.locator('#goal').selectOption('Start saving');
  await page.locator('#knowledge').selectOption('Beginner');
  await page.locator('#onboarding-form [type=submit]').click();
  await page.waitForURL('**/dashboard.html#practice');
  assert.equal(await page.locator('.learning-card').count(), 10);
  assert.equal(await page.locator('.learning-card.featured').count(), 1);
  assert.equal(await page.locator('.certificate-mini.is-pending').count(), 10);
  // Click the module heading, not its arrow: the whole card must navigate.
  await page.locator('.learning-card').nth(6).locator('h3').click();
  await page.waitForURL('**/module.html?id=7');
  await page.goto(base + '/dashboard.html#certificates');
  await page.locator('.certificate-mini').first().locator('h3').click();
  await page.waitForURL('**/module.html?id=1');
  await page.goto(base + '/dashboard.html#practice');
  await page.locator('#flash-module').selectOption('7');
  await page.locator('#open-assessment').click();
  await page.waitForURL('**/module.html?id=7#assessment');
  await page.goto(base + '/dashboard.html#tools');
  assert.equal(await page.locator('.tool-card').count(), 5);
  for (let i=0;i<5;i++) {
    await page.locator('.tool-card').nth(i).click();
    assert.match(await page.locator('#feature-preview').textContent(), /does not perform calculations yet/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.tool-card').nth(i).evaluate(e=>e===document.activeElement),true);
  }
  for (const target of ['modules','practice','tools','progress','certificates']) {
    await page.goto(base + '/index.html');
    await page.locator(`[data-home-destination=${target}] .arrow-wrap`).click();
    await page.waitForURL('**/dashboard.html#'+target);
    assert.equal(await page.locator('#'+target).count(), 1);
  }
  await page.goto(base + '/index.html');
  await page.locator('[data-coming-soon=featureCoach]').click();
  assert.match(await page.locator('#feature-preview').textContent(), /has not been integrated yet/);
  await page.keyboard.press('Escape');
  for (const language of ['en','es','fr']) {
    await selectLanguage(language);
    for (const width of [1440,1024,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const route of ['/index.html','/dashboard.html']) {
        await page.goto(base+route);
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
        assert.equal(overflow,false,`Overflow: ${language}, ${width}, ${route}`);
      }
    }
    await page.goto(base+'/index.html');
  }
  await selectLanguage('en');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#how-it-works').scrollIntoViewIfNeeded();
  await page.screenshot({path:'/tmp/moneyguide-cards-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'/dashboard.html');
  await page.locator('#modules').screenshot({path:'/tmp/moneyguide-module-cards.png'});
  await page.locator('#progress').screenshot({path:'/tmp/moneyguide-progress-cards.png'});
  await page.locator('#tools').screenshot({path:'/tmp/moneyguide-tool-cards.png'});
  await page.locator('#certificates').screenshot({path:'/tmp/moneyguide-pending-certificates.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/index.html');
  await page.locator('.feature-card').first().hover();
  assert.equal(await page.locator('.feature-card').first().evaluate(e=>getComputedStyle(e).transform),'none');
  assert.deepEqual(errors,[]);
  console.log('PASS: full-card/arrow/keyboard routing, onboarding destination, module and certificate links, five honest tool previews, AI notice, focus return, reduced motion, three languages and five widths.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
