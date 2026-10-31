---
name: angular-material
description: Use when building UI with Angular Material (`@angular/material`) components, Material 3 theming, `mat-*` elements, `--mat-sys-*` CSS variables, CDK primitives, or Material component harnesses in tests. Covers the standalone import convention, M3 theming via `mat.theme()`, forms integration (Reactive + Signal Forms), overlays, navigation/layout, data tables, CDK, and testing.
license: MIT
metadata:
  author: maansaake/angular-bootstrap
  version: '1.0'
  short-description: Angular Material v22 (M3) usage guidelines
---

# Angular Material (v22, Material 3)

These guidelines target `@angular/material@22` with the Material 3 (M3) theming system. The
project defines a single global theme (usually in `src/styles.scss`); check for it before
styling anything, and never add another theme, prebuilt theme CSS, or `@angular/animations`. Follow the rules below, then read the reference that matches the task.

## Hard rules

1. **Import standalone classes, never NgModules.** All `Mat*` components/directives are
   standalone since v15. Import only what the template uses — e.g. `MatButton` from
   `@angular/material/button`, not `MatButtonModule`. If legacy `MatXxxModule` imports exist, do not
   add new ones, and migrate them opportunistically when editing a file that already imports
   one.
2. **Version pinning.** `@angular/material` peers an *exact* `@angular/cdk` version
   (e.g. 22.2.2 ↔ 22.2.2). Never bump one without the other; use `ng update @angular/material`,
   which handles both plus migrations.
3. **No animations module.** Material 22 animates via native CSS. Do not add
   `provideAnimationsAsync()` or `@angular/animations` anywhere.
4. **Theme through tokens, not hardcoded colors.** Style custom components with
   `--mat-sys-*` variables (or the `mat-*` utility classes from `mat.system-classes()`).
   Adjust component appearance with the `overrides` mixins, never by overriding Material's
   internal CSS classes or DOM structure — those are private implementation details.
5. **New Material code must compile and pass a11y.** After generating Material code, run
   `ng build`. Common failures: missing form-field child control (a `mat-form-field` requires
   an input/select/etc.), a table sort header with no `MatSort` wiring, and standalone
   component templates referencing elements whose classes aren't imported.

## Conventions

- Theme: a single `mat.theme((color: ..., typography: ..., density: ...))` on `html`, with
  `color-scheme: light dark` (optionally plus `mat.system-classes()` for utility classes). Assume both light and
  dark modes are live — always use system variables instead of literal colors so dark mode
  works.
- State: signals (`signal`, `computed`) with `inject()` for services.
- Forms: prefer Signal Forms (`@angular/forms/signals`) for new forms; `mat-form-field`
  supports both Signal Forms and Reactive Forms. Follow existing form patterns in the project.
- Feedback: `inject(MatSnackBar).open(message, 'Close', {duration: 3000})` for transient
  messages.
- Project instructions (`AGENTS.md`, `CLAUDE.md`) override these defaults where they differ.

## References

Read the file that matches the task, under `references/` next to this file:

- **Theming, tokens, utility classes, overrides, dark mode**: [theming.md](references/theming.md)
- **Form field, input, select, datepicker/timepicker, checkbox/radio/slider/toggle/chips, forms integration, error handling**: [form-controls.md](references/form-controls.md)
- **Dialog, snack bar, tooltip, menu, bottom sheet**: [overlays.md](references/overlays.md)
- **Toolbar, sidenav, tabs, stepper, list, card, buttons, icons, progress, badge, expansion, grid**: [navigation-layout.md](references/navigation-layout.md)
- **Table with sort and pagination**: [data-table.md](references/data-table.md)
- **CDK primitives (a11y, overlay, drag-drop, virtual scroll, layout breakpoints, clipboard)**: [cdk.md](references/cdk.md)
- **Component test harnesses**: [testing.md](references/testing.md)

## Scaffolding shortcuts

`ng generate @angular/material:navigation|dashboard|table|address-form|tree <name>` and
`ng generate @angular/cdk:drag-drop <name>` generate working Material components — then apply
the rules above (they generate NgModule-era code; convert imports to standalone classes).

Official docs: https://material.angular.dev/ (guides + per-component API and styling tabs).
