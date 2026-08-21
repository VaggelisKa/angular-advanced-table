The table theme contract is CSS custom properties. Put tokens on an ancestor of the table and let inheritance flow through the core table, companion controls, and optional render-metrics UI.

## Recommended Shape

Use `NatTableSurface` when you want the shared controller scope and companion-control wiring. The core table is visually headless by default; import the opt-in stock theme (see Opt-in Stock Theme) or scope inherited `--nat-table-*` custom properties on a wrapper around the table, controls, and optional render-metrics UI.

```html
<section class="orders-table-theme">
  <nat-table-surface>
    <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

    <nat-table #table [data]="rows()" [columns]="columns" accessibleName="Orders" />

    <nat-table-scroll-control />
    <nat-table-column-visibility />
    <nat-render-metrics-panel [controller]="table" [store]="renderMetricsStore" />
  </nat-table-surface>
</section>
```

Start with the semantic table palette. The table, bundled controls, and render-metrics components inherit these values.

```css
.orders-table-theme {
  --nat-table-color-text: #111827;
  --nat-table-color-text-muted: #4b5563;
  --nat-table-color-accent: #2563eb;
  --nat-table-color-success: #166534;
  --nat-table-color-warning: #a16207;
  --nat-table-color-danger: #b91c1c;
  --nat-table-color-surface: #ffffff;
  --nat-table-color-surface-elevated: #ffffff;
  --nat-table-color-surface-sticky: #f9fafb;

  color-scheme: light;
}

[data-theme='dark'] .orders-table-theme {
  --nat-table-color-text: #f9fafb;
  --nat-table-color-text-muted: #cbd5e1;
  --nat-table-color-accent: #60a5fa;
  --nat-table-color-success: #86efac;
  --nat-table-color-warning: #fde68a;
  --nat-table-color-danger: #fca5a5;
  --nat-table-color-surface: rgb(15 23 42 / 92%);
  --nat-table-color-surface-elevated: #111827;
  --nat-table-color-surface-sticky: #1f2937;

  color-scheme: dark;
}
```

Use direct `--nat-table-*` overrides when the table needs a table-specific decision that should not affect the rest of the app.

```css
.orders-table-theme {
  --nat-table-header-background: #eef2ff;
  --nat-table-row-background-hover: #f8fafc;
  --nat-table-focus-ring-color: #1d4ed8;
  --nat-table-radius-chip: 0.75rem;
}
```

## Theme Scope

Choose the narrowest scope that matches the product decision.

```css
.risk-table {
  --nat-table-color-accent: #7c3aed;
  --nat-table-header-background: #f5f3ff;
  --nat-table-pinned-divider-color: #c4b5fd;
}
```

For app-wide themes, put table tokens on the app root or theme attribute.

```css
:root {
  --nat-table-color-text: #111827;
  --nat-table-color-text-muted: #6b7280;
  --nat-table-color-accent: #2563eb;
  --nat-table-color-surface: #ffffff;
  --nat-table-color-surface-elevated: #ffffff;
  --nat-table-color-surface-sticky: #f9fafb;
  --nat-table-color-success: #15803d;
  --nat-table-color-warning: #a16207;
  --nat-table-color-danger: #b91c1c;

  color-scheme: light;
}

[data-theme='dark'] {
  --nat-table-color-text: #f9fafb;
  --nat-table-color-text-muted: #9ca3af;
  --nat-table-color-accent: #60a5fa;
  --nat-table-color-surface: #111827;
  --nat-table-color-surface-elevated: #1f2937;
  --nat-table-color-surface-sticky: #374151;
  --nat-table-color-success: #86efac;
  --nat-table-color-warning: #fde68a;
  --nat-table-color-danger: #fca5a5;

  color-scheme: dark;
}
```

If controls and the table live in different surfaces, put product tokens on their shared ancestor so both surfaces derive the same theme.

