# Project structure

Every file under `src/app/` belongs in one of a fixed set of directories. The directory says what
a file is and who uses it, so you can find things without searching.

```text
src/app/
  app.ts, app.html, app.scss   root component: skip link, header, <router-outlet>, footer
  app.config.ts                providers: router, HTTP, API clients
  app.routes.ts                lazy routes and guards
  core/                        app-wide pieces, wired up once by the root files
    header/                    app shell, rendered on every page
    footer/
    guards/                    route guards
    interceptors/              HTTP interceptors
  pages/                       one directory per navigable route
    home/
      components/              components only the home page uses
        feature-list/
    login/
    profile/
      security/                sub-page: /profile/security
      components/              components only the profile page uses
        delete-account-dialog/
  components/                  shared components used by two or more pages
  services/                    all services, hand-written and generated
    auth.service.ts
    <api-name>/                generated from openapi/<api-name>.yaml
  utils/                       plain functions and constants: validation rules, form helpers
src/testing/                   shared test helpers: service stubs, axe check
openapi/                       API specs the clients are generated from
```

## Directories

### `core/`

App-wide pieces that the root files wire up once and no page imports:

- **App shell components** that stay on screen whatever the route: the header, the footer and
  anything else of that kind (a site-wide banner, a navigation drawer). Imported by `app.ts`.
- **`core/guards/`**: functional route guards. Imported by `app.routes.ts`.
- **`core/interceptors/`**: functional HTTP interceptors. Imported by `app.config.ts`.

Shell components keep the one-directory-per-component rule; guards and interceptors are grouped by role
instead (`core/guards/auth.guards.ts`), with their specs beside them.

### `pages/`

One directory per component that a route loads with `loadComponent`. The directory name matches
the route path (`/profile` → `pages/profile/`), and `app.routes.ts` is the only file that imports
a page.

- **Sub-pages** (child routes) live in a directory inside their parent page, e.g.
  `pages/profile/security/` for `/profile/security`.
- **Page-only components** live in a `components/` directory inside the page that uses them, e.g.
  `pages/profile/components/delete-account-dialog/`. If a second page needs one, move it to the
  top-level `components/`.

### `components/`

Shared, reusable components used by two or more pages. A component used by a single page belongs
under that page instead (see above). The directory may be empty until the first shared component
is added.

### `services/`

Every injectable singleton service, hand-written or generated. Hand-written services sit at the top
level and use the `.service.ts` suffix. Generated OpenAPI clients each get their own directory
(`services/<api-name>/`). Never hand-edit generated directories; change the spec in `openapi/` and
regenerate.

### `utils/`

Plain, framework-light functions and constants (no `@Component` or `@Service`): validation rules,
form helpers.

Add other role directories (for example `mocks/` for a demo backend) only when the code fits none
of the above, and document them in the project's `AGENTS.md`.

## Rules

1. **One component per directory**, named after the component in kebab-case
   (`delete-account-dialog/delete-account-dialog.ts`) with its template, styles and spec beside it.
2. **Place a component by who uses it**: the app shell → `core/`; a route → `pages/`; one page →
   that page's `components/`; several pages → `components/`.
3. **Imports point down or across to shared code, never into another page.** A page may import
   from `components/`, `services/` and `utils/`, but not from another page's directory.
4. **Specs sit next to the file they test** (`*.spec.ts`).
5. **Guards and interceptors live in `core/`** (`core/guards/`, `core/interceptors/`), never at the
   top level of `src/app/`.
