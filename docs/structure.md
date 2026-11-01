# Project structure

This app follows the layout in the `angular-project-structure` skill. The directories, their
purpose and the placement rules are in
[`.agents/skills/angular-project-structure/references/structure.md`](../.agents/skills/angular-project-structure/references/structure.md).
This page maps that layout onto this app and lists what is specific to it.

```text
src/app/
  app.ts, app.html, app.scss   root component: skip link, header, <router-outlet>, footer
  app.config.ts                providers: router, HTTP, API clients, mock backend
  app.routes.ts                lazy routes and guards
  core/                        app-wide pieces, wired up once by the root files
    header/                    app shell, rendered on every page
    footer/
    guards/                    route guards (authGuard, guestGuard)
    interceptors/              HTTP interceptors (401 refresh-and-retry)
  pages/                       one directory per navigable route
    landing/
      components/              components only the landing page uses
        kerberos-overview/
        kerberos-flow-diagram/
    login/
    register/
    profile/
      components/              components only the profile page uses
        delete-account-dialog/
  components/                  shared components used by two or more pages
  services/                    all services, hand-written and generated
    auth.service.ts
    notifier.service.ts
    theme.service.ts
    auth-basic/                generated from openapi/auth_basic.yaml
    backend/                   generated from openapi/backend.yaml
  utils/                       plain functions and constants: validation rules, form helpers
  mocks/                       demo-only in-browser backend (delete for real use)
src/testing/                   test helpers: AuthService stub, axe-core check
```

## Specific to this app

- `components/` is empty until the first shared component is added.
- `services/auth-basic/` and `services/backend/` are written by `make codegen`. Never hand-edit
  them; change the spec in `openapi/` and regenerate.
- `mocks/` is the demo backend. Remove it with `provideMockBackend()` when connecting a real
  backend.