The live example below scopes `--nat-table-*` tokens on `NatTableSurface`, with a matching `[data-theme='dark']` override. It intentionally avoids private component classes and `::ng-deep`, so the same CSS can live in a consumer app stylesheet.

## Core Table Tokens

These are the most common stable `ng-advanced-table` tokens to override directly.

| Token                                     | Purpose                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `--nat-table-color-text`                  | Base table text color                                                           |
| `--nat-table-color-border`                | Shared surface and control border                                               |
| `--nat-table-color-divider`               | Shared row and cell divider                                                     |
| `--nat-table-font-family`                 | Table font family                                                               |
| `--nat-table-region-background`           | Scrollable table region background                                              |
| `--nat-table-region-border-color`         | Scrollable table region border                                                  |
| `--nat-table-region-border-width`         | Scrollable table region border width                                            |
| `--nat-table-radius-region`               | Scrollable table region radius                                                  |
| `--nat-table-header-background`           | Header background                                                               |
| `--nat-table-header-color`                | Header text color                                                               |
| `--nat-table-font-weight-header`          | Header text font weight                                                         |
| `--nat-table-header-border-color`         | Header divider                                                                  |
| `--nat-table-header-border-width`         | Header divider width                                                            |
| `--nat-table-row-background`              | Default body row background                                                     |
| `--nat-table-row-background-hover`        | Hovered row background                                                          |
| `--nat-table-row-background-focus`        | Focus-within row background                                                     |
| `--nat-table-pinned-background`           | Pinned cell background                                                          |
| `--nat-table-pinned-header-background`    | Pinned header cell background (falls back to `--nat-table-pinned-background`)   |
| `--nat-table-pinned-divider-color`        | Pinned edge divider                                                             |
| `--nat-table-pinned-divider-shadow-color` | Shared opt-in shadow color for both pinned-zone boundaries                      |
| `--nat-table-pinned-edge-shadow-size`     | Shared size of the pinned-zone fade; the library mirrors its direction per zone |
| `--nat-table-cell-border-color`           | Body cell divider                                                               |
| `--nat-table-cell-border-width`           | Body cell divider width                                                         |
| `--nat-table-cell-color-positive`         | Positive semantic cell tone                                                     |
| `--nat-table-cell-color-negative`         | Negative semantic cell tone                                                     |
| `--nat-table-cell-color-warning`          | Warning semantic cell tone                                                      |
| `--nat-table-cell-color-neutral`          | Neutral semantic cell tone                                                      |
| `--nat-table-empty-state-color`           | Empty, loading, and error row text                                              |
| `--nat-table-focus-ring-color`            | Keyboard focus indicator                                                        |
| `--nat-table-focus-ring-width`            | Keyboard focus indicator width                                                  |
| `--nat-table-space-cell-y`                | Cell block padding                                                              |
| `--nat-table-space-cell-x`                | Cell inline padding (shared base)                                               |
| `--nat-table-space-header-cell-x`         | Header cell inline padding (falls back to `--nat-table-space-cell-x`)           |
| `--nat-table-space-data-cell-x`           | Data cell inline padding (falls back to `--nat-table-space-cell-x`)             |
| `--nat-table-sub-header-background`       | Sub-header (group) row background (table and list)                              |
| `--nat-table-sub-header-color`            | Sub-header (group) row text color (table and list)                              |
| `--nat-table-space-sub-header`            | Sub-header (group) row padding (table and list)                                 |
| `--nat-table-font-weight-sub-header`      | Sub-header (group) row font weight (table and list)                             |

Set the border-width tokens to `0` when a design needs to remove the outer table boundary or internal dividers.

### List Renderer Tokens (spike)

The `nat-list` spike renderer lays every item out as a CSS grid whose field areas are named by column id, so consumers can position each column's field freely. These tokens are spike API and may change or be removed with the `NatList` spike.

