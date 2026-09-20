// Test-only server: reuse the production handler; stub only outbound NVIDIA traffic.
import { writeFileSync, appendFileSync } from 'node:fs';
import http from 'node:http';
import { syncBuiltinESMExports } from 'node:module';
const marker = process.env.COACH_TEST_MARKER;
const publicApi = process.env.COACH_TEST_API_BASE;
const create = http.createServer;
http.createServer = function(listener) {
  return create.call(this, (req, res) => {
    if (marker && req.method === 'OPTIONS') res.once('finish', () => appendFileSync(marker + '.cors', JSON.stringify({method:req.method,origin:req.headers.origin,status:res.statusCode}) + '\n'));
    if (publicApi && req.url === '/js/config.js') {
      res.writeHead(200, {'Content-Type':'text/javascript'});
      return res.end('export const API_BASE_URL = ' + JSON.stringify(publicApi) + ';');
    }
    return listener(req, res);
  });
};
syncBuiltinESMExports();
if (marker) {
  writeFileSync(marker, '');writeFileSync(marker + '.cors', '');
  process.env.NVIDIA_API_KEY = 'test-only-not-a-real-key';
  globalThis.fetch = async (url, options) => {
    if (url !== 'https://integrate.api.nvidia.com/v1/chat/completions') throw new Error('Unexpected provider URL');
    const payload = JSON.parse(options.body);
    appendFileSync(marker, JSON.stringify({url,method:options.method,payload})+'\n');
    await new Promise(resolve => setTimeout(resolve, 700));
    return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({insight:'An emergency fund helps cover unexpected expenses. Start with a manageable savings habit and review your essential costs.',steps:[{text:'Explore your monthly savings scenario.',action:'budget'}]})}}]})};
  };
} else delete process.env.NVIDIA_API_KEY;
await import('../scripts/dev.mjs');
