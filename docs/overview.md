# Overview

Angular Bootstrap is two things in one repository:

1. **A starter app.** A small, production-minded Angular 22 single-page app that people clone as
   the starting point for a new project. It covers register, log in, log out and profile
   management, so a new project starts with working authentication, theming, accessibility checks
   and CI instead of an empty shell. A live demo runs on GitHub Pages.
2. **A Claude Code plugin.** The Angular agent skills in `.agents/skills/` (`angular-developer`,
   `angular-material`, `angular-new-app`, `angular-project-structure`) are maintained here and
   published as the `angular-bootstrap` plugin. Other projects, such as Cleartab's frontend,
   install it to get the same layout and coding conventions. The starter app is the reference
   implementation of those skills.

## Major parts

- **Authentication through Kerberos.** [Kerberos](https://github.com/trebent/kerberos) is an API
  gateway that owns users and sessions. The browser holds only an HttpOnly session cookie;
  `AuthService` derives its signals from the Kerberos API, refreshes the session every five
  minutes, and an interceptor refreshes once and retries on a `401`. Route guards keep signed-out
  users off `/profile` and signed-in users off `/login` and `/register`.
- **Two APIs, both generated.** Kerberos (`openapi/auth_basic.yaml`) serves login, sessions and
  user updates. A small app backend (`openapi/backend.yaml`) serves registration and account
  deletion, because those need a Kerberos admin account that must never reach the browser. Typed
  Angular clients are generated from both specs with `make codegen`.
- **Demo mock backend.** `src/app/mocks/` replaces Angular's `HttpBackend` and answers both APIs
  in the browser, so `make serve` and the GitHub Pages demo need no server. It is the only piece
  meant to be deleted when connecting a real backend.
- **Angular Material 3.** One theme in `src/styles.scss`, with a System/Light/Dark switch.
- **Accessibility.** Skip link, focus management on navigation, template accessibility lint rules
  and an axe-core check in every page spec, targeting WCAG 2.2 AA.

## Defining design choices

- Standalone components, signals, Signal Forms, zoneless change detection, lazy routes, strict
  TypeScript and templates.
- Single-tenant: every Kerberos call is scoped to one organisation ID from `src/environments/`.
  The README describes how to move to multi-tenant.
- No credentials or session state are stored client-side.
- The skills stay project-agnostic; facts about this app live in `AGENTS.md` and `docs/`.

Setup and commands are in `README.md`. The file map is in [`structure.md`](structure.md) and the
standing conventions are in [`design-rules.md`](design-rules.md).
