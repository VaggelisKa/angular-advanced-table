The table theme contract is CSS custom properties. Put tokens on an ancestor of the table and let inheritance flow through the core table, companion controls, and optional render-metrics UI.

## Recommended Shape

Use `NatTableSurface` when you want the stock surface and companion-control theme.

```html
<section class="orders-table-theme">
  <nat-table-surface>
    <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

    <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />

    <nat-table-scroll-control />
    <nat-table-column-visibility />
  </nat-table-surface>
</section>
```

Start with product-level tokens. `NatTableSurface` maps common product tokens into the `--nat-table-*` token set.

```css
.orders-table-theme {
  --text: #172033;
  --text-soft: #64748b;
  --accent: #2563eb;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-contrast: #f8fafc;
  --success: #15803d;
  --warning: #a16207;
  --danger: #b91c1c;

  color: var(--text);
  color-scheme: light;
}
```

Use direct `--nat-table-*` overrides when the table needs a table-specific decision that should not affect the rest of the app.

```css
.orders-table-theme {
  --nat-table-header-background: #eef2ff;
  --nat-table-row-background-hover: #f8fafc;
  --nat-table-focus-ring-color: #1d4ed8;
}
```

## Theme Scope

Choose the narrowest scope that matches the product decision.

```css
.risk-table {
  --accent: #7c3aed;
  --nat-table-header-background: #f5f3ff;
  --nat-table-pinned-divider-color: #c4b5fd;
}
```

For app-wide themes, put product tokens on the app root or theme attribute.

```css
:root {
  --text: #111827;
  --text-soft: #6b7280;
  --accent: #2563eb;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-contrast: #f9fafb;
  --success: #15803d;
  --warning: #a16207;
  --danger: #b91c1c;

  color-scheme: light;
}

[data-theme='dark'] {
  --text: #f9fafb;
  --text-soft: #9ca3af;
  --accent: #60a5fa;
  --surface: #111827;
  --surface-elevated: #1f2937;
  --surface-contrast: #374151;
  --success: #86efac;
  --warning: #fde68a;
  --danger: #fca5a5;

  color-scheme: dark;
}
```

If controls and the table live in different surfaces, put product tokens on their shared ancestor so both surfaces derive the same theme.

## Core Table Tokens

These are the most common stable `ng-advanced-table` tokens to override directly.

| Token                              | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `--nat-table-color-text`           | Base table text color              |
| `--nat-table-font-family`          | Table font family                  |
| `--nat-table-region-background`    | Scrollable table region background |
| `--nat-table-region-border-color`  | Scrollable table region border     |
| `--nat-table-radius-region`        | Scrollable table region radius     |
| `--nat-table-header-background`    | Header background                  |
| `--nat-table-header-color`         | Header text color                  |
| `--nat-table-header-border-color`  | Header divider                     |
| `--nat-table-row-background`       | Default body row background        |
| `--nat-table-row-background-hover` | Hovered row background             |
| `--nat-table-row-background-focus` | Focus-within row background        |
| `--nat-table-pinned-background`    | Pinned cell background             |
| `--nat-table-pinned-divider-color` | Pinned edge divider                |
| `--nat-table-cell-border-color`    | Body cell divider                  |
| `--nat-table-cell-color-positive`  | Positive semantic cell tone        |
| `--nat-table-cell-color-negative`  | Negative semantic cell tone        |
| `--nat-table-cell-color-warning`   | Warning semantic cell tone         |
| `--nat-table-cell-color-neutral`   | Neutral semantic cell tone         |
| `--nat-table-empty-state-color`    | Empty, loading, and error row text |
| `--nat-table-focus-ring-color`     | Keyboard focus indicator           |
| `--nat-table-focus-ring-width`     | Keyboard focus indicator width     |
| `--nat-table-space-cell-y`         | Cell block padding                 |
| `--nat-table-space-cell-x`         | Cell inline padding                |

## UI Control Tokens

`ng-advanced-table/ui` controls consume the same theme. Common groups include:

| Group          | Common tokens                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface        | `--nat-table-card-background`, `--nat-table-card-border-color`, `--nat-table-card-shadow`, `--nat-table-radius-card`, `--nat-table-space-card` |
| Controls       | `--nat-table-color-text-muted`, `--nat-table-font-size-label`, `--nat-table-space-control-block-gap`                                           |
| Chips          | `--nat-table-chip-background`, `--nat-table-chip-background-active`, `--nat-table-chip-border-color`, `--nat-table-radius-chip`                |
| Pager          | `--nat-table-pager-background`, `--nat-table-pager-border-color`, `--nat-table-pager-color`, `--nat-table-pager-min-height`                    |
| Header actions | `--nat-table-sort-icon-color-active`, `--nat-table-sort-icon-color-idle`, `--nat-table-pin-color-pinned`                                       |
| Motion         | `--nat-table-transition-fast`, `--nat-table-transition-medium`, `--nat-table-disabled-opacity`                                                 |

Prefer product tokens first. Reach for these direct tokens when a table control needs a local exception.

## Core-Only Tables

If you do not use `NatTableSurface`, the core table still renders with fallbacks. For a polished core-only table, provide the core tokens yourself.

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
- Prefer product tokens (`--text`, `--accent`, `--surface`, and state colors) before direct table tokens.
- Keep table, companion controls, and render metrics under the same theme scope.
- Use `color-scheme` for light and dark scopes.
- Verify focus-visible states after changing focus, border, header, chip, pager, or semantic colors.
- Keep text, controls, focus indicators, pinned dividers, and semantic tones at WCAG AA contrast.
- Do not target private component classes, generated DOM structure, Angular internals, or `::ng-deep`.
