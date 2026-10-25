# Angular bootstrap

[![Main branch protection](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml)
[![Code scanning](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml)

A reference repository, use as a template for new Angular apps.

## Included boilerplate

1. Angular 22
2. Angular material
3. ESLint
4. User management
    * Registration
    * Login/logout
    * User username
    * Update password
5. Header/footer
6. Landing page
7. OpenAPI code generation

    * Generates an Angular client from [Kerberos'](https://github.com/trebent/kerberos) OpenAPI
      specification (`openapi/auth_basic.yaml`) for authentication: login, logout, session
      refresh, and reading/updating your own user.
    * Generates a second client from the backend's own specification
      (`openapi/backend.yaml`) for registration. Kerberos only creates users through a hidden
      admin account, so the backend owns registration: it proxies user creation to Kerberos
      and rate limits it (documented in the spec).

8. GitHub actions layout

Without a real backend, `ng serve` runs against a **mock backend interceptor**
(`src/app/mocks/`): it implements the Kerberos and registration endpoints in memory and
warns loudly in the console. Remove it (and its registration in `app.config.ts`) before
pointing the app at a real backend — the app code itself only talks to the
OpenAPI-generated clients and needs no other changes.
