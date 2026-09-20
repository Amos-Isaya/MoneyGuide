import test from 'node:test';
import assert from 'node:assert/strict';
import { moneyGuideEndpoint } from '../js/api-url.js';
import handler from '../api/moneyguide.js';
const local={protocol:'http:',hostname:'localhost'};
test('API URL supports local, Vercel and GitHub Pages without guessing a backend',()=>{
 assert.equal(moneyGuideEndpoint('',local),'/api/moneyguide');
 assert.equal(moneyGuideEndpoint('',{protocol:'https:',hostname:'moneyguide.vercel.app'}),'/api/moneyguide');
 assert.equal(moneyGuideEndpoint('https://moneyguide.vercel.app/',{protocol:'https:',hostname:'amos-isaya.github.io'}),'https://moneyguide.vercel.app/api/moneyguide');
 assert.equal(moneyGuideEndpoint('http://127.0.0.1:3102',local),'http://127.0.0.1:3102/api/moneyguide');
 assert.throws(()=>moneyGuideEndpoint('',{protocol:'https:',hostname:'amos-isaya.github.io'}),/API_BASE_URL/);
 for(const base of ['http://example.com','https://name:secret@example.com','https://example.com/api/chat','https://example.com?key=secret','javascript:alert(1)','invalid']) assert.throws(()=>moneyGuideEndpoint(base,local));
});
async function call(method,headers={}) {
 const req={method,headers:{host:'backend.vercel.app','x-forwarded-proto':'https','content-type':'application/json',...headers},body:{mode:'chat',question:'How can I save $3,000?',context:{goal:'Start saving',knowledge:'Beginner',currency:'USD',budget:null},history:[]}};
 const res={headers:{},setHeader(k,v){this.headers[k]=v},end(text){this.body=text?JSON.parse(text):null}};
 await handler(req,res);return res;
}
test('CORS allows exact configured origin, preflight and readable backend errors; rejects other origins',async()=>{
 const previous=process.env.MONEYGUIDE_ALLOWED_ORIGINS,key=process.env.NVIDIA_API_KEY;
 try {
  process.env.MONEYGUIDE_ALLOWED_ORIGINS='https://amos-isaya.github.io,http://localhost:5500';delete process.env.NVIDIA_API_KEY;
  const headers={origin:'https://amos-isaya.github.io','access-control-request-method':'POST','access-control-request-headers':'content-type'};
  const preflight=await call('OPTIONS',headers);
  assert.equal(preflight.statusCode,204);assert.equal(preflight.body,null);
  assert.equal(preflight.headers['Access-Control-Allow-Origin'],headers.origin);
  assert.equal(preflight.headers['Access-Control-Allow-Credentials'],undefined);
  assert.equal(preflight.headers['Access-Control-Allow-Headers'],'Content-Type');
  const response=await call('POST',{origin:headers.origin});
  assert.equal(response.statusCode,503);assert.equal(response.body.code,'AI_NOT_CONFIGURED');assert.equal(response.headers['Access-Control-Allow-Origin'],headers.origin);
  assert.equal((await call('POST',{origin:'https://backend.vercel.app'})).statusCode,503);
  for(const origin of ['https://evil.test','https://amos-isaya.github.io.evil.test','null','https://amos-isaya.github.io/MoneyGuide/']) {
   const rejected=await call('OPTIONS',{...headers,origin});assert.equal(rejected.statusCode,403);assert.equal(rejected.headers['Access-Control-Allow-Origin'],undefined);
  }
  assert.equal((await call('OPTIONS',{...headers,'access-control-request-method':'DELETE'})).statusCode,405);
  assert.equal((await call('OPTIONS',{...headers,'access-control-request-headers':'authorization'})).statusCode,400);
  assert.equal((await call('OPTIONS')).statusCode,403);
  delete process.env.MONEYGUIDE_ALLOWED_ORIGINS;
  assert.equal((await call('POST',{origin:headers.origin})).statusCode,403);
 }finally{if(previous===undefined)delete process.env.MONEYGUIDE_ALLOWED_ORIGINS;else process.env.MONEYGUIDE_ALLOWED_ORIGINS=previous;if(key===undefined)delete process.env.NVIDIA_API_KEY;else process.env.NVIDIA_API_KEY=key;}
});
