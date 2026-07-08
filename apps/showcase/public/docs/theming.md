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

| Token                              | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `--nat-table-color-text`           | Base table text color                |
| `--nat-table-color-border`         | Shared surface and control border    |
| `--nat-table-color-divider`        | Shared row and cell divider          |
| `--nat-table-font-family`          | Table font family                    |
| `--nat-table-region-background`    | Scrollable table region background   |
| `--nat-table-region-border-color`  | Scrollable table region border       |
| `--nat-table-region-border-width`  | Scrollable table region border width |
| `--nat-table-radius-region`        | Scrollable table region radius       |
| `--nat-table-header-background`    | Header background                    |
| `--nat-table-header-color`         | Header text color                    |
| `--nat-table-font-weight-header`   | Header text font weight              |
| `--nat-table-header-border-color`  | Header divider                       |
| `--nat-table-header-border-width`  | Header divider width                 |
| `--nat-table-row-background`       | Default body row background          |
| `--nat-table-row-background-hover` | Hovered row background               |
| `--nat-table-row-background-focus` | Focus-within row background          |
| `--nat-table-pinned-background`    | Pinned cell background               |
| `--nat-table-pinned-divider-color` | Pinned edge divider                  |
| `--nat-table-cell-border-color`    | Body cell divider                    |
| `--nat-table-cell-border-width`    | Body cell divider width              |
| `--nat-table-cell-color-positive`  | Positive semantic cell tone          |
| `--nat-table-cell-color-negative`  | Negative semantic cell tone          |
| `--nat-table-cell-color-warning`   | Warning semantic cell tone           |
| `--nat-table-cell-color-neutral`   | Neutral semantic cell tone           |
| `--nat-table-empty-state-color`    | Empty, loading, and error row text   |
| `--nat-table-focus-ring-color`     | Keyboard focus indicator             |
| `--nat-table-focus-ring-width`     | Keyboard focus indicator width       |
| `--nat-table-space-cell-y`         | Cell block padding                   |
| `--nat-table-space-cell-x`         | Cell inline padding                  |

Set the border-width tokens to `0` when a design needs to remove the outer table boundary or internal dividers.

## UI Control Tokens

`ng-advanced-table/components` controls consume the same theme. Common groups include:

| Group          | Common tokens                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface        | `--nat-table-card-background`, `--nat-table-card-border-color`, `--nat-table-card-shadow`, `--nat-table-radius-card`, `--nat-table-space-card` |
| Controls       | `--nat-table-color-text-muted`, `--nat-table-font-size-label`, `--nat-table-space-control-block-gap`                                           |
| Chips          | `--nat-table-chip-background`, `--nat-table-chip-background-active`, `--nat-table-chip-border-color`, `--nat-table-radius-chip`                |
| Pager          | `--nat-table-pager-background`, `--nat-table-pager-border-color`, `--nat-table-pager-color`, `--nat-table-pager-min-height`                    |
| Header actions | `--nat-table-sort-icon-color-active`, `--nat-table-sort-icon-color-idle`, `--nat-table-pin-color-pinned`                                       |
| Motion         | `--nat-table-transition-fast`, `--nat-table-transition-medium`, `--nat-table-disabled-opacity`                                                 |
| Stacking       | `--nat-table-z-index-sticky-header`, `--nat-table-z-index-pinned-cell`, `--nat-table-z-index-drag-preview`                                     |

Reach for these direct tokens when a table control needs a local exception.

Render-metrics widgets intentionally do not expose their own component-specific tokens. They inherit the shared semantic palette (`--nat-table-color-*`) so they remain readable in light and dark themes, while their compact KPI/chip styling stays internal.

## Opt-in Stock Theme

`ng-advanced-table` core is headless by default: with no theme applied, the table and companion controls render with conservative system-color fallbacks and inherit the page's colors. Neither the core table nor `NatTableSurface` ships the dark-teal stock look as a built-in default.

To get the polished stock look, import the opt-in stylesheet once, for example in your app's global styles or `main.ts`:

```ts
import 'ng-advanced-table/components/theme.css';
```

Token precedence is unchanged: a `--nat-table-*` token set on any ancestor wrapper (or on the surface element itself) still wins over the opt-in theme, and derived stock values (borders, dividers, mixed colors) recompute from your overridden palette tokens. If you inspect computed styles you may see internal `--sys-nat-table-*` bridge variables — they are implementation detail; never set them, set the matching `--nat-table-*` token instead.

Product UI should scope tokens on a wrapper or `NatTableSurface` ancestor so all companion controls inherit the same theme, whether or not the opt-in stylesheet is imported.

