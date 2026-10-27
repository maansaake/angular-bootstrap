# Angular Bootstrap

[![Main branch protection](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml)
[![Code scanning](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml)

A production-ready Angular 22 template with authentication, Material Design 3, and OpenAPI code generation. Clone it, run `make serve`, and you have a working application.

---

## Quick Start

```bash
make serve
```

The app runs at `http://localhost:4200` with a mock backend. No external services required.

**Note**: Remove `src/app/mocks/` before you start. See the deployed app at [GitHub Pages](https://maansaake.github.io/angular-bootstrap/) for a live example.

---

## Project Setup

### Angular 22 (Standalone-First)

This bootstrap uses Angular 22 with a modern, opinionated setup:

- **Standalone components** — No NgModules; components import only what they use
- **Signals-based state** — Reactive state management via `signal()` and `computed()`
- **Modern control flow** — `@if`, `@for`, `@switch` template syntax
- **Service decorator** — Uses `@Service()` and `inject()` for dependency injection

Coding standards are defined in `AGENTS.md`. The project uses ESLint for code quality.

### Angular Material (Material 3)

Complete Material Design v3 theming with:

- **Token-driven styling** — All colors use `--mat-sys-*` CSS custom properties
- **Dark mode support** — `color-scheme: light dark` on body
- **Single theme source** — Defined once in `src/styles.scss` via `mat.theme()`

**Theme**: Magenta primary, violet tertiary, Roboto font family.

**Rule**: Never use hardcoded colors. Always use system tokens like `var(--mat-sys-surface)`.

### Authentication System

Built on [Kerberos](https://github.com/trebent/kerberos), an API gateway with authentication/authorization. The authentication system in the bootstrap app uses the Kerberos API to authenticate users.

**Session service** (`AuthService`):

- Reactive state via signals (`user`, `loggedIn`, etc.)
- Login/logout/refresh through generated Kerberos client
- Hydrates session on app startup
- Automatic token refresh — Background refresh every 5 minutes via app initializer
- 401 retry interceptor — Automatic session refresh on unauthorized responses
- HttpOnly cookie sessions — No credentials stored client-side, preventing XSS attacks
- Organisation isolation — All requests scoped to a single organisation ID
- CSRF protection — Built-in protection against cross-site request forgery
- Session management — Complete session lifecycle handling with automatic cleanup

### OpenAPI Code Generation

Type-safe Angular API clients generated from OpenAPI specifications:

- `openapi/auth_basic.yaml` — Kerberos authentication API
- `openapi/backend.yaml` — Application backend API

**Generated clients**:

- `src/app/services/auth-basic/` — Kerberos client
- `src/app/services/backend/` — Backend client

**Command**:

```bash
make codegen
```

**Integration**: Clients are wired via `provideApi()` in `app.config.ts` with base URLs from environment.

---

## Available Commands

| Command | Description |
| --------- | ------------- |
| `make serve` | Start development server |
| `make build` | Production build |
| `make test` | Run unit tests |
| `make lint` | Run ESLint |
| `make codegen` | Generate API clients |
| `make check` | Run lint, build, and test |
