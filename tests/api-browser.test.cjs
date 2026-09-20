const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const children=[];
fs.mkdirSync('test-results',{recursive:true});
const marker=path.resolve('test-results/cross-origin-provider.jsonl');
function start(port,markerValue,api) {
 const child=spawn(process.execPath,['tests/coach-server.mjs'],{env:{...process.env,PORT:String(port),COACH_TEST_MARKER:markerValue,COACH_TEST_API_BASE:api,MONEYGUIDE_ALLOWED_ORIGINS:'http://127.0.0.1:3201'},stdio:['ignore','pipe','pipe']});
 children.push(child);
 child.stderr.on('data',data=>{if(!data.toString().includes('AI_NOT_CONFIGURED'))process.stderr.write(data)});
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Test server startup timeout')),30000);
  child.stdout.on('data',data=>{if(data.toString().includes('MoneyGuide:')){clearTimeout(timer);resolve()}});
  child.on('error',reject);
 });
}
(async()=>{
 let browser;
 try {
  await start(3202,marker,'');await start(3201,'','http://127.0.0.1:3202');
  browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage();page.setDefaultTimeout(60000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>console.error('Request failed',request.url(),request.failure().errorText));
  await page.goto('http://127.0.0.1:3201/',{waitUntil:'domcontentloaded'});
  await page.locator('#open-coach').click();
  await page.locator('#coach-input').fill('How can I save $3,000?');
  const response=page.waitForResponse(response=>response.url()==='http://127.0.0.1:3202/api/moneyguide'&&response.request().method()==='POST');
  await page.locator('#coach-send').click();
  assert.equal((await response).status(),200);
  await page.locator('.chat-assistant').waitFor();
  const preflights=fs.readFileSync(marker+'.cors','utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  assert.ok(preflights.some(request=>request.origin==='http://127.0.0.1:3201'&&request.status===204));
  const calls=fs.readFileSync(marker,'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(calls[0].payload.messages.at(-1).content,'How can I save $3,000?');
  assert.equal(calls[0].url,'https://integrate.api.nvidia.com/v1/chat/completions');
  assert.equal(calls[0].payload.model,'nvidia/nemotron-3-super-120b-a12b');
  assert.deepEqual(errors,[]);
  console.log('PASS: real cross-origin browser preflight 204, API POST 200, expected NVIDIA request, and displayed answer. Only NVIDIA transport is stubbed; no browser requests intercepted.');
 }finally{if(browser)await browser.close();for(const child of children)child.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
