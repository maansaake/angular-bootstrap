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
- **User management flows** — landing, register, login, and a guarded profile page — built
  on Material form fields, with header/footer chrome around them. `src/app/services/user.ts`
  is the hand-written session service (signals + `localStorage`) and the `authGuard`.
- **OpenAPI-generated API client.** `openapi/auth_basic.yaml` (a
  [Kerberos](https://github.com/trebent/kerberos) spec for basic auth) generates the Angular
  client into `src/app/services/auth-basic/` via `npm run codegen`. The generated code is
  committed; regenerate rather than hand-edit. `provideApi()` wires the base URL from
  `src/environments/`.
- **Quality gates.** ESLint (`ng lint`), Jasmine/Karma specs colocated as `*.spec.ts`,
  Prettier, GitHub Actions for build/test/PR flow, Dependabot, and code scanning.
  `Makefile` exposes the common commands.

## Design choices that define this repo

1. **Generated code stays in its sandbox.** `src/app/services/auth-basic/` is entirely
   generator-owned (`.openapi-generator-ignore`); app code imports from
   `src/app/services/auth-basic` barrel and never edits inside.
2. **One theme, token-driven.** All color/typography decisions flow from the single
   `mat.theme()` call; light and dark mode both work because everything consumes system
   variables.
3. **Conventions are executable guidance.** `AGENTS.md` (coding rules), `CLAUDE.md`, and the
   skill library under `.agents/skills/` (Angular team's `angular-developer` and
   `angular-new-app`, plus the repo-authored `angular-material`) direct agents and humans to
   the repo's way of writing Angular.
4. **A bootstrap, not a product.** Features are deliberately minimal examples of the right
   pattern; growing an app here means adding feature directories under `src/app/` that
   follow the same shape (component files + colocated spec + scss).

See `docs/structure.md` for the file-system map. Setup/run instructions: `README.md`.
