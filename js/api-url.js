import { API_BASE_URL } from './config.js';

export function moneyGuideEndpoint(base = API_BASE_URL, page = globalThis.location) {
  if (typeof base !== 'string') throw new Error('API_BASE_URL must be a public backend URL.');
  if (!base.trim()) {
    if (page.protocol === 'file:') throw new Error('Run npm run dev and open http://localhost:3000. Opening HTML directly does not run the backend.');
    if (page.hostname.endsWith('.github.io')) throw new Error('Set API_BASE_URL in js/config.js to your deployed Vercel backend URL, then publish that configuration. GitHub Pages cannot run /api/moneyguide.');
    return '/api/moneyguide';
  }
  let url;
  try { url = new URL(base.trim()); } catch { throw new Error('API_BASE_URL must be a full HTTPS backend origin, such as https://your-project.vercel.app.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('API_BASE_URL must contain only the HTTPS backend origin, without credentials, a path, query, or fragment. HTTP is allowed only for local development.');
  }
  return url.origin + '/api/moneyguide';
}
