const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.MONEYGUIDE_URL || 'http://127.0.0.1:8000';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.evaluate(()=>MoneyGuideAuth.register('Amos','Test-only-passphrase-42'));
  await page.evaluate(()=>localStorage.setItem('moneyguide.profile',JSON.stringify({firstName:'Amos',currency:'USD',goal:'Start saving',knowledge:'Beginner'})));
  await page.goto(base+'/dashboard.html#tools');
  const prior=await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1'));
  async function open(key){await page.locator('.tool-card[data-tool="'+key+'"]').click();}
  const output=page.locator('#tool-output');
  await open('savingsTool');
  assert.match(await output.textContent(),/375\.00/);
  await page.locator('#tool-goal').fill('100');await page.locator('#tool-saved').fill('150');
  assert.match(await output.textContent(),/already cover/);
  await page.locator('#tool-months').fill('0');assert.equal(await output.textContent(),'');
  assert.equal(await page.locator('#tool-months').getAttribute('aria-invalid'),'true');
  await page.locator('#tool-form [type=reset]').click();assert.match(await output.textContent(),/375\.00/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-tool=savingsTool].tool-card').evaluate(e=>e===document.activeElement),true);
  await open('budgetTool');assert.match(await output.textContent(),/300\.00/);
  await page.locator('#tool-income').fill('0');assert.match(await output.textContent(),/Monthly shortfall/);
  await page.keyboard.press('Escape');
  await open('growthTool');await page.locator('#tool-rate').fill('0');
  assert.match(await output.textContent(),/13,000\.00/);
  await page.locator('#tool-output summary').click();assert.equal(await page.locator('#tool-output tbody tr').count(),10);
  await page.keyboard.press('Escape');
  await open('loanTool');await page.locator('#tool-rate').fill('0');await page.locator('#tool-principal').fill('1200');await page.locator('#tool-months').fill('12');
  assert.match(await output.textContent(),/100\.00/);
  await page.locator('#tool-output summary').click();assert.equal(await page.locator('#tool-output tbody tr').count(),12);
  await page.keyboard.press('Escape');
  await open('currencyTool');assert.equal(await output.textContent(),'');
  await page.locator('#tool-to').selectOption('RWF');await page.locator('#tool-exchange').fill('1400');
  assert.match(await output.textContent(),/140,000/);
  await page.locator('#tool-swap').click();
  assert.equal(await page.locator('#tool-from').inputValue(),'RWF');
  assert(Math.abs(Number(await page.locator('#tool-exchange').inputValue())-1/1400)<1e-12);
  await page.locator('#tool-to').selectOption('RWF');assert.equal(await page.locator('#tool-exchange').inputValue(),'1');
  await page.keyboard.press('Escape');
  // Every language/theme at desktop and narrow mobile widths.
  for(const language of ['en','es','fr']) {
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('[data-language]').selectOption(language);
    for(const theme of ['dark','light']) {
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme-toggle').click();
      for(const key of ['savingsTool','budgetTool','growthTool','loanTool','currencyTool']) {
        await open(key);
        for(const width of [1440,390,320]) {
          await page.setViewportSize({width,height:900});
          assert.equal(await page.locator('#money-tool').evaluate(e=>e.scrollWidth>e.clientWidth),false,`${key} ${language} ${theme} ${width}`);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        }
        await page.setViewportSize({width:1440,height:1000});await page.keyboard.press('Escape');
      }
    }
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('moneyguide.learning.v1')),prior);
  await page.locator('[data-language]').selectOption('en');
  await page.locator('#header-currency').selectOption('KES');
  await open('growthTool');assert.match(await output.textContent(),/KES/);
  await page.screenshot({path:'/tmp/moneyguide-calculator-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'/tmp/moneyguide-calculator-mobile.png'});
  await page.keyboard.press('Escape');
  await page.goto(base+'/index.html');
  await page.locator('#site-footer [data-tool=loanTool]').click();
  assert.equal(await page.locator('#money-tool').evaluate(e=>e.open),true);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: five calculators, instant results, invalid inputs, reset, schedules, currency swaps, focus, three languages, both themes, mobile, footer routing, unchanged learning progress.');
})().catch(e=>{console.error(e);process.exit(1)});