| Token                                 | Purpose                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--nat-list-gap`                      | Gap between list items                                                                             |
| `--nat-list-item-areas`               | `grid-template-areas` for one item; area names are column ids (default stacks each visible column) |
| `--nat-list-item-columns`             | `grid-template-columns` for one item                                                               |
| `--nat-list-item-gap`                 | Gap between fields inside one item                                                                 |
| `--nat-list-item-padding`             | Item padding                                                                                       |
| `--nat-list-item-background`          | Item background; transparent by default, so items inherit the page background                      |
| `--nat-list-item-background-selected` | Item background while the row is selected (`data-selected="true"`)                                 |
| `--nat-list-item-border-width`        | Item border width                                                                                  |
| `--nat-list-item-border-color`        | Item border color; a currentcolor mix by default, so it follows the page text color                |
| `--nat-list-item-radius`              | Item corner radius                                                                                 |
| `--nat-list-field-gap`                | Gap between one field's label and value                                                            |
| `--nat-list-field-align`              | `align-items` for one field (defaults to `baseline`)                                               |
| `--nat-list-field-flex-direction`     | `flex-direction` for one field (defaults to `row`)                                                 |
| `--nat-list-field-justify`            | `justify-content` for one field (defaults to `flex-start`)                                         |
| `--nat-list-label-font-weight`        | Field label weight                                                                                 |
| `--nat-list-label-font-size`          | Field label font size                                                                              |
| `--nat-list-label-color`              | Field label color (defaults to `currentColor`)                                                     |
| `--nat-list-space-sub-header`         | Sub-header row padding for lists                                                                   |
| `--nat-list-sub-header-background`    | Sub-header row background for lists                                                                |
| `--nat-list-sub-header-color`         | Sub-header row text color for lists                                                                |
| `--nat-list-font-weight-sub-header`   | Sub-header row font weight for lists                                                               |
| `--nat-list-sub-header-border`        | Sub-header row border style for lists                                                              |
| `--nat-list-sub-header-border-width`  | Sub-header row border width for lists                                                              |

When overriding `--nat-list-item-areas`, name every visible column in the template (or hide the rest via column visibility) — a field whose column id is missing from the areas template falls back to implicit grid placement.

The loading, empty, and error items share one base shape, so the tokens below restyle all three at once; each state then has its own accent token for the indicator (and, for the error state, the message color).

| Token                             | Purpose                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `--nat-list-state-padding`        | Padding for every state item                                                 |
| `--nat-list-state-gap`            | Gap between the state indicator and its message                              |
| `--nat-list-state-justify`        | `justify-content` for the state item (e.g. `center`)                         |
| `--nat-list-state-min-height`     | Minimum height, useful to stop layout jumping between states                 |
| `--nat-list-state-color`          | Shared state message color                                                   |
| `--nat-list-state-background`     | Shared state background                                                      |
| `--nat-list-state-border-color`   | Shared state border color                                                    |
| `--nat-list-state-border-style`   | Shared state border style (defaults to `dashed`)                             |
| `--nat-list-state-radius`         | Shared state corner radius                                                   |
| `--nat-list-state-indicator-size` | Indicator diameter                                                           |
| `--nat-list-loading-accent`       | Loading indicator color (falls back to `--nat-table-color-accent`)           |
| `--nat-list-empty-accent`         | Empty indicator outline color (falls back to `--nat-table-color-text-muted`) |
| `--nat-list-error-accent`         | Error indicator and message color (falls back to `--nat-table-color-danger`) |

Each state item also carries a `data-state` attribute (`loading`, `empty`, or `error`) for consumer styling hooks. The loading indicator animates and honors `prefers-reduced-motion: reduce`.

## UI Control Tokens

`ng-advanced-table/components` controls consume the same theme. Common groups include:

| Group          | Common tokens                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Surface        | `--nat-table-card-background`, `--nat-table-card-border-color`, `--nat-table-card-shadow`, `--nat-table-radius-card`, `--nat-table-space-card`, `--nat-table-space-card-list` (padding when a list renderer is projected; defaults to `0`) |
| Controls       | `--nat-table-color-text-muted`, `--nat-table-font-size-label`, `--nat-table-space-control-block-gap`                                                                                                                                       |
| Chips          | `--nat-table-chip-background`, `--nat-table-chip-background-active`, `--nat-table-chip-border-color`, `--nat-table-radius-chip`                                                                                                            |
| Pager          | `--nat-table-pager-background`, `--nat-table-pager-border-color`, `--nat-table-pager-color`, `--nat-table-pager-min-height`                                                                                                                |
| Header actions | `--nat-table-sort-icon-color-active`, `--nat-table-sort-icon-color-idle`, `--nat-table-pin-color-pinned`                                                                                                                                   |
| Motion         | `--nat-table-transition-fast`, `--nat-table-transition-medium`, `--nat-table-disabled-opacity`                                                                                                                                             |
| Stacking       | `--nat-table-z-index-sticky-header`, `--nat-table-z-index-pinned-cell`, `--nat-table-z-index-drag-preview`                                                                                                                                 |

Reach for these direct tokens when a table control needs a local exception.

### Scroll Control Tokens

`NatTableScrollControl` keeps its native range input and reads inherited tokens from the wrapper around the control and table. The component does not expose private selectors as theme API.

| Token                                         | Purpose                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `--nat-table-scroll-control-gap`              | Gap between the previous button, range group, and next button                           |
| `--nat-table-scroll-button-min-height`        | Existing fallback for both button axes when the logical sizing tokens are unset         |
| `--nat-table-scroll-button-min-inline-size`   | Minimum inline size of each button                                                      |
| `--nat-table-scroll-button-min-block-size`    | Minimum block size of each button                                                       |
| `--nat-table-scroll-button-padding-x`         | Button inline padding                                                                   |
| `--nat-table-scroll-button-color`             | Button and arrow color                                                                  |
| `--nat-table-scroll-button-background`        | Button background                                                                       |
| `--nat-table-scroll-button-background-hover`  | Enabled button background on hover                                                      |
| `--nat-table-scroll-button-border-color`      | Button border color                                                                     |
| `--nat-table-scroll-button-shadow-hover`      | Enabled button shadow on hover                                                          |
| `--nat-table-scroll-button-disabled-opacity`  | Disabled button opacity                                                                 |
| `--nat-table-scroll-icon-size`                | Arrow icon inline and block size                                                        |
| `--nat-table-scroll-range-gap`                | Gap between the position copy and range input                                           |
| `--nat-table-font-size-scroll-position`       | Position-copy font size                                                                 |
| `--nat-table-scroll-position-min-inline-size` | Minimum inline size of the position-copy column                                         |
| `--nat-table-scroll-position-color`           | Position-copy color                                                                     |
| `--nat-table-scroll-range-min-inline-size`    | Minimum inline size of the native range input                                           |
| `--nat-table-scroll-range-accent`             | Existing native accent and fallback for both range color tokens                         |
| `--nat-table-scroll-range-track-block-size`   | WebKit and Firefox track thickness                                                      |
| `--nat-table-scroll-range-track-color`        | Uniform WebKit and Firefox track color; falls back to `--nat-table-scroll-range-accent` |
| `--nat-table-scroll-range-track-border`       | WebKit and Firefox track border                                                         |
| `--nat-table-scroll-range-track-radius`       | WebKit and Firefox track corner radius                                                  |
| `--nat-table-scroll-range-thumb-inline-size`  | WebKit and Firefox thumb inline size                                                    |
| `--nat-table-scroll-range-thumb-block-size`   | WebKit and Firefox thumb block size                                                     |
| `--nat-table-scroll-range-thumb-color`        | WebKit and Firefox thumb color; falls back to `--nat-table-scroll-range-accent`         |
| `--nat-table-scroll-range-thumb-border`       | WebKit and Firefox thumb border                                                         |
| `--nat-table-scroll-range-thumb-radius`       | WebKit and Firefox thumb corner radius                                                  |
| `--nat-table-scroll-range-disabled-opacity`   | Disabled range opacity                                                                  |
| `--nat-table-radius-chip`                     | Button corner radius shared with other controls                                         |
| `--nat-table-hover-lift`                      | Enabled button hover transform                                                          |
| `--nat-table-transition-medium`               | Button color, background, border, shadow, and transform transition                      |
| `--nat-table-focus-ring-color`                | Keyboard focus-ring color for buttons and range                                         |
| `--nat-table-focus-ring-width`                | Keyboard focus-ring width for buttons and range                                         |
| `--nat-table-focus-ring-offset`               | Keyboard focus-ring offset for buttons and range                                        |

Scope product-specific overrides on a wrapper. Every value below crosses Angular's component boundary through normal custom-property inheritance.

```css
.orders-scroll-theme {
  --nat-table-scroll-control-gap: 0.75rem;
  --nat-table-scroll-button-min-inline-size: 2.75rem;
  --nat-table-scroll-button-min-block-size: 2.75rem;
  --nat-table-scroll-button-padding-x: 0.75rem;
  --nat-table-scroll-button-color: #12372f;
  --nat-table-scroll-button-background: #d8f3e8;
  --nat-table-scroll-button-background-hover: #bce7d9;
  --nat-table-scroll-button-border-color: #4f8f7c;
  --nat-table-scroll-icon-size: 1.2rem;
  --nat-table-font-size-scroll-position: 0.8rem;
  --nat-table-scroll-position-min-inline-size: 6ch;
  --nat-table-scroll-position-color: #345c51;
  --nat-table-scroll-range-min-inline-size: 10rem;
  --nat-table-scroll-range-track-block-size: 0.5rem;
  --nat-table-scroll-range-track-color: #9bcbbb;
  --nat-table-scroll-range-track-border: 1px solid #4f8f7c;
  --nat-table-scroll-range-track-radius: 0;
  --nat-table-scroll-range-thumb-inline-size: 1.35rem;
  --nat-table-scroll-range-thumb-block-size: 1.35rem;
  --nat-table-scroll-range-thumb-color: #0f766e;
  --nat-table-scroll-range-thumb-border: 2px solid #ffffff;
  --nat-table-scroll-range-thumb-radius: 0.25rem;
  --nat-table-focus-ring-color: #0f766e;
}
```

The track is intentionally uniform rather than a JavaScript-maintained progress fill. In forced-colors mode, track, thumb, and focus styling switch to system colors so the native keyboard control remains visible.

Render-metrics widgets intentionally do not expose their own component-specific tokens. They inherit the shared semantic palette (`--nat-table-color-*`) so they remain readable in light and dark themes, while their compact KPI/chip styling stays internal.

## Opt-in Stock Theme

`ng-advanced-table` core is headless by default: with no theme applied, the table and companion controls render with conservative system-color fallbacks and inherit the page's colors. Neither the core table nor `NatTableSurface` ships the stock look as a built-in default.

To get the polished stock look, import the opt-in stylesheet once, for example in your app's global styles or `main.ts`:

```ts
import 'ng-advanced-table/components/theme.css';
```

The stock theme is light/dark responsive: its palette uses `light-dark()` and the theme sets `color-scheme: light dark` on `:root`, so it follows the operating-system preference out of the box. To pin or toggle the mode, set `color-scheme` (and optionally a `[data-theme]` attribute) on a wrapper. The opt-in theme is intentionally outside the Safari 16.5 baseline for core table behavior; Safari 16.5 consumers can theme through their own `--nat-table-*` tokens instead of importing `theme.css`.

Token precedence is unchanged: a `--nat-table-*` token set on any ancestor wrapper (or on the surface element itself) still wins over the opt-in theme, and derived stock values (borders, dividers, mixed colors) recompute from your overridden palette tokens. If you inspect computed styles you may see internal `--sys-nat-table-*` bridge variables — they are implementation detail; never set them, set the matching `--nat-table-*` token instead.

Product UI should scope tokens on a wrapper or `NatTableSurface` ancestor so all companion controls inherit the same theme, whether or not the opt-in stylesheet is imported.

The tables below list the main stock values and resolved core defaults. Use them as a reference if you want to replicate the stock look, override individual tokens on top of it, or build your own theme from scratch without importing `theme.css` at all.

### Palette And Core

The palette is light/dark responsive via `light-dark(<light>, <dark>)`.

| Token                                | Stock value or resolved default                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `--nat-table-font-family`            | `'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif` |
| `--nat-table-color-text`             | `light-dark(#0f1419, #e6eaef)`                                                                 |
| `--nat-table-color-text-muted`       | `light-dark(#5b6672, #9aa4b1)`                                                                 |
| `--nat-table-color-accent`           | `light-dark(#1f6feb, #4f8bff)`                                                                 |
| `--nat-table-color-success`          | `light-dark(#127a3b, #3dd68c)`                                                                 |
| `--nat-table-color-warning`          | `light-dark(#8f5f00, #e5b452)`                                                                 |
| `--nat-table-color-danger`           | `light-dark(#b42318, #f15b5b)`                                                                 |
| `--nat-table-color-surface`          | `light-dark(#fff, #14171c)`                                                                    |
| `--nat-table-color-surface-elevated` | `light-dark(#fff, #14171c)`                                                                    |
| `--nat-table-color-surface-sticky`   | `light-dark(#f4f5f7, #1a1e24)`                                                                 |
| `--nat-table-color-border`           | `light-dark(#e4e7eb, #262b33)`                                                                 |
| `--nat-table-color-divider`          | `light-dark(#e4e7eb, #262b33)`                                                                 |
| `--nat-table-region-background`      | `var(--nat-table-color-surface)`                                                               |
| `--nat-table-header-background`      | `var(--nat-table-color-surface-sticky)`                                                        |
| `--nat-table-header-color`           | `var(--nat-table-color-text-muted)`                                                            |
| `--nat-table-cell-border-color`      | `var(--nat-table-color-divider)`                                                               |
| `--nat-table-cell-color-positive`    | `var(--nat-table-color-success)`                                                               |
| `--nat-table-cell-color-negative`    | `var(--nat-table-color-danger)`                                                                |
| `--nat-table-cell-color-warning`     | `var(--nat-table-color-warning)`                                                               |
| `--nat-table-cell-color-neutral`     | `var(--nat-table-color-text-muted)`                                                            |
| `--nat-table-empty-state-color`      | `var(--nat-table-color-text-muted)`                                                            |
| `--nat-table-loading-state-color`    | `var(--nat-table-empty-state-color)`                                                           |
| `--nat-table-error-state-color`      | `var(--nat-table-cell-color-negative)`                                                         |
| `--nat-table-focus-ring-color`       | `var(--nat-table-color-accent)`                                                                |

