Reliability update (2026-09-20): intermittent NVIDIA HTTP 503 failures now receive up to two retries within the existing 45-second deadline. Chat preserves completed plain-text NVIDIA answers when the optional JSON envelope is missing; malformed JSON and invalid actions are still rejected, and plan/explain responses remain strict. A real Chrome browser conversation with the Intermediate / Build credit / USD profile displayed three consecutive NVIDIA replies (HTTP 200), with no browser errors. All 13 automated tests and script syntax checks passed. The server-side key is configured locally.

Local live verification (2026-09-20): the saved server-side key was loaded, the retired model returned HTTP 410, and the backend was updated to Nemotron 3 Super with chat_template_kwargs.enable_thinking=false. A real browser question received HTTP 200 and its NVIDIA answer appeared in chat with no JavaScript errors. Earlier missing-key/test-only findings below describe the previous setup. Open http://localhost:3000 while the server is running. Model request reference: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/deploy

# MoneyGuide backend integration and deployment

## Diagnosis

This is a plain HTML/CSS/JavaScript project, not React or Vite. Send is handled by js/coach.js; plans use js/ai.js. Both call js/ai-client.js and the existing api/moneyguide.js NVIDIA handler.

The quoted error came from trying /api/moneyguide on a static host. Before this repair, the client always used that relative URL and the backend rejected every cross-origin request; it also had no OPTIONS support. This was a frontend routing and backend CORS/deployment problem. A separate configuration problem remains locally: .env.local has no usable NVIDIA key. The running backend was tested with "How can I save $3,000?" and returned 503 AI_NOT_CONFIGURED.

The existing chat design, Send behavior, recent conversation, financial context, calculator, personalized plans, and explanations are preserved. No UI files were changed in this repair. No commit, push, branch or deployment was performed.

## Local testing

1. Put your NVIDIA-issued key in the ignored .env.local file as NVIDIA_API_KEY. The example text is not a key. Never send it to browser code.
2. Leave API_BASE_URL empty in js/config.js.
3. Run npm run dev with Node.js 22+; there are no runtime packages to install. On this Windows computer, .\start-moneyguide.cmd also works with the existing bundled Node runtime. Stop any already running local server before starting another on the same port. Restart after changing .env.local.
4. Open http://localhost:3000. PORT may override 3000. VS Code Live Server, direct HTML opening and Python static servers do not execute the API.
5. Ask "How can I save $3,000?" and inspect the displayed response or diagnostic code.

## Vercel backend and GitHub Pages frontend

Deploy the existing project root to Vercel as a framework Other project, using Node.js 22 or newer, no build command, and the project root as the output directory. Keep api/moneyguide.js and its js/finance.js dependency in the deployment. The existing vercel.json gives the function 60 seconds. Do not copy only the HTML assets. Vercel supports this API directory/default handler format: https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration

Set these variables in the Vercel environment receiving your deployment, then redeploy:

| Variable | Value |
| --- | --- |
| NVIDIA_API_KEY | Your real NVIDIA-issued key, server-side only |
| NVIDIA_MODEL | Optional; default nvidia/nemotron-3-super-120b-a12b |
| MONEYGUIDE_ALLOWED_ORIGINS | https://amos-isaya.github.io |

The allowed origin does NOT include /MoneyGuide/ or a trailing slash. Multiple explicitly trusted origins can be comma-separated. Unlisted origins, opaque/null origins, unsupported preflight methods and headers are rejected. No wildcard or credentialed CORS is enabled. Same-origin requests continue to work without the allowlist.

After Vercel supplies the real production URL, set this public value in js/config.js on the frontend:

    export const API_BASE_URL = 'https://YOUR-ACTUAL-PROJECT.vercel.app';

That is an example, not an existing deployment. Use only the origin, without /api or query parameters. Publish that configuration with your GitHub Pages files when you are ready. The frontend then sends POST https://YOUR-ACTUAL-PROJECT.vercel.app/api/moneyguide. The API deployment must be publicly reachable from the browser; a Vercel login/protection page is not an API response.

For an all-in-one Vercel deployment, leave API_BASE_URL empty: POST /api/moneyguide is correct. For a separate local frontend, you may set a loopback backend URL and explicitly allow the frontend origin in MONEYGUIDE_ALLOWED_ORIGINS.

Do not set VITE_API_BASE_URL: this project has no Vite build and would not read it. Its equivalent public setting is API_BASE_URL in js/config.js. Never use VITE_NVIDIA_API_KEY.

## NVIDIA request and context

The reused handler POSTs to https://integrate.api.nvidia.com/v1/chat/completions, with server-only Bearer authorization, JSON content type, the configured model, system/context/history/user messages, stream:false and a 45-second timeout. It reads choices[0].message.content, validates the JSON insight/steps, and returns those fields. Chat renders them as text. The /no_think system setting matches the model documentation: https://docs.api.nvidia.com/nim/reference/nvidia-llama-3_3-nemotron-super-49b-v1_5

Node loads .env.local at startup via --env-file-if-exists. Vercel supplies process.env from its environment settings. The key is used only by the server; it is excluded from returned data and diagnostics. Secret environment files are ignored by Git; .env.example has placeholders only.

Context still includes only goal, knowledge level, currency, optional budget inputs and up to four successful recent exchanges. The server recomputes the budget summary. Names, full profiles and unrelated storage are not transmitted. Existing educational guidance and assumptions remain in place.

## Verification and limits

All 12 unit/API/learning-progress tests and application syntax checks pass. The focused tests/api-browser.test.cjs passed with an actual separate frontend and API: browser OPTIONS returned 204, POST returned 200, the backend made the expected NVIDIA request, and the returned answer appeared in chat. No browser network requests were intercepted. Only the external NVIDIA transport was replaced by a test fixture. The larger coach browser rerun encountered a page-load timeout; prior same-origin coach checks passed. The fixture is never used by the normal server.

A live NVIDIA response has NOT been verified: the current local server returns AI_NOT_CONFIGURED. A deployed Vercel endpoint has NOT been verified because no backend deployment URL was supplied. Remaining owner steps: provide a valid key; restart and test locally; for GitHub Pages, deploy/configure Vercel and set the actual public API_BASE_URL before publishing.

## Files changed in this repair

- js/config.js and js/api-url.js: public backend origin and validated endpoint selection.
- js/ai-client.js: shared configurable request route and development-only diagnostic codes.
- api/moneyguide.js: exact-origin CORS and OPTIONS handling, retaining the existing NVIDIA integration.
- .env.example: documented server CORS setting.
- package.json and tests/api-routing.test.js: route/CORS regression checks.
- tests/coach-server.mjs, tests/coach-browser.test.cjs, and tests/api-browser.test.cjs: real cross-origin browser verification with an isolated provider fixture.
- BACKEND-SETUP.md, README.md, AI-SETUP.md: setup and diagnosis documentation.

No changes were needed to vercel.json, .gitignore, the HTML or CSS.

## Temporary provider failures

NVIDIA returned intermittent HTTP 503 responses during real use on 2026-09-20. The backend now retries HTTP 502/503/504 up to twice, with 0.5 and 1 second delays, within the existing 45-second total deadline. Authentication failures, invalid model configuration and rate limits are not retried. Automated tests cover recovery on the third attempt and failure after all three attempts. Retries improve resilience but cannot guarantee availability during a provider outage.
