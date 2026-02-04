# Repository Guidelines

## Project Structure & Module Organization

Keep infrastructure artifacts under `infra/` (Docker Compose files, TLS scripts,
IdP bootstrap helpers) and treat `src/proxy/` as the home for Apache vhosts plus
`mod_auth_openidc` snippets. Place the iframe shim, shared utilities, and npm
assets inside `src/iframe-client/`, while Cypress specs, fixtures, and artifacts
live in `tests/`. Defaults belong in `.env.example`, optional overrides in
`docs/configuration.md`, architecture visuals in `docs/architecture/`, and
prerequisite callouts in `docs/prerequisites.md`.

## Build, Test, and Development Commands

Use Docker + Make for orchestration. Run `docker compose -f
infra/docker-compose.yml up --build proxy idp` to start Apache with the sample
IdP and rebuild whenever vhosts or certs change. `npm run lint`, `npm run test`,
and `npm run build` inside `infra/portal/app` cover the Angular portal.
`markdownlint README.md AGENTS.md CLAUDE.md` keeps docs tidy. The Cypress
workspace under `tests/` exposes `npm run cy:run`, `cy:open`, and `cy:verify`
once you install npm deps. Pass `ELECTRON_EXTRA_LAUNCH_ARGS="--no-sandbox
--disable-gpu"` when running headless Electron in sandboxes. Credentials come
from `.env` (`DEMO_USER_USERNAME` / `DEMO_USER_PASSWORD`), but you can override
them with `CYPRESS_PORTAL_USERNAME` / `CYPRESS_PORTAL_PASSWORD`. Record any
mkcert or openssl commands used to
generate local certificates.

## Coding Style & Naming Conventions

Use 2-space indentation for YAML/JSON, 4 spaces for Apache configs, and Prettier
defaults for TypeScript. Favor kebab-case for directories (`src/iframe-client`),
snake_case for shell helpers, and UpperCamelCase for exported TS classes. Group
Apache directives logically (SSL → auth → proxy) and leave inline comments when
deviating from module defaults. Always run ESLint + Prettier prior to commits.

## Testing Guidelines

Write Vitest unit tests under `infra/portal/app/src/**/*.spec.ts` (target shared
utilities or client-side helpers). Place Cypress specs in `tests/e2e` and name
them for the covered flow (`login_flow.cy.ts`). Provide sanitized fixtures in
`tests/fixtures/` plus an `.env.test` for deterministic secrets. Target full
branch coverage on the iframe shim and capture at least one upstream/downstream
OIDC round trip per PR. Drop HAR files or recordings under `tests/artifacts/`
whenever `mod_auth_openidc` behavior changes.

## Commit & Pull Request Guidelines

Craft imperative commit subjects ≤72 characters (e.g., `Add proxy template`) and
wrap body text near 100 characters with rationale plus testing notes. Pull
requests must link issues, enumerate local commands executed, and attach
screenshots or HAR snippets for UI or auth-flow tweaks. Request review from
someone comfortable with TLS/OIDC and wait for green CI before merging.

## Security & Configuration Tips

Never commit live certificates, IdP secrets, or bearer tokens; keep only
redacted samples inside `infra/certs/example/` and ensure `.env*` stays ignored.
Redact sensitive values in HAR captures, document new RBAC scopes, client IDs,
redirect URIs, or TLS requirements in `docs/security.md`, and note any
additional trust stores consumers must install.
