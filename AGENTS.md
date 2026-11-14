You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

Follow these skills (in `.agents/skills`, also published as the `angular-bootstrap` Claude Code plugin):

- `angular-project-structure`: directory layout, Angular rules, forms, services, API clients, accessibility and verification. It overrides the folder examples in `angular-developer`
- `angular-developer`: general Angular best practices
- `angular-material`: Angular Material work

This file records only the facts specific to this project. Where it conflicts with a skill, this file wins.

## Project docs

Read these before planning a change, and update them in the same change when the code moves:

- `docs/overview.md`: what this repo is and its high-level design
- `docs/structure.md`: the file map, including the demo-only `mocks/` directory and the skills/plugin layout
- `docs/design-rules.md`: standing conventions for theming, API clients, testing and the skills

## Verification

- Format: `make format` (Prettier; CI runs `make format/check`)
- Build: `make build/prod` (production `ng build`)
- Lint: `make lint` (`ng lint --fix`; CI runs `make lint/ci`)
- Test: `make test` (`ng test --watch false`)
- `make check` runs the CI sequence in one go
