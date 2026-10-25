# Structure

File-system map. Navigate from here before exploring the tree; keep this file in sync with
the code in the same change that alters it.

## `src/app/` — the application

Root component and feature components. Every feature is a directory with
`<name>.ts` (standalone component), `<name>.html`, `<name>.scss`, `<name>.spec.ts`.

- `app.ts` / `app.html` / `app.scss` — root component: header, footer, and `<router-outlet>`.
- `app.config.ts` — **application providers** (important): `provideRouter(routes)`,
  `provideHttpClient` with the interceptors (refresh-retry outermost, mock backend
  innermost), `provideApi` for the Kerberos client and the backend client (base URLs from
  the environment, `withCredentials` for session cookies), and an app initializer that
  hydrates the session from the backend on boot. New global providers go here.
- `app.routes.ts` — route table: `''` → Landing, `login`, `register`, `profile`
  (guarded by `authGuard`). Add routes here.
- `header/`, `footer/` — app chrome. Toolbar-based header with login/register/profile
  buttons driven by the `AuthService` and router events; surface-container backgrounds
  (see their scss).
- `interceptors/` — `auth-refresh.interceptor.ts` (important): on a 401 from any request
  except login/refresh themselves, refreshes the session once and retries the request.
- `mocks/` — **dev-only mock backend** (important): `kerberos-mock.ts` implements the
  Kerberos and registration endpoints in memory so `ng serve` works without a server. It
  warns loudly in the console; delete the directory and its interceptor registration in
  `app.config.ts` before developing against a real backend.
- `landing/` — public landing page (`''`).
- `login/`, `register/`, `profile/` — authentication flows. Reactive Forms +
  `FormBuilder.nonNullable`, `ErrorStateMatcher` for cross-field errors (register,
  profile), `MatSnackBar` feedback pattern (login, register, profile). Login/profile talk
  to `AuthService`; register calls the generated backend client (`RegistrationService`)
  because registration is backend-owned.

## `src/app/services/` — services

- `auth.service.ts` — **session service** (important): `@Service()` class `AuthService`
  with signal state (`user`, `username`, `loggedIn`) derived from the API — hydrated from
  `GetMe` on boot via an app initializer. Login/logout/refresh go through the generated
  Kerberos client (`UsersService`); a refresher loop keeps the session warm while logged
  in. No credentials or session state are stored client-side. Also exports `authGuard`
  (`CanActivateFn`); guards profile routes.
- `auth.service.spec.ts` — its spec (mocked HTTP via `HttpTestingController`).
- `auth-basic/` — **OpenAPI-generated Kerberos client** (generated code — do not hand-edit).
  Regenerate with `npm run codegen` (or `make codegen`) from `openapi/auth_basic.yaml`.
  - Barrel entry `index.ts` and `provide-api.ts` (`provideApi(basePathOrConfig)`) are the
    integration points app code uses; `app.config.ts` calls `provideApi`.
  - `api/` (endpoint services: users, groups, organisations), `model/` (request/response
    models), plus generator support files (configuration, encoder, variables).
  - `.openapi-generator-ignore` protects the integration points above from regeneration.
- `backend/` — **OpenAPI-generated client for the app's own backend** (generated code — do
  not hand-edit), generated from `openapi/backend.yaml` in the same `codegen` run. Currently
  only `RegistrationService` (`POST /api/register`); grows as the backend gains endpoints.

## `src/` (non-app) — entry and styling

- `main.ts` — bootstrap entry (`bootstrapApplication(app, appConfig)`).
- `styles.scss` — **the single theme source of truth** (important): `mat.theme()` with
  magenta primary / violet tertiary, Roboto, density 0; `mat.system-classes()`;
  `color-scheme: light dark` on body. Never add a second theme or hardcoded colors —
  use `--mat-sys-*` tokens.
- `index.html` — loads Roboto + Material Symbols fonts.
- `environments/environment.ts` / `environment.prod.ts` — `krbBaseUrl` (Kerberos API base
  URL), `backendBaseUrl` (app backend base URL), `orgID` (the single demo organisation all
  Kerberos requests are scoped to), and `production` flag. Dev defaults:
  `http://localhost:30001` / `http://localhost:30002` / `1`.

## `openapi/`

- `auth_basic.yaml` — Kerberos OpenAPI spec; the generator input for
  `src/app/services/auth-basic`.
- `backend.yaml` — the app backend's own OpenAPI spec (registration and future
  backend-owned endpoints); the generator input for `src/app/services/backend`. Edit the spec here, then
  run codegen.

## `.agents/skills/` — agent skill library

- `angular-developer/`, `angular-new-app/` — Angular team's official skills (Angular
  fundamentals, scaffolding).
- `angular-material/` — repo-authored skill: Material v22/M3 conventions (standalone
  imports, theming, forms, overlays, tables, CDK, testing) with 7 references.

## Configuration & tooling

- `AGENTS.md` — **coding standards** (important): TypeScript/Angular rules (standalone,
  signals, control flow, no `ngClass`/`ngStyle`, `@Service()`, Signal Forms preference).
- `angular.json` — Angular CLI workspace; `Makefile` — `lint`, `build/dev`, `test` (default
  target), `codegen`, `serve`.
- `package.json` — scripts: `start`, `build`, `watch`, `test`, `lint`, `codegen`
  (OpenAPI generator → `src/app/services/auth-basic` **and**
  `src/app/services/backend`).
- `eslint.config.js`, `.prettierrc`, `.editorconfig` — lint/format.
- `tsconfig(.app/.spec).json`, `openapitools.json` — TS config and generator versioning.
- `.github/workflows/` — `main.yaml` and `pull-request.yaml` call `callable-build.yaml` /
  `callable-test.yaml`; plus `auto-update-pr-branches`, `dependabot-auto-approve`,
  `code-scanning`.

## Deliberately absent

- `sample/` — deleted (legacy scaffolding); nothing references it.
- No `docs/` deep-dives yet — add when a subsystem outgrows this file.
