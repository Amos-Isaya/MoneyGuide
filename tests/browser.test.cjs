// Optional browser check. Requires Playwright in your test environment, not in the website.
// MONEYGUIDE_URL can point at any locally served copy of MoneyGuide.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
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
  await page.goto(base + '/dashboard.html');
  await page.waitForURL('**/index.html');
  await page.locator('[data-onboard]').first().click();
  await page.locator('#currency').selectOption('RWF');
  await page.locator('#goal').selectOption('Start saving');
  await page.locator('#knowledge').selectOption('Beginner');
  await page.locator('#first-name').fill('   ');
  await page.locator('[type=submit]').click();
  assert(await page.locator('#first-name').evaluate(input => !input.checkValidity()));
  await page.locator('#first-name').fill('Amos');
  await page.locator('#currency').selectOption('RWF');
  await page.locator('#goal').selectOption('Start saving');
  await page.locator('#knowledge').selectOption('Beginner');
  await page.locator('[type=submit]').click();
  await page.waitForURL('**/dashboard.html');
  assert.match(await page.locator('h1').textContent(), /Amos/);
  assert.equal(await page.locator('.module-card').count(), 10);
  assert.equal(await page.locator('.sidebar').count(), 0);
  assert.equal(await page.locator('.top-nav a').count(), 7);
  await page.screenshot({path:'/tmp/moneyguide-dashboard-desktop.png',fullPage:true});
  await selectLanguage('fr');
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.match(await page.locator('.goal-meta').textContent(), /RWF/);
  assert.match(await page.locator('.module-card').first().textContent(), /Les bases de l’argent/);
  await page.reload();
  assert.equal(await page.locator('[data-language]').inputValue(),'fr');
  await selectLanguage('en');
  // Starting module 7 first proves that the learning order is a recommendation only.
  await page.locator('.module-card').nth(6).locator('.button').click();
  assert.match(page.url(), /id=7/);
  assert.match(await page.locator('.module-intro').textContent(), /not personalized investment advice/);
  const answers = await page.evaluate(() => MoneyGuideModules.map(m => m.assessment.map(q => q.answer)));
  const checks = await page.evaluate(() => MoneyGuideModules.map(m => m.lessons.map(l => l.check.answer)));
  async function takeTest(moduleId, countCorrect) {
    await page.locator('[data-action=start-test], [data-action=retake]').click();
    for (let index=0; index<10; index++) {
      const correct = answers[moduleId-1][index];
      await page.locator(`#assessment-form input[value="${index<countCorrect ? correct : (correct+1)%3}"]`).check();
      if (index<9) await page.locator('[data-action=next-question]').click();
      else await page.locator('#assessment-form [type=submit]').click();
    }
  }
  await takeTest(7, 7);
  assert.match(await page.locator('.test-result').textContent(), /NOT YET PASSED/);
  assert.equal(await page.locator('#earned-banner a').count(),0);
  await takeTest(7, 8);
  assert.match(await page.locator('.test-result').textContent(), /PASS/);
  assert.equal(await page.locator('#earned-banner a').count(),0);
  await page.goto(base+'/certificate.html?id=7');
  assert.equal(await page.locator('.certificate-paper').count(),0);
  for (const id of [7,1,2,3,4,5,6,8,9,10]) {
    await page.goto(base+'/dashboard.html');
    await page.locator('.module-card').nth(id-1).locator('.button').click();
    assert.equal(await page.locator('.lesson').count(),3);
    for(let index=0;index<3;index++) {
      await page.locator(`[data-action=lesson][data-index="${index}"]`).click();
      const form=page.locator(`[data-check="${index}"]`);
      if(index===0 && id===1) {
        await form.locator(`input[value="${(checks[id-1][index]+1)%3}"]`).check();
        await form.locator('[type=submit]').click();
        assert.match(await form.locator('.check-feedback').textContent(), /Not quite/);
      }
      await form.locator(`input[value="${checks[id-1][index]}"]`).check();
      await form.locator('[type=submit]').click();
      assert.match(await form.locator('.check-feedback').textContent(), /Correct/);
    }
    for(let card=0;card<10;card++) {
      await page.locator('[data-action=flip]').click();
      if(card<9) await page.locator('[data-action=next-card]').click();
    }
    await page.locator('[data-action=previous-card]').click();
    assert.match(await page.locator('.card-counter').textContent(),/9 of 10/);
    await page.locator('[data-action=flip]').click();
    await page.locator('[data-action=summary]').click();
    if(id!==7) await takeTest(id,10);
    assert.equal(await page.locator('#earned-banner a').count(),1);
    await page.reload();
    assert.match(await page.locator('#activity-count').textContent(),/17 \/ 17/);
    await page.locator('#earned-banner a').click();
    assert.match(await page.locator('.learner-name').textContent(),/Amos/);
    assert.match(await page.locator('.certificate-id').textContent(),new RegExp('MG-'+String(id).padStart(2,'0')));
    if(id===7) {
      await selectLanguage('es');
      assert.match(await page.locator('h1').textContent(),/Certificado/);
      await page.evaluate(()=>{window.print=()=>{window.printCalled=true;};});
      await page.locator('[data-action=pdf]').click();
      assert.equal(await page.evaluate(()=>window.printCalled),true);
      await selectLanguage('en');
      await page.pdf({path:'/tmp/moneyguide-certificate.pdf',preferCSSPageSize:true,printBackground:true});
      await page.screenshot({path:'/tmp/moneyguide-certificate.png',fullPage:true});
    }
  }
  await page.goto(base+'/dashboard.html');
  const total=await page.evaluate(()=>MoneyGuideProgress.totals());
  assert.equal(total.finished,10);assert.equal(total.certificates,10);assert.equal(total.percent,100);assert.equal(total.xp,1650);assert.equal(total.level,5);
  await page.reload();assert.equal(await page.locator('.certificate-mini').count(),10);
  for(const width of [1440,1024,768,390,320]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['/index.html','/dashboard.html','/module.html?id=10','/certificate.html?id=10']) {
      await page.goto(base+route);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
      assert.equal(overflow,false,`Horizontal overflow: ${width}, ${route}`);
      if(width===390 && route.includes('dashboard'))await page.screenshot({path:'/tmp/moneyguide-dashboard-mobile.png',fullPage:true});
      if(width===1440 && route.includes('module'))await page.screenshot({path:'/tmp/moneyguide-module.png',fullPage:true});
    }
  }
  await page.goto(base+'/module.html?id=999');assert.match(await page.locator('h1').textContent(),/not found/);
  await page.goto(base+'/index.html');await page.locator('[data-onboard]').first().click();
  assert.equal(await page.locator('#first-name').inputValue(),'Amos');
  await page.locator('[data-close]').click();
  await selectLanguage('fr');
  await page.locator('[data-onboard]').first().click();
  assert.equal(await page.locator('#goal').inputValue(),'Start saving');
  await page.locator('#onboarding-form [type=submit]').click();await page.waitForURL('**/dashboard.html');
  assert.equal(await page.evaluate(()=>MoneyGuideProgress.totals().certificates),10);
  assert.deepEqual(errors,[]);
  console.log('PASS: onboarding, ten open module links, 30 lessons/checks, 100 cards, fail/pass thresholds, 10 certificates, PDF, languages, persistence, and five responsive widths.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
