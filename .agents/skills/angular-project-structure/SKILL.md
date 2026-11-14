---
name: angular-project-structure
description: Project layout and coding conventions for Angular apps. Use when creating, moving, or deciding where to place components, pages, routes, services, guards, interceptors, or utils in an Angular app; when wiring generated OpenAPI clients; or when checking that a change is complete. Overrides the folder examples in the `angular-developer` skill.
license: MIT
metadata:
  author: maansaake/angular-bootstrap
  version: '1.0'
  short-description: Angular directory layout, conventions and verification
---

# Angular project structure and conventions

These rules extend the `angular-developer` skill (and `angular-material` for Material work). Where
they conflict, these rules win. If the project has its own `AGENTS.md` or `CLAUDE.md`, that file
wins over this skill.

## Directory layout

Every file under `src/app/` belongs in one of a fixed set of directories. The directory says what a
file is and who uses it. Read [references/structure.md](references/structure.md) before adding or
moving a file.

```text
src/app/
  app.ts, app.config.ts, app.routes.ts
  core/          app-wide pieces, used once by the app root
    header/, footer/   app shell, rendered on every page
    guards/            functional route guards
    interceptors/      functional HTTP interceptors
  pages/         one directory per route; sub-pages and page-only components/ nested inside
  components/    shared components used by two or more pages
  services/      all services, hand-written and generated
  utils/         plain functions and constants
src/testing/     shared test helpers
```

- Plain functions and types live in `utils/`, even when only one page uses them; pages have no
  `utils/` of their own. A small helper used by one component may stay as a module-level
  function in that component's file. Move it to `utils/` once it is shared, or large enough to
  deserve its own spec.

- Place a component by who uses it: the app shell → `core/`; a route → `pages/`; one page → that
  page's `components/`; several pages → `components/`.
- One component per directory, named in kebab-case, with template, styles and spec beside it.
- A page never imports from another page's directory. Move shared code to `components/`,
  `services/` or `utils/` instead.
- Guards and interceptors go in `core/guards/` and `core/interceptors/`, never at the top level.
- Only the route file imports pages. Only the root files (`app.ts`, `app.routes.ts`,
  `app.config.ts`) import from `core/`.

## Angular rules

- Use standalone components. Do NOT set `standalone: true` (default in v20+) or
  `changeDetection: ChangeDetectionStrategy.OnPush` (default in v22+) in decorators.
- Do NOT use `@HostBinding` or `@HostListener`; put host bindings in the `host` object of the
  `@Component` or `@Directive` decorator.
- Lazy load every feature route with `loadComponent` or `loadChildren`.
- Use `NgOptimizedImage` for all static images. It does not work for inline base64 images.

## Forms

- Prefer Signal Forms (`@angular/forms/signals`) for new forms (stable in v22+).
- When not using Signal Forms, use Reactive forms, not template-driven forms.

## Services

- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton
  services (v22+).
- Hand-written services live at the top of `services/` with the `.service.ts` suffix.

## API clients

- Generate API clients from OpenAPI specs (kept in `openapi/`) into `src/app/services/<api-name>/`.
  Commit the generated output.
- Never hand-edit a generated directory; change the spec and regenerate. Exclude generated
  directories from formatting and linting.
- Register each client in `app.config.ts` through its `provideApi(...)` function with the
  environment base URL.
- Consume clients with `inject(<Api>Service)`. Do not hand-roll `HttpClient` calls for endpoints a
  generated client already covers.

## Accessibility

- Every page MUST pass all axe checks; give each page spec an automated axe assertion.
- Meet WCAG AA, including focus management, color contrast and ARIA attributes.
- jsdom cannot check color contrast. Verify contrast in a real browser, in light and dark mode if
  the app supports both.

## Verification

Before calling a change complete, run in order: **format → build → lint → test**. All four must
pass. Read the output of each step and fix failures before moving on; do not claim success
without it. Use the project's own scripts (Makefile, `package.json`) for each step.

Keep one script (for example `make check`) that runs exactly what CI runs, and have CI run the
production build on the Node version the project pins (`.nvmrc` or `engines`). When the two
drift, a change can pass locally and fail in CI, or the reverse.