### Controls

| Token                                 | Stock value or resolved default                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `--nat-table-radius-card`             | `12px`                                                                                  |
| `--nat-table-radius-region`           | `8px`                                                                                   |
| `--nat-table-radius-input`            | `6px`                                                                                   |
| `--nat-table-radius-chip`             | `6px`                                                                                   |
| `--nat-table-space-card`              | `0`                                                                                     |
| `--nat-table-space-card-compact`      | `0`                                                                                     |
| `--nat-table-space-control-block-gap` | `12px`                                                                                  |
| `--nat-table-space-chip-row-gap`      | `10px`                                                                                  |
| `--nat-table-chip-background`         | `var(--nat-table-color-surface)`                                                        |
| `--nat-table-chip-background-active`  | `color-mix(in srgb, var(--nat-table-color-accent) 12%, var(--nat-table-color-surface))` |
| `--nat-table-chip-border-color`       | `var(--nat-table-color-border)`                                                         |
| `--nat-table-pager-background`        | `var(--nat-table-color-surface)`                                                        |
| `--nat-table-pager-border-color`      | `var(--nat-table-color-border)`                                                         |

### Layout And Stacking

| Token                                      | Stock value or resolved default  |
| ------------------------------------------ | -------------------------------- |
| `--nat-table-region-overflow-x`            | `auto`                           |
| `--nat-table-region-overflow-y`            | `auto`                           |
| `--nat-table-region-overscroll-behavior`   | `none`                           |
| `--nat-table-region-overscroll-behavior-x` | `none`                           |
| `--nat-table-region-overscroll-behavior-y` | `auto`                           |
| `--nat-table-max-height`                   | `inherit`                        |
| `--nat-table-min-height`                   | `auto`                           |
| `--nat-table-state-min-height`             | `var(--nat-table-min-height, 0)` |
| `--nat-table-height`                       | `inherit`                        |
| `--nat-table-sticky-top`                   | `0`                              |
| `--nat-table-z-index-sticky-header`        | `4`                              |
| `--nat-table-z-index-pinned-cell`          | `5`                              |
| `--nat-table-z-index-pinned-header`        | `6`                              |
| `--nat-table-z-index-focus-cell`           | `7` (focused pinned cells only)  |
| `--nat-table-z-index-resize-handle`        | `8`                              |
| `--nat-table-z-index-resize-guide`         | `9`                              |
| `--nat-table-z-index-drag-preview`         | `12`                             |

