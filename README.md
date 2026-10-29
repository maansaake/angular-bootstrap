# Angular Bootstrap

[![Main branch protection](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml)
[![Code scanning](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml)

A small, production-minded Angular 22 starter: register, log in, log out and manage a profile,
backed by [Kerberos](https://github.com/trebent/kerberos) authentication, Angular Material 3 and
OpenAPI-generated clients.

**[Try the live demo →](https://maansaake.github.io/angular-bootstrap/)**

## Quick start

```bash
git clone https://github.com/maansaake/angular-bootstrap.git my-app
cd my-app
make install
make serve
```

Open `http://localhost:4200`. No backend needed: an in-browser mock serves the API, the same one
the live demo uses.

## What's inside

- **Angular 22**: standalone components, signals, Signal Forms, zoneless change detection,
  lazy-loaded routes, strict TypeScript and strict templates.
- **Angular Material 3**: a single theme in `src/styles.scss`, built from `--mat-sys-*` tokens,
  with a System/Light/Dark switch.
- **Kerberos auth**: HttpOnly cookie sessions, automatic refresh, a 401 retry, route guards
  and organisation scoping. See [About Kerberos](#about-kerberos).
- **OpenAPI clients**: typed Angular services generated from `openapi/` with `make codegen`.
- **Accessibility**: a skip link, focus management on navigation, and axe-core checks in every
  page spec. Targets WCAG 2.2 AA.
- **Tooling**: ESLint (including template accessibility rules), Prettier, Vitest with Material
  component harnesses, and GitHub Actions CI that deploys to GitHub Pages.

## About Kerberos

[Kerberos](https://github.com/trebent/kerberos) is an open-source API gateway that sits between
this app and your backend. It owns user accounts and sessions, checks every request before it
reaches your services, and tells your backend who is calling. Your backend never handles a
password or a session.

### What it does

- **Routes** traffic sent to `/gw/backend/<backend-name>/<path>` to the configured backend, with
  TLS, CORS and timeouts set per backend.
- **Authenticates** users with basic auth and HttpOnly cookie sessions: log in, refresh, log out.
- **Authorizes** requests with group-based rules for a whole backend or individual paths.
- **Validates** requests against each backend's OpenAPI spec, and **observes** every call with
  OpenTelemetry traces and metrics.

### How a request flows

Every gateway request passes through a fixed pipeline. Any stage can stop it with a `401`, `403`
or `400`; only a request that passes them all reaches your backend.

```mermaid
flowchart LR
    App["Angular app<br/>(browser)"] -- "Cookie: session" --> Obs

    subgraph Kerberos["Kerberos gateway"]
        direction LR
        Obs["1. Observability<br/>trace + metrics"] --> Router["2. Router<br/>find the backend"]
        Router --> Auth["3. Auth<br/>session + groups"]
        Auth --> OAS["4. Validation<br/>OpenAPI spec"]
        OAS --> Fwd["5. Forwarder"]
    end

    Fwd -- "X-Krb-Org<br/>X-Krb-User<br/>X-Krb-Groups" --> Backend["Your backend"]
```

The forwarder adds the caller's organisation, user and groups as `X-Krb-*` headers, so your
backend can authorize and scope data without talking to Kerberos.

> [!IMPORTANT]
> Kerberos must be the only way to reach your backend. The identity headers can only be trusted
> if nobody can call the backend without going through the gateway.

### Deployment modes

An **organisation** is the tenant boundary in Kerberos. Users, groups, group memberships and
sessions belong to exactly one organisation and never cross into another, and every auth call
names its organisation (`/api/auth/basic/organisations/{orgID}/login`). The API and the
isolation model are the same in both modes; the difference is how many organisations the app
uses and where the ID comes from.

|                          | Multi-tenant                                                                                                | Single-tenant (this starter)                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Organisations            | Many, such as one per customer of a SaaS product                                                            | Exactly one                                     |
| Where `orgID` comes from | Resolved at runtime, e.g. from a subdomain, an invite link or an organisation picker                        | Hard-coded as `orgID` in `src/environments/`    |
| Who signs up where       | Each user joins the organisation they were invited to                                                       | Everyone joins the one organisation             |
| Administration           | Creating an organisation also creates its admin account, which manages that organisation's users and groups | One admin account, used only by the app backend |
| Backend                  | Scopes all data by `X-Krb-Org`                                                                              | Can ignore `X-Krb-Org`                          |

To move from single- to multi-tenant, replace the constant `orgId` in `AuthService` with a value
resolved at runtime (a signal works well) and scope your backend's data by `X-Krb-Org`. The
generated clients already take the organisation as a parameter, so nothing else changes.

### How authentication works in this app

```mermaid
sequenceDiagram
    participant B as Browser (AuthService)
    participant A as App backend
    participant K as Kerberos

    B->>A: POST /api/register
    A->>K: CreateUser (hidden admin account)
    B->>K: POST /login
    K-->>B: Set-Cookie: session (HttpOnly)
    loop every 5 minutes
        B->>K: POST /refresh
    end
    B->>K: Any request returning 401
    B->>K: POST /refresh, then retry once
    B->>A: DELETE /api/me
    A->>K: DeleteUser (hidden admin account)
```

- **Registration and account deletion** go through the app backend (`openapi/backend.yaml`).
  Kerberos requires an admin account for both, and that account must never reach the browser.
- **Everything else** goes straight to Kerberos (`openapi/auth_basic.yaml`) through the generated
  `UsersService`.
- **`AuthService`** (`src/app/services/auth.service.ts`) is the only place that knows about
  sessions. It exposes signals (`user`, `username`, `loggedIn`, `lastRefreshedAt`) and returns
  typed results (`{ ok: true } | { ok: false, reason }`) so pages can show accurate errors.
- **`authRefreshInterceptor`** catches a 401, refreshes the session once and retries.
- **`authGuard` / `guestGuard`** (`src/app/guards/`) protect `/profile`, keep signed-in users off
  `/login` and `/register`, and send users back to where they were going after logging in.

## Make it yours

1. **Rename** the project in `package.json`, `angular.json` (and the `dist/` path in
   `.github/workflows/deploy.yaml`), `src/index.html` and the header and footer.
2. **Retheme** by changing the palettes in `src/styles.scss`. Components only use system tokens,
   so nothing else needs to change.
3. **Connect a real backend**:
   - Delete `provideMockBackend()` from `src/app/app.config.ts` and remove `src/app/mocks/`.
   - Set `krbBaseUrl`, `backendBaseUrl` and `orgID` in `src/environments/`.
   - Implement `openapi/backend.yaml` (register and delete-me) in your backend.
4. **Change an API** by editing the spec in `openapi/`, then run `make codegen` and commit the
   output. Never hand-edit `src/app/services/auth-basic/` or `src/app/services/backend/`.

## Commands

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `make install`      | Install dependencies (`npm ci`)                   |
| `make serve`        | Start the dev server on `http://localhost:4200`   |
| `make check`        | Run everything CI runs: format, lint, build, test |
| `make format`       | Format the code with Prettier                     |
| `make format/check` | Check formatting without changing files           |
| `make lint`         | Lint and auto-fix with ESLint                     |
| `make lint/ci`      | Lint without fixing                               |
| `make build/prod`   | Production build into `dist/angular-bootstrap/`   |
| `make build/dev`    | Development build                                 |
| `make test`         | Run the unit tests once                           |
| `make codegen`      | Regenerate the API clients from `openapi/`        |

## Project layout

```text
src/app/
  app.config.ts        providers: router, HTTP, API clients, mock backend
  app.routes.ts        lazy routes and guards
  core/                app shell: header, footer
  pages/               one directory per route, with page-only components under it
  components/          shared components used by several pages
  services/            AuthService, ThemeService, Notifier and the generated clients
  guards/              authGuard, guestGuard
  interceptors/        401 refresh-and-retry
  utils/               validation rules and form helpers
  mocks/               demo-only in-browser backend (delete for real use)
src/testing/           test helpers: AuthService stub, axe-core check
openapi/               API specs the clients are generated from
```

Where each kind of file goes, and the rules for adding new ones, are in
[`docs/structure.md`](docs/structure.md).

## CI and deployment

- **Pull requests and `main`**: format check, lint, build (including a check that the generated
  clients are up to date) and tests.
- **Deploy**: every push to `main` runs lint and tests, builds for production and publishes to
  GitHub Pages, with a `404.html` fallback so deep links work.

Coding conventions for humans and AI agents are in [`AGENTS.md`](AGENTS.md).

## License

[MIT](LICENSE)
