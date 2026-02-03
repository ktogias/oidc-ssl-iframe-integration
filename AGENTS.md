# Repository Guidelines

## Project Structure & Module Organization
Only the top-level docs currently exist, but all future work must honor the intended layout: `infra/` for Docker Compose manifests, TLS helpers, and IdP bootstrap scripts; `src/proxy/` for Apache vhosts plus `mod_auth_openidc` includes; `src/iframe-client/` for the embedded shim and shared utilities; and `tests/` for Cypress harnesses, fixtures, and artifacts. Place shared defaults in `.env.example`, optional overrides in `docs/configuration.md`, diagrams under `docs/architecture/`, and prerequisite callouts in `docs/prerequisites.md`.

## Build, Test, and Development Commands
Use Docker + Make for orchestration. `docker compose -f infra/docker-compose.yml up --build proxy idp` runs Apache with the sample IdP and rebuilds whenever proxies or certs change. `make lint` (or `npm run lint` inside `src/iframe-client`) runs ESLint with Prettier formatting, and `make e2e` executes the Cypress iframe handshake. Run `markdownlint README.md AGENTS.md` before doc-only PRs. Document any mkcert/openssl usage you required to generate local certificates.

## Coding Style & Naming Conventions
Adopt 2-space indentation for YAML/JSON, 4 spaces for Apache configs, and Prettier defaults for TypeScript. Name directories in kebab-case (`src/iframe-client`), shell helpers in snake_case, and exported TS classes in UpperCamelCase. Group Apache directives by capability (SSL → auth → proxy) and add inline comments when deviating from defaults. Always run ESLint + Prettier before committing.

## Testing Guidelines
Author Jest unit tests under `src/iframe-client/__tests__` and Cypress specs under `tests/e2e`, named for the flow they cover (`login_flow.spec.ts`). Ship sanitized fixtures in `tests/fixtures/` plus an `.env.test` for deterministic secrets. Target full branch coverage on the iframe shim and at least one upstream/downstream OIDC round trip per PR. Capture HAR files or screen recordings under `tests/artifacts/` whenever `mod_auth_openidc` settings change.

## Commit & Pull Request Guidelines
Keep commit subjects imperative (`Add proxy template`), ≤72 characters, and wrap details at ~100 characters with rationale plus testing notes. Pull requests must link issues, enumerate commands executed, and attach screenshots or HAR snippets for UI or auth-flow tweaks. Request review from a maintainer versed in TLS/OIDC and wait for green CI before merging.

## Security & Configuration Tips
Never commit live certificates, IdP credentials, or bearer tokens; store sample keys only at `infra/certs/example/` and keep `.env*` ignored. Redact tokens in HAR captures. Document new RBAC scopes, client IDs, redirect URIs, or TLS requirements in `docs/security.md` so downstream teams can replicate the environment precisely.
