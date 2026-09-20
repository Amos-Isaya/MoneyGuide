// Public backend address for the GitHub Pages website. Never put credentials here.
// Local development and Vercel continue using their same-origin API.
export const API_BASE_URL = globalThis.location?.hostname === 'amos-isaya.github.io'
  ? 'https://money-guide.vercel.app'
  : '';
