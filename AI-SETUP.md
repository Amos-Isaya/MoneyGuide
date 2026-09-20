Local live verification (2026-09-20): the saved server-side key was loaded, the retired model returned HTTP 410, and the backend was updated to Nemotron 3 Super with chat_template_kwargs.enable_thinking=false. A real browser question received HTTP 200 and its NVIDIA answer appeared in chat with no JavaScript errors. Earlier missing-key/test-only findings below describe the previous setup. Open http://localhost:3000 while the server is running. Model request reference: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/deploy

For local, Vercel, and GitHub Pages API routing, see [Backend setup and diagnosis](BACKEND-SETUP.md). GitHub Pages can now call a separate backend using the public API_BASE_URL in js/config.js and the server MONEYGUIDE_ALLOWED_ORIGINS allowlist.

# Ask MoneyGuide on the homepage

The floating coach now opens directly on the homepage for guests and saved profiles. See [setup, diagnostics and verification](ASK-MONEYGUIDE.md). On Windows run `.\start-moneyguide.cmd`, configure the server-only `NVIDIA_API_KEY` in `.env.local`, and use http://localhost:3000. The normal server never uses simulated AI answers.

# MoneyGuide

Financial literacy for students, built with plain HTML, CSS and JavaScript. The current redesigned homepage, browser-saved onboarding, ten learning modules, progress and certificates are retained. The calculator and Nemotron coach are integrated into the newer dashboard.

## Plans and AI Coach

**Your MoneyGuide Plan** appears below the dashboard learning cards. It reuses the saved goal, currency and knowledge level. An optional new calculator collects monthly take-home income, total expenses, savings target and existing savings. **Try demo numbers** uses synthetic amounts in the selected currency: 2,000 income, 1,500 expenses, 3,000 target.

MoneyGuide calculates a scenario saving 80% of a positive remainder and keeping 20% as a buffer. The unfunded target divided by monthly savings is rounded up to whole months. Zero contribution gives no funded timeline; a covered target gives zero months. Arithmetic uses integer hundredths, with amounts displayed to two decimals for consistent scenario precision. Assumptions: stable income/expenses, regular contributions and no interest, fees or inflation. This is an illustrative starting point, not an affordability recommendation.

**Build my personalized plan** sends a request only when clicked. NVIDIA Nemotron explains results, tradeoffs and up to three next actions. It is the explanation layer; all exact calculations run in application code. Without numbers, it generates a learning plan from the saved goal. **Explain My Plan** requests reasons and assumptions. Actions link only to the calculator, target input, Budgeting module or onboarding.

Beginner explanations use simple language and examples. Intermediate adds terminology and tradeoffs. Advanced explores assumptions and supplied ratios. Advanced is now available in onboarding. Use **Adjust My Goal**, then **Start Learning**, to update the saved profile.

**Ask MoneyGuide** is a secondary button at the bottom right of the dashboard. Its native dialog supports focus management, Escape, suggested questions, loading/errors and New conversation. It includes current context and up to four recent exchanges. The conversation and financial inputs stay in page memory only; refresh or navigation clears them. Editing calculated numbers clears stale guidance and conversation.

## Architecture and files

Browser → POST /api/moneyguide → NVIDIA hosted chat completions → validated explanation → browser.

- index.html, dashboard.html, css/style.css: existing UI plus new calculator, plan and coach.
- js/app.js: existing profile persistence, onboarding and previews; now accepts Advanced.
- js/finance.js: shared deterministic calculations and allowed profile/action values.
- js/ai.js: calculator, minimal context, AI requests and session conversation.
- api/moneyguide.js: Vercel Node function; validates input, recomputes summaries, handles provider errors/timeouts and validates output.
- scripts/dev.mjs: dependency-free local server using the same handler; serves only public app files.
- tests/moneyguide.test.js: calculations, validation and mocked API regression tests.
- package.json, vercel.json, .env.example, .gitignore: setup and deployment configuration.

