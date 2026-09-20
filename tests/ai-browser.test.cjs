// Optional integration check: NODE_PATH may point to an installed Playwright package.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = process.env.MONEYGUIDE_URL || 'http://127.0.0.1:3000';
    await page.goto(base);
    await page.locator('[data-onboard]').first().click();
    await page.locator('#first-name').fill('Alex');
    await page.locator('#currency').selectOption('USD');
    await page.locator('#goal').selectOption('Buy a car');
    await page.locator('#knowledge').selectOption('Advanced');
    await page.locator('#onboarding-form [type="submit"]').click();
    await page.waitForURL('**/dashboard.html');
    await page.locator('#demo-budget').click();
    assert.match(await page.locator('#plan-results').innerText(), /8 months/);
    assert.match(await page.locator('#plan-results').innerText(), /400\.00/);
    assert.equal(await page.locator('.learning-card').count(), 10);
    await page.route('**/api/moneyguide', route => {
      const body = route.request().postDataJSON();
      assert.equal(body.context.knowledge, 'Advanced');
      assert.equal(body.context.firstName, undefined);
      return route.fulfill({ json: { insight: 'Keep a monthly buffer.', steps: [{text:'Explore budgeting.',action:'basics'}] } });
    });
    await page.locator('#generate-plan').click();
    await page.locator('#plan-answer').waitFor({state:'visible'});
    assert.equal(await page.locator('#plan-actions a').getAttribute('href'), 'module.html?id=2');
    await page.locator('#explain-plan').click();
    await page.getByRole('heading', { name: 'Why this plan?' }).waitFor();
    await page.locator('#open-coach').click();
    await page.locator('#coach-input').fill('Why keep a buffer?');
    await page.locator('#coach-send').click();
    await page.locator('.chat-message').first().waitFor();
    await page.keyboard.press('Escape');
    await page.locator('[data-language]').selectOption('fr');
    assert.equal(await page.locator('#budget-form').count(), 1);
    assert.match(await page.locator('#plan-results').innerText(), /8 months/);
    await page.locator('#header-currency').selectOption('KES');
    assert.equal(await page.locator('#monthly-income').inputValue(), '');
    assert.equal(await page.locator('#plan-answer').isVisible(), false);
    assert.match(await page.locator('#plan-goal').innerText(), /KES/);
    await page.locator('#demo-budget').click();
    await page.unroute('**/api/moneyguide');
    await page.route('**/api/moneyguide', route => route.fulfill({status:503,json:{error:'AI is unavailable. Please try again.'}}));
    await page.locator('#generate-plan').click();
    await page.getByText('Your calculations are ready, but personalized AI insights are temporarily unavailable.',{exact:false}).waitFor();
    for (const theme of ['dark','light']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme-toggle').click();
      await page.locator('#moneyguide-plan').scrollIntoViewIfNeeded();
      await page.screenshot({path:`test-results/ai-${theme}.png`});
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('#moneyguide-plan').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    await page.screenshot({path:'test-results/ai-mobile.png'});
    await page.locator('#open-coach').click();
    await page.locator('#coach-close').click();
    assert.equal(await page.locator('#coach-dialog').isVisible(),false);
    assert.deepEqual(errors, []);
    for(const file of ['/assets/financial-growth.webp','/assets/fonts/Manrope.ttf','/module.html','/certificate.html']) assert.equal((await page.request.get(base+file)).status(),200);
    for(const file of ['/.env.local','/api/moneyguide.js','/package.json']) assert.equal((await page.request.get(base+file)).status(),404);
    console.log('New design, onboarding, plan, coach, language/currency changes, themes, mobile layout, and asset isolation passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
