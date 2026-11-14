# Loading states

Pick the indicator by what the user is waiting for, not by habit. The goal is a page that keeps
its shape while data arrives, so nothing jumps when it lands.

| Situation                                                                | Indicator                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Content loads for the first time, or reloads because a parameter changed | **Skeleton** shaped like the content (`<app-skeleton>`, below)      |
| Data already on screen is being refreshed (reload after a save, a poll)  | Thin **indeterminate `mat-progress-bar`** at the top of the region  |
| A small action in progress (a button's request, a one-line inline check) | **Spinner** of 16–24px inside or next to the control that started it |
| A long task with known progress (an upload)                              | **Determinate** `mat-progress-bar` with `[value]`                   |

Rules:

- **No large centred spinners for content.** A 32px spinner in an empty card tells the user
  nothing about what is coming and makes the layout jump when the content replaces it.
- **Keep showing data while it refreshes.** With `resource()`/`httpResource()`, `reload()` keeps
  the old value (`status() === 'reloading'`, `hasValue()` stays true): show the progress bar over
  it. A parameter change drops the value (`status() === 'loading'`): show skeletons.
- **Reserve the progress bar's space.** Put it in a fixed-height slot (or position it absolutely
  at the top edge of the card) so it appearing does not push the content down.
- **Shape skeletons like the result.** A table gets a few skeleton rows in its real columns; a
  list of checkboxes gets a few skeleton lines; a label/value list gets skeleton values next to
  the real labels. Size `text` skeletons with a `width` close to the expected value.
- **Accessibility.** Skeletons are `aria-hidden`. Mark the loading region with
  `[attr.aria-busy]="resource.isLoading()"` and announce the state in a visually hidden
  `role="status"` element ("Loading users…"). A spinner that is the only indicator needs an
  `aria-label`; one inside a button whose label already says what is happening is `aria-hidden`.
- **Motion.** The pulse stops under `prefers-reduced-motion: reduce`; keep that if you restyle it.

## Example: a table loading its rows

```html
<div [attr.aria-busy]="usersResource.isLoading()">
  <p class="visually-hidden" role="status">
    {{ usersResource.isLoading() ? 'Loading users…' : '' }}
  </p>

  <div class="progress-slot">
    @if (usersResource.status() === 'reloading') {
      <mat-progress-bar mode="indeterminate" aria-label="Refreshing users" />
    }
  </div>

  <table mat-table [dataSource]="dataSource">
    …columns…
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns"></tr>
  </table>

  @if (usersResource.status() === 'loading') {
    @for (row of [1, 2, 3, 4, 5]; track row) {
      <app-skeleton class="skeleton-row" />
    }
  }
</div>
```

```scss
.progress-slot {
  height: 4px; // the bar's height, reserved whether it shows or not
}

// One placeholder per row, padded like a 52px `mat-row`.
.skeleton-row {
  padding: 1rem;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}
```

## The skeleton component

`<app-skeleton>` is self-contained, with no dependency on the rest of an app. Copy it into
`src/app/components/skeleton/` as these three files. Inputs: `shape` (`text` default, `rect`,
`circle`), `width` (any CSS length, default `100%`), `height` (for `rect`), `lines` (for
`text`). Restyle it with `--app-skeleton-color` and `--app-skeleton-radius`.

`skeleton.ts`:

```ts
import { Component, computed, input, numberAttribute } from '@angular/core';

export type SkeletonShape = 'text' | 'rect' | 'circle';

/**
 * A pulsing placeholder block shown while content loads.
 *
 * - `text` (default): one bar per line, sized to the surrounding font so swapping in the real
 *   text does not shift the layout. With `lines > 1` the last line is shorter, like a paragraph.
 * - `rect`: a block of an explicit `height`, for images, charts or cards.
 * - `circle`: a round block of `width` (height follows), for avatars.
 *
 * The block is hidden from assistive technology. Mark the loading region with `aria-busy` and
 * announce the loading state in text there.
 *
 * Restyle it with `--app-skeleton-color` and `--app-skeleton-radius`. Without them it uses the
 * Material 3 system tokens, falling back to a black tint outside a Material theme.
 */
@Component({
  selector: 'app-skeleton',
  host: {
    'aria-hidden': 'true',
    '[class]': '"app-skeleton-" + shape()',
    '[style.width]': 'width()',
    '[style.--app-skeleton-height]': 'height()',
  },
  styleUrl: './skeleton.scss',
  templateUrl: './skeleton.html',
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('text');
  /** Any CSS length. Defaults to the full width of the container. */
  readonly width = input('100%');
  /** Any CSS length. Used by `rect`; `text` follows the font size and `circle` its width. */
  readonly height = input('4rem');
  /** Number of text lines. Only used by the `text` shape. */
  readonly lines = input(1, { transform: numberAttribute });

  protected readonly bars = computed(() =>
    Array.from({ length: this.shape() === 'text' ? Math.max(1, this.lines()) : 1 }, (_, i) => i),
  );
}
```

`skeleton.html`:

```html
@for (bar of bars(); track bar) {
  <span class="bar"></span>
}
```

`skeleton.scss`:

```scss
:host {
  // A tint of the text colour, so it stays visible on any surface in light and dark mode.
  --_color: var(
    --app-skeleton-color,
    color-mix(in srgb, var(--mat-sys-on-surface, #000) 12%, transparent)
  );
  --_radius: var(--app-skeleton-radius, var(--mat-sys-corner-extra-small, 4px));

  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.bar {
  display: block;
  border-radius: var(--_radius);
  background-color: var(--_color);
  animation: app-skeleton-pulse 1.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// One bar per line of text: as tall as the font, centred in the line box (`1lh`), so the
// placeholder takes up exactly the space the text will.
:host(.app-skeleton-text) .bar {
  height: 1em;
  margin-block: calc((1lh - 1em) / 2);

  &:last-child:not(:first-child) {
    width: 60%;
  }
}

:host(.app-skeleton-rect) .bar {
  height: var(--app-skeleton-height);
}

:host(.app-skeleton-circle) .bar {
  aspect-ratio: 1;
  border-radius: 50%;
}

@keyframes app-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
```

A spec should check that it renders `lines` bars for `text`, one bar for `rect` and `circle`,
and that the host is `aria-hidden`.