The saved profile (firstName, currency, goal, knowledge) stays in localStorage under moneyguide.profile. AI receives only goal, knowledge, currency, optional numeric inputs and recent chat. The server recomputes financial summaries before sending them to NVIDIA. No first name, full profile, database or application-side prompt logging is sent/added.

## Run locally

Install Node.js 22 or newer. There are no npm runtime dependencies to install.

1. Run: Copy-Item .env.example .env.local
2. Edit .env.local and replace the placeholder key.
3. Run: npm run dev
4. Open http://localhost:3000 and complete onboarding. Ctrl+C stops the server.

Keep the same host and port to reuse browser storage. The original Python static server still runs the pages and calculator, but cannot serve AI requests.

Get a key by signing into [NVIDIA Build](https://build.nvidia.com/), opening the [Nemotron model](https://build.nvidia.com/nvidia/llama-3_3-nemotron-super-49b-v1_5) and following Get API Key. Confirm hosted model access and account usage limits there.

| Variable | Purpose |
| --- | --- |
| NVIDIA_API_KEY | Required server-side key for live AI. Never use a browser/public prefix. |
| NVIDIA_MODEL | Optional override; default nvidia/nemotron-3-super-120b-a12b. |
| PORT | Optional local port; default 3000. |

The backend uses NVIDIA's [hosted API](https://docs.api.nvidia.com/nim/re/reference/llm-apis). Model availability depends on the account. Calculators and mocked tests require no API key.

## Verification

Run npm run check and npm test.

1. Onboard as Beginner, choose Buy a car, and try demo numbers. Verify savings 400/month, buffer 100 and 8 months.
2. Build the plan and Explain My Plan. Confirm assumptions and working actions. Repeat with Intermediate and Advanced; calculations should remain identical.
3. Open Ask MoneyGuide, send a suggestion, follow up and start a new conversation. Test Escape, Tab and mobile widths.
4. Enter expenses greater than income: verify a shortfall and no funded timeline. Set saved equal to target: verify Target covered. Edit a calculated input: stale guidance should disappear.
5. Test fallback: remove NVIDIA_API_KEY from .env.local and restart npm run dev. Calculations should still work; Build, Explain and Send should show friendly errors. An invalid key tests provider failure. Restore the key and restart to retry.

Automated tests mock NVIDIA and cover validation and provider failures. Successful real-provider responses require a configured API key and quota.

## Vercel deployment

This remains a static frontend plus a [Vercel Node.js function](https://vercel.com/docs/functions/runtimes/node-js) in api/. No framework migration or build is needed.

After local review, deploy through your Vercel project or run npx vercel from this directory. Choose framework Other, leave Build Command unset, use the root as output directory, and select Node.js 22 or newer. This implementation does not deploy, commit or push anything.

In Vercel Project → Settings → Environment Variables, add NVIDIA_API_KEY for Preview and/or Production, optionally NVIDIA_MODEL, then redeploy to apply the values. Do not upload a real .env.local. Test onboarding, calculator, plan, explanation and coach on the deployment. Provider timeout is 45 seconds; function duration is 60 seconds.

## Privacy and operating limits

The key exists only in the server environment and outbound NVIDIA Authorization header. Secret .env files are ignored except the placeholder example. AI requests are uncached. Requests use a strict field allowlist and limits of 20 KB, 1,000 question characters and eight history messages. A best-effort filter rejects common credential, email and account/card patterns. It cannot identify all personal information: use synthetic numbers and never paste identifying details or secrets. NVIDIA processes submitted context under its applicable terms and privacy policy.

AI output is rendered through textContent and action IDs map to app-owned destinations. Instructions require supportive education, assumptions and uncertainty, and prohibit guarantees or speculative investment promises. AI can make mistakes; review guidance and seek a qualified professional when appropriate.

This prototype has no authentication or durable rate limiter. Before broad public use, configure Vercel Firewall rate limiting/deployment protection and NVIDIA usage limits to manage spend. The origin check is not authentication or bot protection. Never add a shared secret to frontend code as a substitute.