## Core-Only Tables

Pinned body and header cells always paint above unpinned cells, including when an unpinned cell has keyboard focus beneath a pin zone. The focus-cell layer is reserved for a focused pinned cell so its inset indicator remains visible without overtaking resize handles, resize guides, or drag previews. Pinned focus and hover tokens are composited as overlays over `--nat-table-pinned-background`; translucent consumer colors therefore keep an opaque pinned base instead of exposing scrolled content.

The core table is unstyled by default whether or not you use `NatTableSurface` — with or without the surface, it renders with system-color fallbacks unless you import the opt-in theme or provide tokens yourself. For a polished core-only table, import `ng-advanced-table/components/theme.css` or provide the core tokens yourself.

```html
<section class="plain-table">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
</section>
```

```css
.plain-table {
  --nat-table-color-text: #111827;
  --nat-table-region-background: #ffffff;
  --nat-table-region-border-color: #e5e7eb;
  --nat-table-header-background: #f9fafb;
  --nat-table-header-color: #4b5563;
  --nat-table-cell-border-color: #e5e7eb;
  --nat-table-row-background-hover: #f3f4f6;
  --nat-table-focus-ring-color: #2563eb;
}
```

## Semantic Cell Tones

Use `meta.cellTone` for semantic coloring and keep the meaning available in text or context.

