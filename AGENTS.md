# Repository Guidelines

## Project Structure & Module Organization
- Root: `requirements.md` — product requirements for the MetaMask network setup page.
- `src/`: static site files — `index.html`, `main.js`, `styles.css`.
- `assets/` (optional): images/icons; keep under 100KB total.
- `tests/` (optional): browser or unit tests mirroring `src/` paths.

## Build, Test, and Development Commands
- Serve locally (no build step):
  - Python: `python3 -m http.server 5173` then open `http://localhost:5173`.
  - Node: `npx serve -l 5173`.
- Format (if Node available): `npx prettier --write "src/**/*.{html,css,js}"`.
- Lint JS (optional): `npx eslint src --ext .js`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF-8; LF line endings.
- JavaScript: camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE_CASE for constants.
- Files: kebab-case (`main.js`, `styles.css`).
- Keep dependencies zero; prefer vanilla DOM APIs and no external CDNs.
- Comments: concise, only where intent isn’t obvious.

## Testing Guidelines
- Manual smoke tests in Chrome/Brave/Edge/Firefox with MetaMask installed.
- Validate: add/update flow, trailing-slash equivalence, user rejection handling, status messages.
- Unit tests (optional): place as `tests/<path>/<name>.test.js`; run with Node’s test runner (`node --test`) or a light framework (e.g., Vitest) if introduced.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- PRs must include: clear description, linked issues, verification steps, and UI screenshots/GIFs where relevant.
- Keep changes focused and small; update `requirements.md` when behavior changes.

## Security & Configuration Tips
- Never commit secrets/private keys; this app does not need them.
- Use HTTPS RPC URLs; treat `.../rpc` and `.../rpc/` as equivalent.
- Do not bypass MetaMask confirmations; handle errors and rejections gracefully.
- Avoid analytics and unnecessary network calls; keep the page offline-friendly.
