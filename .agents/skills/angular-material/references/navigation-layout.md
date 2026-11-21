# Navigation, layout, and common components

Condensed from the official component docs for: toolbar, sidenav, tabs, stepper, list,
card, buttons, icon, progress, badge, expansion, and grid.

## Buttons (`@angular/material/button`)

```html
<button mat-button>Basic</button>
<button mat-raised-button>Continue</button>   <!-- elevated, filled -->
<button mat-icon-button aria-label="Edit"><mat-icon>edit</mat-icon></button>
<button mat-fab>+</button>
<a mat-button routerLink="/login">Sign in</a>   <!-- anchor variants use MatAnchor -->
```

Standalone class per template usage — pick by attribute used:

| Attribute | Import |
|---|---|
| `mat-button` / `mat-raised-button` (`<button>`) | `MatButton` |
| same, on `<a>` | `MatAnchor` |
| `mat-icon-button` (`<button>`) | `MatIconButton` |
| `mat-icon-button` on `<a>` | `MatIconAnchor` |
| `mat-fab` / `mat-mini-fab` | `MatFabButton` / `MatMiniFabButton` (anchors: `MatFabAnchor` / `MatMiniFabAnchor`) |

- Icon-only buttons MUST have `aria-label` (repo a11y requirement).
- `disabled` works via the native attribute; use `[disabled]` bound to signal state.

## Icons (`@angular/material/icon`)

`<mat-icon>delete</mat-icon>` with `MatIcon` import. Material Symbols font is loaded by
`ng add` in `index.html`. `<mat-icon>` must not be self-closed. Prefer Material Symbols
names (https://fonts.google.com/icons).

## Toolbar (`@angular/material/toolbar`)

```html
<mat-toolbar>
  <span>App name</span>
  <span class="spacer"></span>
  <button mat-button (click)="login()">Login</button>
</mat-toolbar>
```

Import `MatToolbar` (and `MatToolbarRow` only when using multiple rows). Give the
toolbar a system-variable-based background (e.g. `--mat-sys-surface-container`). Use one toolbar per role; don't nest toolbars for layout — use flexbox inside.

## Sidenav (`@angular/material/sidenav`)

```html
<mat-sidenav-container>
  <mat-sidenav #sidenav mode="over">
    <mat-nav-list>...</mat-nav-list>
  </mat-sidenav>
  <mat-sidenav-content>
    <router-outlet />
  </mat-sidenav-content>
</mat-sidenav-container>
```

Imports: `MatSidenavContainer, MatSidenav, MatSidenavContent` from
`@angular/material/sidenav`; `MatNavList, MatListItem` from `@angular/material/list`.
`mode`: `over | side | push`. `fixedInViewport` + `fixedTopGap` for toolbars that stay on
top. Scaffold with `ng generate @angular/material:navigation shell` then convert the
generated NgModule imports to standalone classes.

## Tabs (`@angular/material/tabs`)

```html
<mat-tab-group>
  <mat-tab label="Profile"><app-profile /></mat-tab>
  <mat-tab label="Settings"><app-settings /></mat-tab>
</mat-tab-group>
```

Imports: `MatTabGroup, MatTab`. Lazy-render heavy tab bodies with `@defer` inside the tab
content. For URL-driven tabs use `selectedIndex` with router state.

## Stepper (`@angular/material/stepper`)

`MatStepper, MatStep` (`<mat-stepper>`, `<mat-step [stepControl]="form">`). Linear mode
(`linear`) requires each step's `stepControl` to be valid before advancing — wire a
`FormGroup` per step.

## List (`@angular/material/list`)

```html
<mat-list>
  @for (item of items(); track item.id) {
    <mat-list-item>
      <mat-icon matListItemIcon>label</mat-icon>
      <span matListItemTitle>{{ item.name }}</span>
      <span matListItemLine>{{ item.desc }}</span>
    </mat-list-item>
  }
</mat-list>
```

Selection lists (`MatSelectionList, MatSelectionListItem`) for multi-select of items;
`MatNavList` for navigation lists (items get routerLink + ripples).

## Card, divider, expansion, badge, grid

```html
<mat-card>
  <mat-card-header><mat-card-title>Title</mat-card-title></mat-card-header>
  <mat-card-content>Body</mat-card-content>
  <mat-card-actions><button mat-button>Action</button></mat-card-actions>
</mat-card>
```

Imports: `MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions` — import the
sections used. `MatDivider` for separators.

Card spacing:

- Build cards from their sections and let them set the padding: `mat-card-header` (with
  `mat-card-title-group`, `mat-card-title` and `mat-card-subtitle`), one or more
  `mat-card-content`, `mat-card-actions`, and full-width `mat-divider`s between sections.
- Adjust fonts and colors with `mat.card-overrides(...)` tokens, never padding or margin
  overrides on the sections. Custom spacing is only for laying out the card's own content (such as
  the gap between rows inside a `mat-card-content`).
- The one gap Material leaves open: a header with nothing below it (for example a collapsed card)
  has no bottom padding; give it 16px.
- Any panel that sets itself apart from the page (a filter panel, a summary box) should be a card,
  not a styled `div`.
- Cards laid out in a grid can be as narrow on a desktop as on a phone. Make the card an
  inline-size container (`container-type: inline-size` on its host) and use `@container` queries,
  not `@media` width queries, for styles inside it that change with width. Expansion: `MatAccordion, MatExpansionPanel`
(`multi` for independent panels). Badge: `MatBadge` attribute directive
(`<span matBadge="5" matBadgeColor="warn">`). Grid: `MatGridList, MatGridTile` for simple
responsive tile grids (cols + rowHeight; otherwise prefer CSS grid).

## Controls revealed on hover

A control that only appears on hover (such as an edit button on a list row) must still reach
keyboard and touch users:

```scss
@media (hover: hover) {
  .row .reveal {
    opacity: 0;
  }
  .row:hover .reveal,
  .row:focus-within .reveal {
    opacity: 1;
  }
}
```

Hide it with `opacity: 0` only inside `@media (hover: hover)`, and show it on `:hover` and
`:focus-within` of its row. Never hide it with `display: none` or `visibility: hidden`, which
removes it from the tab order; touch screens have no hover, so it always shows there.

## Progress indicators

- `MatProgressBar` (`<mat-progress-bar mode="indeterminate|determinate" [value]="x">`) —
  linear.
- `MatProgressSpinner` (`<mat-progress-spinner mode="indeterminate" [diameter]="40">`) —
  circular; `aria-label` for meaningful spinners (role `progressbar` is built in).
- Which indicator to use when, and skeleton placeholders: [loading-states.md](loading-states.md).

## Layout guidance

Prefer Material tokens/utility classes (`mat-bg-surface-container`, `--mat-sys-*`) over
custom spacing colors. Use surface-container backgrounds for chrome-level surfaces such as
the header and footer, and follow whatever the project already uses.
