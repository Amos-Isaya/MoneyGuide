Local live verification (2026-09-20): the saved server-side key was loaded, the retired model returned HTTP 410, and the backend was updated to Nemotron 3 Super with chat_template_kwargs.enable_thinking=false. A real browser question received HTTP 200 and its NVIDIA answer appeared in chat with no JavaScript errors. Earlier missing-key/test-only findings below describe the previous setup. Open http://localhost:3000 while the server is running. Model request reference: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/deploy

# Ask MoneyGuide: local setup and verification

The homepage now has a fixed bottom-right Ask MoneyGuide bubble and the same coach is available on the dashboard. It uses the existing NVIDIA Nemotron handler, including personalized plans and explanations. No production chatbot responses are simulated.

## Why answers were missing

The screenshot reports a missing backend: a static preview server or GitHub Pages does not execute /api/moneyguide. In this workspace there was also no .env.local file or NVIDIA_API_KEY in the process environment. The old chat added the question only after a successful response, which made failures look unresponsive.

## Run on this Windows computer

1. Open .env.local in the project root (created from .env.example). Replace the NVIDIA_API_KEY placeholder with your NVIDIA key. Do not put it in JavaScript or commit it.
2. Stop the existing MoneyGuide server with Ctrl+C and run:

    .\start-moneyguide.cmd

3. Open http://localhost:3000. Do not use Live Server, a Python static server, or GitHub Pages for AI testing.

The launcher uses installed Node.js or the existing bundled runtime on this computer. With Node.js 22+ on PATH, npm run dev is equivalent. Restart after changing .env.local. NVIDIA_MODEL is optional and retains the existing Nemotron default. Get a key through https://build.nvidia.com/ and verify your account has access to the model.

## Request flow and privacy

Home and dashboard coach -> shared js/ai-client.js -> same-origin POST /api/moneyguide -> server-side NVIDIA chat completions -> validated insight and action IDs -> textContent in the chat. The existing /no_think Nemotron setting is retained as documented at https://docs.api.nvidia.com/nim/reference/nvidia-llama-3_3-nemotron-super-49b-v1_5.

Only the selected goal, knowledge level, currency, optional budget inputs, and up to four recent successful exchanges are sent. The server recalculates the financial summary. First name and full browser profiles are excluded. Guests get beginner guidance without onboarding. Conversation stays in page memory across close/reopen and clears on refresh, navigation, clear, or changed financial context.

Error codes identify missing key, invalid credentials/model access, rejected model/request, rate limits, unavailable provider, malformed/incomplete output, network failure and timeout. Server diagnostics contain only codes/statuses, never keys, questions or financial data.

## Verification

Syntax and all 10 API/calculation/learning-progress tests pass. tests/coach-browser.test.cjs starts real HTTP servers and exercises the real backend handler; only its outbound NVIDIA transport is stubbed in the test fixture. It checks request payloads, returned answers displayed in chat, multiple turns, profile privacy, immediate user messages, loading/disabled Send, Enter, suggested questions, close/reopen, clear/cancellation, plan/explanation regressions, currency changes, static-server and missing-key errors, themes, mobile/short-screen layout and browser errors.

The local production endpoint was also called directly and returned HTTP 503 with AI_NOT_CONFIGURED, confirming that the backend runs but lacks credentials. A real NVIDIA answer cannot be verified until the key is saved and the server restarted. Test fixture responses are never used by the normal server.

## Files changed for this request

index.html, dashboard.html, css/ai.css, js/coach.js, js/ai-client.js, js/ai.js, api/moneyguide.js, scripts/dev.mjs, start-moneyguide.cmd, tests/moneyguide.test.js, tests/coach-server.mjs, tests/coach-browser.test.cjs, tests/ai-browser.test.cjs, tests/cards.test.cjs, README.md, AI-SETUP.md, and this report. The ignored .env.local contains a setup placeholder until you configure it. No commit, push or branch was created.
