# Structure

File-system map. Navigate from here before exploring the tree; keep this file in sync with
the code in the same change that alters it.

## `src/app/` — the application

Root component and feature components. Every feature is a directory with
`<name>.ts` (standalone component), `<name>.html`, `<name>.scss`, `<name>.spec.ts`.

- `app.ts` / `app.html` / `app.scss` — root component: header, footer, and `<router-outlet>`.
- `app.config.ts` — **application providers** (important): `provideRouter(routes)`,
  `provideApi(environment.krbBaseUrl)`, browser error listeners. New global providers go
  here.
- `app.routes.ts` — route table: `''` → Landing, `login`, `register`, `profile`
  (guarded by `authGuard`). Add routes here.
- `header/`, `footer/` — app chrome. Toolbar-based header with login/register/profile
  buttons driven by the `User` service and router events; surface-container backgrounds
  (see their scss).
- `landing/` — public landing page (`''`).
- `login/`, `register/`, `profile/` — user management flows. Reactive Forms +
  `FormBuilder.nonNullable`, `ErrorStateMatcher` for cross-field errors (register,
  profile), `MatSnackBar` feedback pattern (login, register).

## `src/app/services/` — services

- `user.ts` — **hand-written session service** (important): `@Service()` class `User` with
  signal state (`loggedIn`, `username`), `localStorage` persistence, login/logout, and
  `authGuard` (`CanActivateFn`). Guards profile routes.
- `user.spec.ts` — its spec.
- `auth-basic/` — **OpenAPI-generated client** (generated code — do not hand-edit).
  Regenerate with `npm run codegen` (or `make codegen`) from `openapi/auth_basic.yaml`.
  - Barrel entry `index.ts` and `provide-api.ts` (`provideApi(basePathOrConfig)`) are the
    integration points app code uses; `app.config.ts` calls `provideApi`.
  - `api/` (endpoint services: users, groups, organisations), `model/` (request/response
    models), plus generator support files (configuration, encoder, variables).
  - `.openapi-generator-ignore` protects the integration points above from regeneration.

## `src/` (non-app) — entry and styling

- `main.ts` — bootstrap entry (`bootstrapApplication(app, appConfig)`).
- `styles.scss` — **the single theme source of truth** (important): `mat.theme()` with
  magenta primary / violet tertiary, Roboto, density 0; `mat.system-classes()`;
  `color-scheme: light dark` on body. Never add a second theme or hardcoded colors —
  use `--mat-sys-*` tokens.
- `index.html` — loads Roboto + Material Symbols fonts.
- `environments/environment.ts` / `environment.prod.ts` — `krbBaseUrl` (API base URL) and
  `production` flag. Dev default: `http://localhost:30001`.

## `openapi/`

- `auth_basic.yaml` — Kerberos OpenAPI spec; the generator input. Edit the spec here, then
  run codegen.

## `.agents/skills/` — agent skill library

- `angular-developer/`, `angular-new-app/` — Angular team's official skills (Angular
  fundamentals, scaffolding).
- `angular-material/` — repo-authored skill: Material v22/M3 conventions (standalone
  imports, theming, forms, overlays, tables, CDK, testing) with 7 references.

## Configuration & tooling

- `AGENTS.md` — **coding standards** (important): TypeScript/Angular rules (standalone,
  signals, control flow, no `ngClass`/`ngStyle`, `@Service()`, Signal Forms preference).
  `CLAUDE.md` mirrors it.
- `angular.json` — Angular CLI workspace; `Makefile` — `lint`, `build/dev`, `test` (default
  target), `codegen`, `serve`.
- `package.json` — scripts: `start`, `build`, `watch`, `test`, `lint`, `codegen`
  (OpenAPI generator → `src/app/services/auth-basic`).
- `eslint.config.js`, `.prettierrc`, `.editorconfig` — lint/format.
- `tsconfig(.app/.spec).json`, `openapitools.json` — TS config and generator versioning.
- `.github/workflows/` — `main.yaml` and `pull-request.yaml` call `callable-build.yaml` /
  `callable-test.yaml`; plus `auto-update-pr-branches`, `dependabot-auto-approve`,
  `code-scanning`.

## Deliberately absent

- `sample/` — deleted (legacy scaffolding); nothing references it.
- No `docs/` deep-dives yet — add when a subsystem outgrows this file.