```ts
{
  accessorKey: 'changePercent',
  header: 'Chg %',
  meta: {
    label: 'Change percent',
    align: 'end',
    cellTone: (context) => {
      const value = context.getValue<number>();

      if (value > 0) return 'positive';
      if (value < 0) return 'negative';

      return 'neutral';
    },
  },
  cell: (context) => `${context.getValue<number>().toFixed(2)}%`,
}
```

Then theme the tone tokens.

```css
.orders-table-theme {
  --nat-table-cell-color-positive: #166534;
  --nat-table-cell-color-negative: #b91c1c;
  --nat-table-cell-color-warning: #a16207;
  --nat-table-cell-color-neutral: #475569;
}
```

Do not encode business meaning only through color. Include signs, labels, icons with text alternatives, or nearby text that makes the state clear.

## Theming Checklist

- Put tokens on a wrapper, feature shell, or app theme root.
- Prefer `--nat-table-*` tokens for new themes.
- Keep table, companion controls, and render metrics under the same theme scope.
- Use `color-scheme` for light and dark scopes.
- Verify focus-visible states after changing focus, border, header, chip, pager, or semantic colors.
- Keep text, controls, focus indicators, pinned dividers, and semantic tones at WCAG AA contrast.
- Do not target private component classes, generated DOM structure, Angular internals, or `::ng-deep`.
