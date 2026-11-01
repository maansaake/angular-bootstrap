You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

Follow these skills (in `.agents/skills`, also published as the `angular-bootstrap` Claude Code plugin):

- `angular-project-structure`: directory layout, Angular rules, forms, services, API clients, accessibility and verification. It overrides the folder examples in `angular-developer`
- `angular-developer`: general Angular best practices
- `angular-material`: Angular Material work

This file records only the facts specific to this project. Where it conflicts with a skill, this file wins.

## Project Structure

- This app's directory map, including the demo-only `mocks/` directory, is in `docs/structure.md`

## Angular Material

- The single M3 theme lives in `src/styles.scss` (`mat.$red-palette` primary, `mat.$violet-palette` tertiary, Roboto, density 0). `color-scheme` is set on `html`; `ThemeService` switches it between `light`, `dark`, and `light dark`
- Show transient messages through `inject(Notifier).show(message)` (`src/app/services/notifier.service.ts`), not `MatSnackBar` directly
- App chrome (header, footer) uses `--mat-sys-surface-container` backgrounds

## API Clients

- Clients are generated from `openapi/` into `src/app/services/<api-name>` via `make codegen`. Generated output is committed

## Verification

- Format: `make format` (Prettier; CI runs `make format/check`)
- Build: `make build/prod` (production `ng build`)
- Lint: `make lint` (`ng lint --fix`; CI runs `make lint/ci`)
- Test: `make test` (`ng test --watch false`)
- `make check` runs the CI sequence in one go
- Every page spec must call `expectNoAxeViolations` from `src/testing/axe.ts`
