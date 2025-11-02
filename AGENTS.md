# Repository Guidelines

## Project Structure & Module Organization
Root-level files keep the app lightweight: `index.html` defines the UI shell, `style.css` covers layout/theme tokens, and `app.js` owns prompt logic plus LocalStorage persistence. The V2 exploration (`app-v2.js`, `firebase-config.js`, `PRD-V2.md`, `README-V2.md`, `V2-COMPLETE.md`, `V2-REVIEW.md`) sits beside the stable stack so you can iterate without touching production code. If you add media or mock data, place them in an `assets/` directory; new docs belong at the root for parity with the existing READMEs.

## Build, Test, and Development Commands
- `python3 -m http.server 4173` — quick static server with clipboard-friendly HTTPS bypass.
- `npm install --global serve && serve .` — closer to production caching/headers when reproducing bugs.
- `npx prettier --write "app*.js" "style.css" "index.html"` — keep formatting consistent.
Remain dependency-free unless a feature absolutely demands a bundler; document any new toolchains in this section.

## Coding Style & Naming Conventions
Indent with two spaces for HTML, CSS, and JS to match the current baseline. Use camelCase for JS identifiers (`promptStore`, `renderPromptCard`) and kebab-case for CSS classes (`prompt-card`, `toast-success`). Extend styles via the variables in `:root` instead of hard-coding colors. Keep DOM selectors tight as `data-*` hooks (`data-id`, `data-category`), and isolate side effects (LocalStorage writes, clipboard usage) inside helpers for reusability.

## Testing Guidelines
No automated suite exists, so manual regression is mandatory. Validate each PR by exercising add/edit/delete prompts, import/export JSON, search/filter, copy-to-clipboard, and category sorting. Test at least Chrome plus one other browser, and confirm the responsive layout at phone and desktop widths. When you introduce durable logic, add Jest/Vitest specs under `/tests`, using filenames like `promptStore.spec.js`, and record the execution command here.

## Commit & Pull Request Guidelines
Commits follow the existing concise, imperative tone (`Add V2 completion summary`, `Complete V2 implementation...`). Keep each commit focused so it can be reverted cleanly. PRs need a short summary, screenshots/GIFs for UI work, reproduction steps for fixes, and a note on any config or Firebase changes. Always state that you completed the manual test checklist.

## Security & Configuration Tips
Do not commit live credentials; keep `firebase-config.js` wired to test keys or stub values. If you must illustrate a config, redact sensitive tokens and document which env vars are expected. When touching the LocalStorage schema, export current data first, bump the version key inside `app.js`, and mention the migration path in release notes so users do not lose prompts.