The tables below list the values the opt-in stock theme applies. Use them as a reference if you want to replicate the stock look, override individual tokens on top of it, or build your own theme from scratch without importing `theme.css` at all.

### Palette And Core

| Token                                | Opt-in theme value                                                 |
| ------------------------------------ | ------------------------------------------------------------------ |
| `--nat-table-color-text`             | `#ecf5fb`                                                          |
| `--nat-table-color-text-muted`       | `#a8c3d7`                                                          |
| `--nat-table-color-accent`           | `#57d1ff`                                                          |
| `--nat-table-color-success`          | `#5de6a6`                                                          |
| `--nat-table-color-warning`          | `#ffd166`                                                          |
| `--nat-table-color-danger`           | `#ff8d7f`                                                          |
| `--nat-table-color-surface`          | `rgb(7 23 35 / 72%)`                                               |
| `--nat-table-color-surface-elevated` | `rgb(4 14 22 / 92%)`                                               |
| `--nat-table-color-surface-sticky`   | `rgb(5 20 31 / 96%)`                                               |
| `--nat-table-color-border`           | `color-mix(in srgb, var(--nat-table-color-text) 12%, transparent)` |
| `--nat-table-color-divider`          | `color-mix(in srgb, var(--nat-table-color-text) 8%, transparent)`  |
| `--nat-table-region-background`      | `var(--nat-table-color-surface-elevated)`                          |
| `--nat-table-header-background`      | `var(--nat-table-color-surface-sticky)`                            |
| `--nat-table-header-color`           | `var(--nat-table-color-text-muted)`                                |
| `--nat-table-cell-border-color`      | `var(--nat-table-color-divider)`                                   |
| `--nat-table-cell-color-positive`    | `var(--nat-table-color-success)`                                   |
| `--nat-table-cell-color-negative`    | `var(--nat-table-color-danger)`                                    |
| `--nat-table-cell-color-warning`     | `var(--nat-table-color-warning)`                                   |
| `--nat-table-cell-color-neutral`     | `var(--nat-table-color-text-muted)`                                |
| `--nat-table-empty-state-color`      | `var(--nat-table-color-text-muted)`                                |
| `--nat-table-loading-state-color`    | `var(--nat-table-empty-state-color)`                               |
| `--nat-table-error-state-color`      | `var(--nat-table-cell-color-negative)`                             |
| `--nat-table-focus-ring-color`       | `var(--nat-table-color-accent)`                                    |

### Controls

| Token                                 | Opt-in theme value                                                   |
| ------------------------------------- | -------------------------------------------------------------------- |
| `--nat-table-radius-card`             | `28px`                                                               |
| `--nat-table-radius-region`           | `24px`                                                               |
| `--nat-table-radius-input`            | `18px`                                                               |
| `--nat-table-radius-chip`             | `999px`                                                              |
| `--nat-table-space-card`              | `28px`                                                               |
| `--nat-table-space-card-compact`      | `20px`                                                               |
| `--nat-table-space-control-block-gap` | `10px`                                                               |
| `--nat-table-space-chip-row-gap`      | `10px`                                                               |
| `--nat-table-chip-background`         | `color-mix(in srgb, var(--nat-table-color-text) 5%, transparent)`    |
| `--nat-table-chip-background-active`  | `color-mix(in srgb, var(--nat-table-color-accent) 18%, transparent)` |
| `--nat-table-chip-border-color`       | `color-mix(in srgb, var(--nat-table-color-text) 14%, transparent)`   |
| `--nat-table-pager-background`        | `color-mix(in srgb, var(--nat-table-color-accent) 16%, transparent)` |
| `--nat-table-pager-border-color`      | `color-mix(in srgb, var(--nat-table-color-accent) 28%, transparent)` |

### Layout And Stacking

| Token                                      | Opt-in theme value |
| ------------------------------------------ | ------------------ |
| `--nat-table-region-overflow-x`            | `auto`             |
| `--nat-table-region-overflow-y`            | `auto`             |
| `--nat-table-region-overscroll-behavior-y` | `auto`             |
| `--nat-table-max-height`                   | `inherit`          |
| `--nat-table-min-height`                   | `auto`             |
| `--nat-table-height`                       | `inherit`          |
| `--nat-table-sticky-top`                   | `0`                |
| `--nat-table-z-index-sticky-header`        | `4`                |
| `--nat-table-z-index-pinned-cell`          | `5`                |
| `--nat-table-z-index-pinned-header`        | `6`                |
| `--nat-table-z-index-focus-cell`           | `7`                |
| `--nat-table-z-index-resize-handle`        | `8`                |
| `--nat-table-z-index-resize-guide`         | `9`                |
| `--nat-table-z-index-drag-preview`         | `12`               |

## Core-Only Tables

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
