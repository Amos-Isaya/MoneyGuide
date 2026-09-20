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
| `index.html` | Three-chapter homepage, coins-and-plant hero, and onboarding form. |
| `dashboard.html` | Dashboard with shared top navigation, ten modules, practice, tools, progress, and certificates. |
| `module.html` | One reusable page for all ten learning modules. `?id=7` opens Investing Basics, for example. |
| `certificate.html` | Displays an earned certificate for the module in `?id=`. |
| `css/style.css` | Shared design, responsive layouts, lesson styles, and print formatting. |
| `css/cards.css` | Large navigation cards, module/certificate/tool states, outline-icon sizing, focus and reduced-motion styles. |
| `css/polish.css` | Final visual layer: both themes, sticky header, homepage chapters, footer, and responsive learning surfaces. |
| `js/appearance.js` | Restores the saved theme before the page paints; defaults to dark. |
| `js/shell.js` | Builds the shared navigation/footer and handles mobile menu, profile, currency, theme, and information dialogs. |
| `js/home.js` | Displays real saved progress and certificate previews on the homepage, plus optional scroll reveals. |
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

The homepage has three expansive chapters: Discover uses a dark, immersive financial photograph; Learn & Practice shifts to a lighter charcoal-blue surface with six feature cards and real saved progress; Grow & Achieve shifts to deep green with curriculum statistics, certificate previews, and the final call to action. Light mode uses complementary warm, pale surfaces while retaining the cinematic dark hero. Manrope is hosted locally.

The shared sticky top navigation replaces the sidebar on all four pages. Home and About lead to the landing page; Learn, Practice, Tools, Progress, and Certificates link to the corresponding dashboard section. The current destination is marked, and the header subtly changes after scrolling. Below 1,200px it becomes an expandable hamburger menu with keyboard support. Language, currency, theme, and profile controls remain available inside it.

The six large feature cards are Learn, Practice, Money Tools, Progress, Certificates, and AI Learning Coach. Learn receives one restrained jade accent treatment. The other cards share thin borders, original outline icons, generous spacing, and large arrows. The entire available card is a normal link, including its arrow. First-time learners complete onboarding before reaching their chosen destination. Returning learners go directly there. Practice opens the existing flashcards and assessments.

The ending has three layers: a final learning call to action; a five-column directory of platform, learning, tools, resources, and language links; and a slim copyright/disclaimer/legal bar. Contact information is honestly marked coming soon. Privacy, terms, help, and accessibility buttons open concise prototype information dialogs.

Module cards display real saved status and progress, with distinct recommended, active, and completed treatments. Certificate cards cover all ten modules: earned ones link to the certificate and show its date and score; unearned ones explain the 80% requirement and link to the module. Progress uses four major metric cards for completed modules, certificates, XP, and level, followed by overall activity progress.

Five financial-tool cards describe planned savings, budget, compound-interest, loan, and currency tools. They are clearly labeled Coming Soon and open an informational dialog; they do not calculate anything. The AI Learning Coach card opens the dashboard plan and coach. A separate monthly budget and savings calculator is available there now; the five tool cards remain previews.

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

The onboarding currency stays saved and is displayed on the dashboard. The top navigation can update it without resetting a lesson or quiz. Language, currency, and theme preferences are separate. Examples explicitly use fictional money units; changing language does not convert prices or change currency. There is no live exchange-rate service.

## Browser storage

The project uses these localStorage keys:

- `moneyguide.profile`: existing first name, currency, financial goal, and knowledge level. Its format is preserved.
- `moneyguide.language`: interface language (`en`, `es`, or `fr`).
- `moneyguide.theme`: `dark` (default) or `light`.
- `moneyguide.currency`: guest currency preference before onboarding; a saved learner uses the existing profile’s currency field.
- `moneyguide.learning.v1`: per-module activities, current assessment answers, latest results, best scores, certificates, last visited module, XP, and level.

JavaScript objects become text through `JSON.stringify()` and return to objects through `JSON.parse()`. Data survives refreshes and browser restarts on the same browser/profile/origin. It does not sync to other devices and is not sent to a backend. Clearing site data removes it. Private browsing may remove it when the session closes.

Failed writes show an error and roll back the attempted in-memory change. Damaged learning JSON is left untouched and further writes are blocked instead of silently erasing progress. A missing or invalid onboarding profile redirects to the homepage. This is one learner profile per browser origin; authentication and multiple-user accounts are not implemented.

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

The monthly calculator, personalized Nemotron explanations, and conversational coach are integrated into the current dashboard. Games and the five standalone tool cards remain previews. Profile and learning progress stay in browser storage. Live AI requires the server-side key and backend described in AI-SETUP.md.

## References and visual direction

The design takes high-level inspiration from [I&M Group](https://www.imbankgroup.com/): image-led sections, clear navigation, and prominent information blocks. Automated live browsing was blocked; the accessible page structure was reviewed. MoneyGuide has its own layout, mark, charcoal-and-jade palette, and typography and is not affiliated with I&M. See `assets/README.md` for the independently licensed photograph.

Lessons include links for further reading from the [CFPB](https://www.consumerfinance.gov/consumer-tools/), [Investor.gov](https://www.investor.gov/introduction-investing), [IRS](https://www.irs.gov/payments/tax-withholding), and [NAIC](https://content.naic.org/). Content is introductory education. Local laws, account protections, product terms, and tax requirements vary; US-specific forms are identified as such. Investment content is not personalized investment advice.

## Final visual pass verification

Core progress tests and Chrome browser checks passed after the redesign: all ten modules, 30 lessons/checks, 100 flashcards, assessments and 80% threshold, ten certificates, PDF output, three interface languages, refresh persistence, and responsive widths down to 320px. Shared-shell checks additionally cover both themes at six widths (320–1440px), independent currency/language/theme settings, quiz preservation, footer information, and profile editing. The current integration adds the Nemotron backend, plan and coach to this design. Publishing is a separate step; GitHub Pages alone cannot run the AI backend.

## Nemotron integration verification

Application syntax checks and all ten automated API/calculation/learning-progress tests pass. The dedicated tests/ai-browser.test.cjs check passed for the new homepage onboarding route, Advanced profile, demo calculation, mocked plan and chat, error fallback, lesson action links, language and currency changes, dark/light themes, mobile layout, and public asset serving. Live NVIDIA output requires a configured API key and was not exercised. The optional full lesson browser suite encountered navigation timing limits in this environment.
