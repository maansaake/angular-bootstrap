# Design rules

Standing conventions specific to this repository. The general Angular conventions are in the
skills under `.agents/skills/`; where they conflict, this file wins.

## Theming and UI

### Style with system tokens only

**Rule:** Component styles use `--mat-sys-*` tokens for color, typography and shape. Palettes are
set only in `src/styles.scss`.
**Why:** The app can be rethemed, and light/dark switched, by editing one file. A hard-coded color
breaks in one of the two schemes and survives a retheme.
**When:** All component and global styles.

### Use surface-container for app chrome

**Rule:** The header and footer use `--mat-sys-surface-container` as their background.
**Why:** Keeps the chrome visually separate from page content in both schemes.
**When:** Any new persistent app-chrome element (toolbars, bars, side navs).

### Show transient messages through Notifier

**Rule:** Show snackbar-style messages with `inject(Notifier).show(message)` from
`src/app/services/notifier.service.ts`, never `MatSnackBar` directly.
**Why:** Every page shows confirmations with the same position, duration and action.
**When:** Any transient success or failure message.

## API clients

### Generate clients, never hand-edit them

**Rule:** Change an API by editing its spec in `openapi/`, running `make codegen` and committing
the regenerated output in `src/app/services/<api-name>/`.
**Why:** CI checks that generated clients match the specs; a hand edit fails the build or is lost
on the next regeneration.
**When:** `src/app/services/auth-basic/` and `src/app/services/backend/`, and any client added
later.

### Keep the mock backend in step with the specs

**Rule:** When an endpoint the app calls is added or changed, update `src/app/mocks/kerberos-mock.ts`
in the same change.
**Why:** `make serve` and the GitHub Pages demo run entirely on the mock.
**When:** Every API change the app uses, as long as `mocks/` exists.

## Testing and accessibility

### Run axe in every page spec

**Rule:** Every page spec calls `expectNoAxeViolations` from `src/testing/axe.ts`.
**Why:** It is the automated WCAG 2.2 AA check; pages without it can regress unnoticed.
**When:** Every component under `src/app/pages/`; recommended for shared components.

## Skills and plugin

### Keep the skills project-agnostic

**Rule:** Text under `.agents/skills/` describes conventions for any Angular app. Facts about this
app go in `AGENTS.md` or `docs/`.
**Why:** Other projects install the skills through the plugin; app-specific facts would mislead
them.
**When:** Every edit to a skill.

### Bump the plugin version when a skill changes

**Rule:** Increase `version` in `.claude-plugin/plugin.json` in any change that edits a skill.
**Why:** Installed copies only update when the version changes.
**When:** Any change under `.agents/skills/`.
