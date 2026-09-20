Local live verification (2026-09-20): the saved server-side key was loaded, the retired model returned HTTP 410, and the backend was updated to Nemotron 3 Super with chat_template_kwargs.enable_thinking=false. A real browser question received HTTP 200 and its NVIDIA answer appeared in chat with no JavaScript errors. Earlier missing-key/test-only findings below describe the previous setup. Open http://localhost:3000 while the server is running. Model request reference: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/deploy

For local, Vercel, and GitHub Pages API routing, see [Backend setup and diagnosis](BACKEND-SETUP.md). GitHub Pages can now call a separate backend using the public API_BASE_URL in js/config.js and the server MONEYGUIDE_ALLOWED_ORIGINS allowlist.

# Ask MoneyGuide on the homepage

The floating coach now opens directly on the homepage for guests and saved profiles. See [setup, diagnostics and verification](ASK-MONEYGUIDE.md). On Windows run `.\start-moneyguide.cmd`, configure the server-only `NVIDIA_API_KEY` in `.env.local`, and use http://localhost:3000. The normal server never uses simulated AI answers.

# MoneyGuide

## Current version with NVIDIA Nemotron

This workspace now uses the newer GitHub Pages design from commit e8ca176 (the version at https://amos-isaya.github.io/MoneyGuide/), including its ten modules, progress, certificates, language selection, and light/dark themes. The existing Nemotron backend and calculator have been integrated into that version.

Open the homepage AI Coach card or the dashboard AI Coach navigation link for your monthly calculator, personalized plan, explanations, and Ask MoneyGuide conversation. AI controls and guidance are currently in English. Currency changes clear the calculator and previous guidance; selecting a currency does not convert amounts.

Run with Node.js 22+: copy .env.example to .env.local, set NVIDIA_API_KEY there, run npm run dev, and open http://localhost:3000. Opening index.html directly shows the newer homepage, but AI requires the server. Run npm run check and npm test to verify the application and learning-progress logic.

GitHub Pages serves static files and cannot execute api/moneyguide.js. To use live Nemotron, deploy this complete project to Vercel and configure the server-side NVIDIA_API_KEY, or run the local server. Updating local files does not publish changes to GitHub Pages. See [AI setup and backend details](AI-SETUP.md).

— Financial literacy learning MVP

MoneyGuide is a plain HTML, CSS, and JavaScript project. The existing homepage and onboarding are preserved. The dashboard now connects ten open learning modules, practice checks, flashcards, assessments, progress, and printable certificates. There are no runtime dependencies.

## Open the project

1. Open this `moneyguide` folder in VS Code.
2. Choose **Terminal → New Terminal**.
3. Run `npm run dev` with Node.js 22 or newer. Configure `.env.local` as described above for live AI.
4. Open **http://localhost:3000** in Chrome.
5. Keep the terminal running. Press **Ctrl+C** to stop it.

If that address already shows MoneyGuide, the server is already running. If the port is occupied by a different app, use another port and open its matching address. Use the same address and port when you return: `localhost` and `127.0.0.1` have separate browser storage. A local Python file server is not a Flask backend. Double-clicking HTML is less reliable because browser storage rules for `file://` vary.

## Project map

| File | Purpose |
| --- | --- |
| `account.html` | Registration and login UI for the clearly labeled browser-local demo. |
| `js/auth.js` | Demo account provider, salted verifier, tab sessions, logout, and frontend route checks; replace with real backend authentication later. |
| `js/account.js` | Form validation, password visibility, errors, and success navigation. |
| `css/experience.css` | Account layouts and additive scene/transition styles using the existing palette. |
| `assets/payments-scene.svg`, `assets/growth-scene.svg` | Original lightweight payment and financial-growth backgrounds. |
| `tests/auth.test.cjs`, `tests/auth-helper.cjs` | Account, logout, preservation, scene, and responsive checks plus shared registration test helper. |
| `index.html` | Three-chapter homepage, coins-and-plant hero, and onboarding form. |
| `dashboard.html` | Dashboard with shared top navigation, ten modules, practice, tools, progress, and certificates. |
| `module.html` | One reusable page for all ten learning modules. `?id=7` opens Investing Basics, for example. |
| `certificate.html` | Displays an earned certificate for the module in `?id=`. |
| `css/style.css` | Shared design, responsive layouts, lesson styles, and print formatting. |
| `css/cards.css` | Large navigation cards, module/certificate/tool states, outline-icon sizing, focus and reduced-motion styles. |
| `css/tools.css` | Responsive calculator dialogs, input fields, result charts, and schedule tables. |
| `js/calculators.js` | Pure savings, budget, compound-interest, loan, and conversion formulas. |
| `js/tools.js` | Connects tool cards to interactive forms, translated results, reset controls, and visual breakdowns. |
| `tests/calculators.test.cjs` | Dependency-free numerical checks for formulas and edge cases. |
| `tests/tools.test.cjs` | Chrome checks for all five tools, validation, mobile layouts, languages, themes, and unchanged learning progress. |
| `css/polish.css` | Final visual layer: both themes, sticky header, homepage chapters, footer, and responsive learning surfaces. |
| `js/appearance.js` | Restores the saved theme before the page paints; defaults to dark. |
| `js/shell.js` | Builds the shared navigation/footer and handles mobile menu, profile, currency, theme, and information dialogs. |
| `js/home.js` | Displays real learning recommendations, progress, and certificate previews using the existing saved store. |
| `js/cinematic.js` | Four-background hero controller and IntersectionObserver-driven scene reveals/navigation states. |
| `css/cinematic.css` | Homepage scene palettes, masked headings, card entrances, responsive layouts, and reduced-motion rules. |
| `tests/cinematic.test.cjs` | Chrome checks for image loading, crossfades, manual pause, scene navigation, responsive layouts, and observer fallback. |
| `js/app.js` | Existing profile validation, onboarding, saving answers, and dialog controls; preserves a clicked feature destination through onboarding. |
| `js/cards.js` | Original SVG outline icons and accessible Coming Soon preview dialogs. |
| `js/modules.js` | All ten modules: introductions, objectives, 30 lessons/checks, 100 flashcards, 100 final questions with explanations, and reading sources. |
| `js/progress.js` | Reads/saves progress and applies completion, scoring, XP, and certificate rules. |
| `js/i18n.js` | English, Spanish, and French interface text and translated module titles. |
| `js/learning.js` | Displays dashboard, lesson, flashcard, assessment, and certificate screens using the content and saved progress. |
| `assets/financial-growth.webp`, `assets/financial-growth-small.webp` | Optimized desktop and mobile versions of the licensed coins-and-plant photograph. |
| `assets/fonts/Manrope.ttf`, `assets/fonts/OFL.txt` | Locally hosted open-source font and its license. |
| `assets/students.jpg` | Retained older photograph; no longer displayed. |
| `assets/README.md` | Image credit, license link, and design attribution notes. |
| `tests/progress.test.cjs` | Dependency-free automated tests of content structure and progress rules. |
| `tests/browser.test.cjs` | Optional end-to-end Chrome checks using an external Playwright installation. |
| `tests/cards.test.cjs` | Optional Chrome checks for card routing, keyboard focus, tool/AI notices, languages, and responsive layouts. |
| `tests/shell.test.cjs` | Optional Chrome checks for preferences, mobile navigation, profile editing, footer, and quiz preservation. |
| `README.md` | This guide. |

Think of HTML as the page structure, CSS as its appearance, and JavaScript as its behavior. Educational content, translations, and saved-data rules are separate so you can edit one without rewriting the others.

## Large interactive cards

The homepage follows the requested Discover, Learn, Practice, Tools, Progress, and Achieve scenes, with the original About content after Discover and the final call to action before the footer. Its related charcoal, navy, and deep-green surfaces guide the journey. The original six feature cards remain, with dedicated scenes linking to existing practice, all five working tools, actual saved progress, and certificates. Light mode uses complementary warm, pale surfaces while retaining the cinematic dark hero. Manrope is hosted locally.

The shared sticky top navigation replaces the sidebar on all four pages. Home and About lead to the landing page; Learn, Practice, Tools, Progress, and Certificates link to the corresponding dashboard section. The current destination is marked, and the header subtly changes after scrolling. Below 1,200px it becomes an expandable hamburger menu with keyboard support. Language, currency, theme, and profile controls remain available inside it.

The six large feature cards are Learn, Practice, Money Tools, Progress, Certificates, and AI Learning Coach. Learn receives one restrained jade accent treatment. The other cards share thin borders, original outline icons, generous spacing, and large arrows. The entire available card is a normal link, including its arrow. First-time learners complete onboarding before reaching their chosen destination. Returning learners go directly there. Practice opens the existing flashcards and assessments.

The ending has three layers: a final learning call to action; a five-column directory of platform, learning, tools, resources, and language links; and a slim copyright/disclaimer/legal bar. Contact information is honestly marked coming soon. Privacy, terms, help, and accessibility buttons open concise prototype information dialogs.

Module cards display real saved status and progress, with distinct recommended, active, and completed treatments. Certificate cards cover all ten modules: earned ones link to the certificate and show its date and score; unearned ones explain the 80% requirement and link to the module. Progress uses four major metric cards for completed modules, certificates, XP, and level, followed by overall activity progress.

Five standalone financial tools work locally. The monthly planner and conversational coach retain the NVIDIA Nemotron backend integration. Browser-local demo accounts are not secure authentication. Live AI uses the configured Vercel backend; see BACKEND-SETUP.md.

Hover and keyboard focus subtly shift the arrow and brighten the border. Keyboard focus is visible, dialogs close with Escape and restore focus, and reduced-motion preferences remove movement. Card labels are translated into English, Spanish, and French. All icons are original inline SVG with a shared stroke weight, not a dependency or an external image request.

To run the card checks using the same optional test environment:

```sh
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/cards.test.cjs
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/shell.test.cjs
```

## Progress and access

All ten modules are available from the start. The recommended path is 1–10, but nothing stops a learner starting Module 7 first. Continue Learning selects the most recently visited unfinished module, or the next unfinished one. Module pages remain accessible after completion.

A module's learning content includes 17 activities:

- 3 lessons, each with a **Mark lesson complete** button.
- 3 knowledge checks, each completed after a correct answer. Wrong answers show an explanation and can be retried.
- 10 flashcards, each completed after revealing its definition at least once.
- 1 summary, completed with **Mark summary read**.

The assessment is the 18th overall progress activity. A score of 8/10 or higher completes that activity. Overall progress is completed activities divided by 180 across ten modules. Module completion requires all 17 learning activities plus a passing assessment. Thus partial work can raise overall progress before the completed-module count increases.

Statuses show Not Started, In Progress, and Certificate Earned after completion. Lesson buttons also show Completed. Completed modules stay complete when a later retake scores lower.

## XP and levels

Each distinct activity earns XP only once. Revisiting a page or repeating an activity cannot add duplicate XP.

| Activity | XP |
| --- | ---: |
| Complete one lesson | 10 |
| Correctly finish one knowledge check | 5 |
| Reveal one flashcard | 2 |
| Pass a module assessment for the first time | 50 |
| Complete the entire module | 50 |

Maximum: **165 XP per module**, **1,650 XP total**. Reading the summary is required but adds no separate XP. XP is recalculated from completed activities, and its total and current level are saved with progress.

| Level | Name | Starting XP |
| --- | --- | ---: |
| 1 | Money Starter | 0 |
| 2 | Money Explorer | 300 |
| 3 | Money Builder | 650 |
| 4 | Money Strategist | 1,000 |
| 5 | Money Master | 1,400 |

## Assessments

Each module has ten authored multiple-choice questions mixing situations, decisions, and calculations. Questions appear one at a time. Answers and the current question are saved as you go. After a refresh, use **Continue Assessment**.

All questions must be answered before submission. Each correct answer is one point: **8/10 = 80% = pass**. Results include your answer, the correct answer, and an explanation for each question. There are unlimited retakes and no XP penalty for a lower score. The best score remains saved. A test can be taken before lessons, but passing alone cannot earn a certificate.

## Certificates

The app awards a certificate automatically once both learning content and the passing-score requirement are satisfied, in either order. It saves the learner's name, module, date, qualifying score, and unique ID. Existing certificates retain their original name/date/score when the profile changes or a test is retaken.

The dashboard lists earned certificates. **Print Certificate** opens the browser's print dialog. **Download / Save as PDF** opens the same dialog: choose **Save as PDF** as the destination. No separate PDF library is needed. The print stylesheet hides navigation and formats a landscape certificate.

These are prototype learning milestones, not accredited qualifications. Because all data and scoring are local, they are not independently verified credentials.

## Languages and currency

Use the language selector on any page. `i18n.js` contains a simple key-to-translation dictionary for navigation, controls, headings, module titles, progress, assessment instructions, and certificate wording. The choice persists independently of currency.

The lessons, examples, question text, explanations, and vocabulary remain **English** in this version; a visible notice explains this. Their content is centralized in `modules.js` so translated content can be added later. To add an interface language, add its translations and title list in `i18n.js`, and options in the shared shell’s language controls.

The onboarding currency stays saved and is displayed on the dashboard. The top navigation can update it without resetting a lesson or quiz. Language, currency, and theme preferences are separate. Examples explicitly use fictional money units; changing language does not convert prices or change currency. The currency tool converts using a rate entered by the learner; there is no live exchange-rate service.

## Browser storage

The project uses these localStorage keys:

- `moneyguide.profile`: existing first name, currency, financial goal, and knowledge level. Its format is preserved.
- `moneyguide.language`: interface language (`en`, `es`, or `fr`).
- `moneyguide.theme`: `dark` (default) or `light`.
- `moneyguide.currency`: guest currency preference before onboarding; a saved learner uses the existing profile’s currency field.
- `moneyguide.learning.v1`: per-module activities, current assessment answers, latest results, best scores, certificates, last visited module, XP, and level.

JavaScript objects become text through `JSON.stringify()` and return to objects through `JSON.parse()`. Data survives refreshes and browser restarts on the same browser/profile/origin. It does not sync to other devices and is not sent to a backend. Clearing site data removes it. Private browsing may remove it when the session closes.

Failed writes show an error and roll back the attempted in-memory change. Damaged learning JSON is left untouched and further writes are blocked instead of silently erasing progress. A missing demo session routes learners to registration/login. A signed-in learner without an onboarding profile returns to the homepage onboarding form. This is one learner profile per browser origin. A browser-local account demo now controls the normal UI flow; it is not secure authentication, and multiple users per browser are not supported.

## Verification

From this folder, run the core tests:

```sh
node tests/progress.test.cjs
```

The optional Chrome test needs Playwright available in your test environment, plus a local server running at `http://127.0.0.1:8000`. It does not add a library to the website. Run with `node tests/browser.test.cjs` if Playwright is installed in the environment. To use a separate temporary installation:

```sh
npm install --prefix /tmp/moneyguide-browser playwright
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/browser.test.cjs
```

The browser test uses an isolated browser context, not your personal Chrome profile. It tests onboarding, all ten module links, lessons and checks, flashcards, failing/passing attempts, certificate gating, ten certificates, print/PDF behavior, translations, persistence, and widths 1440, 1024, 768, 390, and 320. Screenshots and a sample PDF go to the ignored `test-results/` directory. `MONEYGUIDE_URL` can override the test server address.

## Scope and next step

Five standalone financial tools work locally. The monthly planner and conversational coach retain the NVIDIA Nemotron backend integration. Browser-local demo accounts are not secure authentication. Live AI uses the configured Vercel backend; see BACKEND-SETUP.md.

## References and visual direction

The design takes high-level inspiration from [I&M Group](https://www.imbankgroup.com/): image-led sections, clear navigation, and prominent information blocks. Automated live browsing was blocked; the accessible page structure was reviewed. MoneyGuide has its own layout, mark, charcoal-and-jade palette, and typography and is not affiliated with I&M. See `assets/README.md` for the independently licensed photograph.

Lessons include links for further reading from the [CFPB](https://www.consumerfinance.gov/consumer-tools/), [Investor.gov](https://www.investor.gov/introduction-investing), [IRS](https://www.irs.gov/payments/tax-withholding), and [NAIC](https://content.naic.org/). Content is introductory education. Local laws, account protections, product terms, and tax requirements vary; US-specific forms are identified as such. Investment content is not personalized investment advice.

## Final visual pass verification

Core progress tests and Chrome browser checks passed after the redesign: all ten modules, 30 lessons/checks, 100 flashcards, assessments and 80% threshold, ten certificates, PDF output, three interface languages, refresh persistence, and responsive widths down to 320px. Shared-shell checks additionally cover both themes at six widths (320–1440px), independent currency/language/theme settings, quiz preservation, footer information, and profile editing. These visual updates are now combined with the existing NVIDIA backend integration.

## Interactive financial tools

Open **Tools** in the top navigation, then choose a calculator. Footer tool links open the same calculators directly, including from the homepage. Results update while typing. **Reset example** restores the sample inputs. Close with the × button or Escape; keyboard focus returns to the opening card.

- **Savings goal:** Enter a target, current savings, and months. Required monthly saving is `max(0, target − saved) / months`. Shows remaining savings and progress toward the goal. Assumes no interest, fees, or inflation.
- **Budget planner:** Enter monthly take-home income, six spending categories, and planned savings. Remaining money is income minus expenses minus savings. A negative result is clearly labeled a shortfall.
- **Compound interest:** Enter an initial balance, monthly contribution, nominal annual interest rate, and months. Each month earns interest at `annual rate / 1200`, then receives the contribution. Shows projected balance, total contributions, interest, and a yearly breakdown (including the final partial year). This is a fixed-rate illustration, not a guaranteed investment return; it excludes taxes, fees, and inflation.
- **Loan:** Enter principal, nominal annual interest rate, and months. Calculates equal monthly principal-and-interest payments for a fully amortizing fixed-rate loan, total repaid, total interest, and a monthly schedule. With zero interest, payment is principal divided by months. Excludes lender fees, insurance, and taxes. Actual lender rounding may differ. Use nominal interest rather than an APR that includes fees.
- **Currency conversion:** Choose source and destination, enter an amount, then enter a current rate from a trusted source. The rate is destination units per one source unit. No rates are invented or fetched. Swapping currencies also inverts a valid rate. Selecting a different currency clears the old rate; identical currencies use 1. Fees and exchange spreads are excluded.

All tool labels and results support English, Spanish, and French. Money amounts use the profile's preferred currency (or the guest header selection); **changing that preference changes labels, not the input values**. `Other` displays generic money units. Amounts accept 0–1 trillion, terms accept 1–600 whole months, and interest rates accept 0–100%. Blank, negative, non-finite, or out-of-range inputs clear the results and show guidance. Exchange rates must be positive.

Calculator drafts stay in memory while the page is open. They are not saved after a refresh and do not alter profile data, XP, assessments, or certificates. There are no new external services or runtime libraries.

Formula/concept references: [Investor.gov compound interest calculator](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator), [CFPB loan amortization](https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/), and [CFPB monthly payment example](https://www.consumerfinance.gov/ask-cfpb/how-do-mortgage-lenders-calculate-monthly-payments-en-1965/). The loan tests independently reproduce the CFPB’s approximately $477 monthly payment for $100,000 over 30 years at 4%.

Run calculator checks:

```sh
node --test tests/calculators.test.cjs tests/progress.test.cjs
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/tools.test.cjs
```

## Account demo and homepage scenes

The homepage remains public. Start Learning, module/dashboard links, and tool buttons lead new learners through **Create Account** before the existing onboarding form. Registration asks for Full Name, Password, and Confirm Password. Passwords must contain 12–128 characters and cannot be only spaces. Both password fields have accessible show/hide buttons. Returning learners use **Login** and their full name/password. The profile menu includes **Logout**. Logging out clears the tab's demo session, broadcasts logout to other open MoneyGuide tabs, and returns to Login. Reloading or opening protected learning URLs while signed out returns to the account screen.

**This is a browser-local demonstration, not secure authentication.** Client JavaScript and storage can be changed through developer tools. Nothing here securely protects learning data. The UI explicitly requests a unique test password. Only one demo account is supported per browser origin, so creating another account cannot silently replace the existing learner or progress. Accounts do not sync across browsers, devices, or origins; the local website and GitHub Pages are separate. There is no password recovery service. Existing pre-account progress is retained when the local demo account is created, and existing certificates retain their original issued names. New personalization and certificate creation use the full account name.

The demo stores no plaintext passwords. Web Crypto derives a salted PBKDF2-HMAC-SHA-256 verifier with 600,000 iterations and a fresh 16-byte random salt. This avoids plaintext storage; **hashing does not make frontend authentication secure**. HTTPS (GitHub Pages) or localhost is required for Web Crypto. Storage or unsupported-browser failures show errors without silently discarding learning progress.

New storage keys:

- `moneyguide.demoAccount.v1` in localStorage: version, random account ID, full name, salt, and password verifier.
- `moneyguide.demoSession.v1` in sessionStorage: account ID and logout marker. No password is stored in the session.
- `moneyguide.demoLogout` in localStorage: a logout marker for cross-tab invalidation.

The rest of the profile, currency, language, theme, and learning storage keys remain intact. Logging out does not delete progress.

`MoneyGuideAuth` exposes `register`, `login`, `logout`, and `current` as the provider boundary. To connect real authentication later, replace local verifier/session logic with a backend or managed auth provider, use server-managed sessions, and enforce authorization on server APIs. Frontend redirects are only navigation behavior. Real multi-user progress must be associated with server-issued user IDs; a full name alone is not a reliable globally unique account identifier. Do not deploy the demo as secure account protection.

The existing coins hero remains. The About section gains original payment-card/phone line art; the Grow & Achieve section gains original financial-chart/savings artwork. No large new photography or runtime libraries were added. The homepage now uses the coordinated cinematic reveal controller described below. Account and learning-page arrivals retain their existing brief fades.

Run the account checks with the local server running:

```sh
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/auth.test.cjs
```

Implementation references: [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [MDN Web Crypto deriveBits](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits).

## First-visit account guidance and rotating homepage

An account page opened on an address with no saved account now shows Create Account immediately, even if an old link requested Login. The form explains that browser storage is separate for each address/port: an account created on `127.0.0.1:8000` does not exist automatically on `127.0.0.1:5500` or GitHub Pages. Returning visitors with a local account still receive Login. No accounts are automatically invented and no passwords or progress are copied between origins.

The current hero uses four backgrounds with a three-second interval and a 1.5-second opacity crossfade. The main heading, copy, navigation, and learning buttons stay in place. Manual selection pauses automatic rotation for at least 9 seconds. Rotation also pauses for an explicit pause, hidden tabs, an off-screen hero, hovered controls, keyboard focus inside the hero, and reduced motion. The four numbered controls remain usable for manual selection in reduced-motion mode.

Run `NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/home-motion.test.cjs` to check first-visit routing, automatic cycling, pause/manual selection, section entrances, reduced motion, and desktop/mobile overflow.

## Final cinematic polish

The original learning platform remains intact. The homepage adds only the requested Practice, Tools, and Progress scenes alongside the existing Learn and Achieve content. The five tool cards reuse the existing calculators. Practice links point to existing flashcards, knowledge checks, and assessments; Money Simulator still says Coming Soon; AI Coach opens the integrated chat. Homepage progress comes from `MoneyGuideProgress.totals()` and certificate previews use actual saved awards, with clearly labeled unearned previews.

Hero sources: three freely licensed Unsplash photographs (micheile henderson, Kamil, and Mediamodifier) plus MoneyGuide’s original chart SVG. See `assets/README.md` for exact photo URLs and license information. New photo files are `coin-progress.webp`, `coin-progress-small.webp`, `financial-planning.webp`, and `financial-planning-small.webp`, together about 237KiB. Responsive image sources choose smaller files for mobile. Only the first hero image is preloaded; later images load when next/requested and decode before being displayed. Failed later images leave the current background intact and disable their selector.

`cinematic.js` replaces the previous overlapping homepage reveal/rotation code. IntersectionObserver performs three jobs: start background lighting before a scene enters; trigger labels, masked headings, body copy, cards, and progress fills once; and update navigation from the current reading band. It also pauses the hero when off-screen. No wheel/touch events are intercepted, no mandatory scroll snapping is used, and no animation library is added.

Sections rise 55px and settle from scale .975 over 850ms, once per visit; mobile uses 25px. Labels reveal first, headings use a clip mask and 30px rise over 800ms, text follows after 220ms, and cards rise 35px/scale .97 over 650ms with 100ms stagger steps after a 300ms lead-in. Mobile cards use a shorter 100ms delay. Easing is cubic-bezier(.22,1,.36,1). Section lighting transitions over 850ms. The actual progress fill reveals once without changing its stored value. Animations remove themselves on completion so existing card hover/focus effects keep working. Content is visible by default: no IntersectionObserver or interrupted JavaScript cannot leave a permanent hidden state. Static scene headings/card descriptions have English fallback text.

Mobile uses shorter entrances, greatly reduced stagger, stacked cards and no parallax. Reduced motion turns off automatic hero rotation, crossfade transitions, clipping, scale, and content movement; manual background selection and all links remain usable. Changing language or saved progress refreshes previews without restarting already-seen scene animations.

Run the homepage-specific checks with the local server running:

```sh
NODE_PATH=/tmp/moneyguide-browser/node_modules node tests/cinematic.test.cjs
```

The test covers all four backgrounds, delayed loading, crossfade, stationary hero text, automatic/manual/pause controls, the manual-selection pause interval, scene/navigation changes, working tool/practice links, real progress, English/Spanish/French, both themes, widths 320–1440px, reduced motion, and lack of IntersectionObserver.
Core progress tests and Chrome browser checks passed after the redesign: all ten modules, 30 lessons/checks, 100 flashcards, assessments and 80% threshold, ten certificates, PDF output, three interface languages, refresh persistence, and responsive widths down to 320px. Shared-shell checks additionally cover both themes at six widths (320–1440px), independent currency/language/theme settings, quiz preservation, footer information, and profile editing. The current integration adds the Nemotron backend, plan and coach to this design. Publishing is a separate step; GitHub Pages alone cannot run the AI backend.

## Nemotron integration verification

Application syntax checks and all ten automated API/calculation/learning-progress tests pass. The dedicated tests/ai-browser.test.cjs check passed for the new homepage onboarding route, Advanced profile, demo calculation, mocked plan and chat, error fallback, lesson action links, language and currency changes, dark/light themes, mobile layout, and public asset serving. Live NVIDIA output requires a configured API key and was not exercised. The optional full lesson browser suite encountered navigation timing limits in this environment.
