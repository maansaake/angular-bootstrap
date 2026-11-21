# Project structure

The app follows the layout in the `angular-project-structure` skill. Its directories, their
purpose and the placement rules are in
[`.agents/skills/angular-project-structure/references/structure.md`](../.agents/skills/angular-project-structure/references/structure.md).
This page maps that layout onto this repository and lists what is specific to it.

## Repository root

```text
.agents/skills/            the Angular skills this repo publishes (see "Skills and plugin" below)
.claude/skills             symlink to ../.agents/skills so Claude Code loads the skills in this repo
.claude-plugin/            plugin.json (plugin manifest) and marketplace.json (marketplace entry)
.github/workflows/         CI: pull-request.yaml and main.yaml call callable-build/-test; main.yaml
                           also deploys to GitHub Pages; code scanning and Dependabot automation
.mcp.json                  Angular CLI MCP server for agents
skills-lock.json           upstream source and hash of the skills vendored from other repos
openapi/                   auth_basic.yaml (Kerberos) and backend.yaml (app backend)
Makefile                   every build, lint, test and codegen command; `make check` runs CI
angular.json, tsconfig*.json, eslint.config.js, .prettierrc   tool configuration
docs/                      overview.md, structure.md (this file), design-rules.md
src/                       the app (below)
```

## The app

```text
src/
  main.ts                    bootstraps App with appConfig
  index.html                 loads Roboto and Material Symbols
  styles.scss                the single M3 theme and global styles
  environments/              krbBaseUrl, backendBaseUrl, orgID (dev and prod)
  testing/                   auth-stub.ts (AuthService stub), axe.ts (expectNoAxeViolations)
  app/
    app.ts, app.html, app.scss root component: skip link, header, <router-outlet>, footer
    app.config.ts              providers (see below)
    app.routes.ts              lazy routes: '' landing, login, register (guestGuard), profile (authGuard)
    core/
      header/                  app shell header with navigation and theme switch
      footer/
      guards/auth.guards.ts    authGuard, guestGuard
      interceptors/auth-refresh.interceptor.ts   on 401: refresh the session once, then retry
    pages/
      landing/                 /
        components/
          kerberos-overview/       "About Kerberos" section
            kerberos-flow-diagram/   request pipeline diagram
      login/                   /login
      register/                /register
      profile/                 /profile: view and update username and password, delete account
        components/
          delete-account-dialog/   type-your-username confirmation
    components/
      skeleton/                <app-skeleton> loading placeholder
    services/
      auth.service.ts          session state (see below)
      notifier.service.ts      Notifier: transient messages via MatSnackBar
      theme.service.ts         System/Light/Dark mode, persisted in localStorage
      auth-basic/              generated from openapi/auth_basic.yaml
      backend/                 generated from openapi/backend.yaml
    utils/
      validation.ts            Signal Forms rules: usernameRules, newPasswordRules, length limits
      forms.ts                 focusFirstInvalid, safeReturnUrl (open-redirect guard)
    mocks/kerberos-mock.ts     demo-only in-browser backend (see below)
```

## Important files

### `src/app/app.config.ts`

Registers the router (component input binding, scroll to top), `HttpClient` with
`authRefreshInterceptor`, both generated API clients with `withCredentials`, app initializers for
the icon font, `ThemeService` and `AuthService.hydrate()`, and `provideMockBackend()`. Removing
the last line (and `mocks/`) is all it takes to talk to a real backend; any new interceptor or API
client is registered here.

### `src/app/services/auth.service.ts`

The only code that knows about sessions. Exposes signals (`user`, `username`, `loggedIn`,
`lastRefreshedAt`), refreshes the session every `refreshIntervalMs` (5 min), and returns typed
`AuthResult` values (`{ ok: true } | { ok: false, reason }`) instead of throwing, so pages can show
accurate errors. `orgId` comes from the environment; making it a runtime value is the
multi-tenant change. Specs replace it with `src/testing/auth-stub.ts`.

### `src/app/mocks/kerberos-mock.ts`

`provideMockBackend()` swaps Angular's `HttpBackend`, so interceptors still run. It implements
the Kerberos login, logout, refresh and user endpoints plus `POST /api/register` and
`DELETE /api/me`, with state (including plain-text passwords) in localStorage. Nothing but
`app.config.ts` imports it. When an API spec changes, update the mock too or the demo breaks.

### `src/styles.scss`

The single M3 theme (`mat.$red-palette` primary, `mat.$violet-palette` tertiary, Roboto,
density 0), built on `light-dark()` so `ThemeService` switches modes by setting `color-scheme` on
`html`. Retheming the app means changing the palettes here only.

### `src/app/components/skeleton/`

`<app-skeleton>` takes a `shape` (`text`, `rect`, `circle`), `width`, `height` and `lines`. It
depends on nothing else in the app, so it can be copied into other projects as is. The profile
page uses it while `GetUser` loads.

## Skills and plugin

- `.agents/skills/<skill>/SKILL.md` is each skill's entry point; `references/` holds the topic
  files it links to. `skills-lock.json` records the upstream repo and hash of each skill vendored
  from elsewhere; `angular-project-structure` is written here.
- `.claude-plugin/plugin.json` points the plugin at `./.agents/skills/`. Its `version` is what
  installs compare to pick up updates.
