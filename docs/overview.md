# Overview

## What this is

**angular-bootstrap** is a reference repository / template for starting new Angular apps
(GitHub: `maansaake/angular-bootstrap`). Clone it, run one command, and you have a working
Angular 22 application with authentication UI, a Material 3 theme, linting, and a CI setup —
the parts every new project needs but nobody wants to re-build.

## Major moving parts

- **Angular 22, standalone-first.** No NgModules; components import only the standalone
  directives they use. State is signal-based; services use `inject()` and the `@Service()`
  decorator. Coding standards live in `AGENTS.md` (repo-wide, agent-facing).
- **Angular Material (v22, Material 3) as the default UI kit.** The M3 theme is defined once
  in `src/styles.scss` via `mat.theme()` (magenta/violet palettes, Roboto, `light dark`
  color-scheme) plus `mat.system-classes()`. Custom styling must go through `--mat-sys-*`
  tokens, not hardcoded colors. The repo-local skill `.agents/skills/angular-material/`
  codifies the Material conventions.
- **Authentication flows, delegated to Kerberos** — landing, register, login, and a guarded
  profile page, built on Material form fields, with header/footer chrome around them.
  `src/app/services/auth.service.ts` is a thin session service over the OpenAPI-generated
  Kerberos client: login/logout/refresh plus `GetMe` hydrate its signals; the session itself
  lives in an HttpOnly cookie and nothing auth-related is stored client-side. Registration is
  owned by the backend (see below); `authGuard` protects the profile route. A proactive
  refresher loop (started by an app initializer) keeps the session fresh, with a 401-retry
  interceptor as fallback.
- **OpenAPI-generated API clients.** `openapi/auth_basic.yaml` (a
  [Kerberos](https://github.com/trebent/kerberos) spec for basic auth) generates the auth
  client into `src/app/services/auth-basic/`; `openapi/backend.yaml` — the app backend's own
  spec — generates a second client into `src/app/services/backend/` whose first endpoint is
  `POST /api/register`. Kerberos creates users only through a hidden admin account, so the
  backend owns registration: it proxies the request to Kerberos and rate limits it, which the
  spec documents. Both clients are generated via `npm run codegen`; the generated code is
  committed — regenerate rather than hand-edit. `provideApi()` wires each client's base URL
  from `src/environments/`.
- **Mock backend for dev.** Until a real backend exists, `src/app/mocks/kerberos-mock.ts`
  implements exactly the endpoints the sample uses (login, logout, refresh, me, user update,
  password change, register) at the HTTP transport layer. App code is unchanged with or
  without it; the mock warns loudly in the console and must be removed (together with its
  registration in `app.config.ts`) before developing against a real backend.
- **Quality gates.** ESLint (`ng lint`), Jasmine/Karma specs colocated as `*.spec.ts`,
  Prettier, GitHub Actions for build/test/PR flow, Dependabot, and code scanning.
  `Makefile` exposes the common commands.

## Design choices that define this repo

1. **Generated code stays in its sandbox.** `src/app/services/auth-basic/` and
   `src/app/services/backend/` are entirely generator-owned
   (`.openapi-generator-ignore`); app code imports from their barrels and never edits inside.
2. **One theme, token-driven.** All color/typography decisions flow from the single
   `mat.theme()` call; light and dark mode both work because everything consumes system
   variables.
3. **Conventions are executable guidance.** `AGENTS.md` (coding rules) and the
   skill library under `.agents/skills/` (Angular team's `angular-developer` and
   `angular-new-app`, plus the repo-authored `angular-material`) direct agents and humans to
   the repo's way of writing Angular.
4. **A bootstrap, not a product.** Features are deliberately minimal examples of the right
   pattern; growing an app here means adding feature directories under `src/app/` that
   follow the same shape (component files + colocated spec + scss).

See `docs/structure.md` for the file-system map. Setup/run instructions: `README.md`.
