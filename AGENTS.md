# Repository Guidelines

## Project Structure & Module Organization
Currently only docs (README.md, LICENSE, AGENTS.md) are present; new work must keep the following layout: `infra/` for Docker Compose manifests, TLS material, and IdP bootstrap scripts; `src/proxy/` for Apache vhosts plus mod_auth_openidc snippets; `src/iframe-client/` for the embedded shim and utilities; and `tests/` for integration harnesses. Keep shared environment defaults in `.env.example`, describe optional overrides under `docs/configuration.md`, and place diagrams in `docs/architecture/`.

## Build, Test, and Development Commands
Target workflows depend on Docker, Node, and Make. Once the scaffolding exists, expose these commands: `docker compose -f infra/docker-compose.yml up --build proxy idp` to run Apache with the IdP locally; `make lint` (or `npm run lint` inside `src/iframe-client`) to invoke ESLint + Prettier; `make e2e` to drive the iframe handshake via Cypress; and `markdownlint README.md AGENTS.md` for doc hygiene. Record extra prerequisites such as mkcert or openssl usage in `docs/prerequisites.md`.

## Coding Style & Naming Conventions
Use 2-space indentation for YAML/JSON, 4 spaces for Apache configs, and Prettier defaults for TypeScript. Prefer kebab-case directories (`src/iframe-client`), snake_case shell helpers, and UpperCamelCase exported TS classes. Keep Apache directives grouped by capability (SSL, auth, proxy) and document unusual values inline. Run ESLint + Prettier before every commit.

## Testing Guidelines
Write Jest unit tests under `src/iframe-client/__tests__` and Cypress suites under `tests/e2e`. Name specs after user flows (`login_flow.spec.ts`). Provide sanitized fixtures in `tests/fixtures/` plus `.env.test`. When updating mod_auth_openidc settings, add a Cypress test proving the redirect chain and stash HAR captures or screen recordings under `tests/artifacts/`. Target full branch coverage for the TypeScript shim and at least one upstream/downstream OIDC round trip per PR.

## Commit & Pull Request Guidelines
Continue the imperative tone seen in `Initial commit` (e.g., `Add proxy template`). Keep subject lines ≤72 chars, wrap body text at ~100, and include a short rationale plus testing notes. PRs must link issues, list commands executed, and attach screenshots or HAR snippets for UI or auth-flow tweaks. Request review from a maintainer familiar with TLS/OIDC and wait for passing CI before merging.

## Security & Configuration Tips
Never commit live certificates, IdP credentials, or bearer tokens; place sample keys only under `infra/certs/example` and ignore `.env`. When sharing traces, redact tokens. Document new RBAC scopes, client IDs, or redirect URIs in `docs/security.md` so downstream teams can reproduce the setup exactly.
