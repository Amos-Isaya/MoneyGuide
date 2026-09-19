# MoneyGuide — Step 1

A beginner-friendly financial education homepage, onboarding form, and dashboard. Built with plain HTML, CSS, and JavaScript. No installation, framework, account, database, or backend is required.

## Files

- `index.html`: The homepage and onboarding form.
- `dashboard.html`: The personalized dashboard, navigation, module cards, and Budgeting preview.
- `css/style.css`: Shared colors, spacing, typography, and responsive layouts.
- `js/app.js`: Opens dialogs, checks and saves onboarding answers, and personalizes the dashboard.
- `README.md`: These instructions.

## Run locally

Recommended, for consistent browser storage between pages:

1. Open the `moneyguide` folder in VS Code.
2. Choose **Terminal → New Terminal**.
3. Run `python3 -m http.server 8000` (on Windows, try `py -m http.server 8000`).
4. Open `http://localhost:8000` in your browser.
5. Keep the terminal running. Press **Ctrl+C** to stop the server.

This is Python's basic file server, not Flask or an application backend. Always use the same URL and port to keep accessing the same saved profile.

You can also double-click `index.html`, but browser behavior for localStorage on `file://` pages varies. Use the local server if the dashboard sends you back to the homepage.

## How the profile moves between pages

Submitting the form creates a JavaScript object containing first name, currency, goal, and knowledge level. `JSON.stringify()` turns it into text. `localStorage.setItem()` saves that text under `moneyguide.profile`. The browser then opens `dashboard.html`, which reads the same key and uses `JSON.parse()` to turn the text back into an object. The dashboard displays the answers using `textContent`.

The profile stays in this browser after a refresh or restart. It does not sync to other devices and is not sent anywhere. Clearing site data removes it. If storage is blocked, the form shows an error. Missing or invalid profiles return to the homepage. Use the MoneyGuide logo and Start Learning to update existing answers.

## Scope

Progress starts at Level 1, 0 XP, and 0/4 modules completed. Start Module opens a Budgeting introduction; the full lesson is not built yet. Other modules and future navigation items are labeled Coming Soon. There are no games, flashcards, certificates, reminders, calculators, authentication, or AI integrations.

## Later Flask upgrade

The HTML, CSS, and JavaScript are separate so they can be reused. When Flask is added, move HTML into `templates/` and CSS/JS into `static/`, update links to Flask routes/static URLs, and replace localStorage helpers with backend calls when needed. No framework rewrite is required now.
