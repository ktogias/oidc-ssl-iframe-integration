# CLAUDE.md

Guidance for Claude Code when contributing to this repository.

## Project Overview

Secure iframe integration backed by Apache as TLS terminator + OIDC relying
party, Keycloak as IdP, an Angular portal, and a Flask partner app.

## Current State

Full stack is live:

- `docker-compose.yml` brings up Keycloak, Apache gateway, Angular portal, and
  partner service.
- Frontend lives under `infra/portal/app` (Angular 21 w/ ESLint). Run
  `npm install`, `npm run lint`, and `npm run build` as needed.
- Partner backend sits at `infra/partner/app` (Flask). Container build happens
  via `infra/partner/Dockerfile`.
- Keycloak + Apache images live under `infra/keycloak` and `infra/apache`, with
  templated configs baked at build time.
- End-to-end smoke script: `./scripts/smoke.sh` (after `docker compose up
  --build`).

## Contributor Tips

- Lint docs with `markdownlint README.md AGENTS.md CLAUDE.md` before committing.
- `docker compose up --build -d` rebuilds/bounces the entire stack; add
  `--build apache keycloak` for targeted rebuilds.
- Keep TLS artifacts under `infra/certs/`; never commit real secrets.
- Update `AGENTS.md`, `README.md`, and `docs/` when workflows or configs change.
