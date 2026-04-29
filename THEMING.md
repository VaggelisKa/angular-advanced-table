# Theming `ng-advanced-table`

This guide is for application developers and AI agents consuming `ng-advanced-table`, `ng-advanced-table-ui`, and `ng-advanced-table-utils`.

The component theme contract is CSS custom properties. Do not target generated DOM structure, private classes, or Angular internals. Put tokens on an ancestor of the table and let CSS inheritance flow through the core table and optional UI controls.

## Recommended Consumer Approach

1. Use `ng-advanced-table-ui` and wrap the table plus controls in `<nat-table-surface>` when you want the default themed surface.
2. Define your product tokens on the host page, feature wrapper, or app theme root.
3. Let `NatTableSurface` map common product tokens such as `--text`, `--text-soft`, `--accent`, `--surface`, `--surface-elevated`, `--surface-contrast`, `--success`, `--warning`, and `--danger` into the `--nat-table-*` token set.
4. Override `--nat-table-*` tokens directly only when the table needs a table-specific decision that should not affect the rest of the app.
5. Keep accessibility tokens, especially focus and state colors, in the same theme scope as the visual theme.

Preferred shape:

```html
<section class="orders-table-theme">
  <nat-table-surface>
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [enablePagination]="true"
      ariaLabel="Orders"
    />

    <nat-table-search [for]="grid" />
    <nat-table-column-visibility [for]="grid" />
    <nat-table-page-size [for]="grid" />
    <nat-table-pager [for]="grid" />
  </nat-table-surface>
</section>
```

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

## Package Responsibilities

`ng-advanced-table` renders the grid. It consumes `--nat-table-*` variables for typography, cell spacing, borders, row states, pinned columns, semantic cell tones, empty state, and focus rings. It has sensible fallbacks, so a core-only table can render without `NatTableSurface`.

`ng-advanced-table-ui` provides the recommended stock theme layer. `NatTableSurface` defines the full default `--nat-table-*` set and maps it from app-level product tokens for its own content. Put the table inside a `NatTableSurface` when the table should receive those defaults. The search, column visibility, page-size, pager, and header action components consume those same variables.

`ng-advanced-table-utils` currently uses lightweight render-metrics UI. It follows the showcase-style product tokens `--text`, `--text-soft`, `--success`, `--warning`, and `--danger`; place those on the same ancestor if you use metrics components beside the table.

## Where To Put Theme Tokens

Use a narrow scope when only one table should change:

```css
.risk-table {
  --nat-table-color-accent: #7c3aed;
  --nat-table-header-background: #f5f3ff;
  --nat-table-row-background-hover: #ede9fe;
}
```

If controls and the table live in separate `NatTableSurface` instances, put product tokens on their shared ancestor. Each surface will derive the same `--nat-table-*` defaults from those shared product tokens.

Use an app-level scope when all tables should follow the active product theme:

```css
:root {
  --text: #111827;
  --text-soft: #6b7280;
  --accent: #2563eb;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-contrast: #f9fafb;
}

[data-theme='dark'] {
  --text: #f9fafb;
  --text-soft: #9ca3af;
  --accent: #60a5fa;
  --surface: #111827;
  --surface-elevated: #1f2937;
  --surface-contrast: #374151;

  color-scheme: dark;
}
```

## Core Theme Tokens

These are the most important stable customization points for the core table.

| Token | Purpose |
| --- | --- |
| `--nat-table-color-text` | Base text color inherited by the table |
| `--nat-table-font-family` | Table font family |
| `--nat-table-region-background` | Scrollable table region background |
| `--nat-table-region-border-color` | Scrollable table region border |
| `--nat-table-radius-region` | Scrollable table region corner radius |
| `--nat-table-header-background` | Sticky header background |
| `--nat-table-header-color` | Sticky header text color |
| `--nat-table-header-border-color` | Header divider color |
| `--nat-table-row-background` | Default body row background |
| `--nat-table-row-background-hover` | Body row hover background |
| `--nat-table-row-background-focus` | Body row focus-within background |
| `--nat-table-expanded-row-background` | Expanded detail row background |
| `--nat-table-pinned-background` | Sticky pinned cell background |
| `--nat-table-pinned-divider-color` | Divider at pinned column edges |
| `--nat-table-cell-border-color` | Body cell divider color |
| `--nat-table-cell-color-positive` | Positive semantic cell tone |
| `--nat-table-cell-color-negative` | Negative semantic cell tone |
| `--nat-table-cell-color-warning` | Warning semantic cell tone |
| `--nat-table-cell-color-neutral` | Neutral semantic cell tone |
| `--nat-table-empty-state-color` | Empty-state text color |
| `--nat-table-focus-ring-color` | Keyboard focus indicator color |
| `--nat-table-focus-ring-width` | Keyboard focus indicator width |
| `--nat-table-space-cell-y` | Cell block padding |
| `--nat-table-space-cell-x` | Cell inline padding |
| `--nat-table-space-expanded-row` | Expanded detail row padding |
| `--nat-table-font-size-header` | Header font size |
| `--nat-table-letter-spacing-header` | Header letter spacing |
| `--nat-table-text-transform-header` | Header text transform |
| `--nat-table-font-weight-row-header` | Row header cell weight |

## UI Theme Tokens

Use these when consuming `ng-advanced-table-ui`.

| Token group | Common tokens |
| --- | --- |
| Surface | `--nat-table-card-background`, `--nat-table-card-border-color`, `--nat-table-card-border-color-hover`, `--nat-table-card-shadow`, `--nat-table-card-backdrop-filter`, `--nat-table-radius-card`, `--nat-table-space-card` |
| Controls | `--nat-table-color-text-muted`, `--nat-table-font-size-label`, `--nat-table-letter-spacing-label`, `--nat-table-text-transform-label`, `--nat-table-space-control-block-gap` |
| Search | `--nat-table-search-background`, `--nat-table-search-background-focus`, `--nat-table-search-color`, `--nat-table-search-placeholder-color`, `--nat-table-search-border-color`, `--nat-table-search-border-color-focus`, `--nat-table-search-focus-ring`, `--nat-table-search-min-height` |
| Chips | `--nat-table-chip-background`, `--nat-table-chip-background-hover`, `--nat-table-chip-background-active`, `--nat-table-chip-border-color`, `--nat-table-chip-border-color-active`, `--nat-table-chip-shadow-active`, `--nat-table-chip-count-color`, `--nat-table-chip-min-height`, `--nat-table-radius-chip` |
| Pager | `--nat-table-pager-background`, `--nat-table-pager-background-hover`, `--nat-table-pager-border-color`, `--nat-table-pager-color`, `--nat-table-pager-label-color`, `--nat-table-pager-min-height`, `--nat-table-pager-padding-x` |
| Header actions | `--nat-table-sort-icon-color-active`, `--nat-table-sort-icon-color-idle`, `--nat-table-sort-icon-color-muted`, `--nat-table-sort-icon-color-hover`, `--nat-table-sort-icon-chip-background-active`, `--nat-table-pin-color-pinned`, `--nat-table-pin-border-color-pinned` |
| Motion and disabled states | `--nat-table-transition-fast`, `--nat-table-transition-medium`, `--nat-table-transition-slow`, `--nat-table-hover-lift`, `--nat-table-disabled-opacity` |

## Core-Only Tables

If you do not use `NatTableSurface`, provide `--nat-table-*` tokens yourself on a wrapper or let the core fallbacks render a minimal table. Core-only theming usually needs fewer tokens:

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

## Do And Do Not

Do:

- Theme through CSS variables on an ancestor or host component.
- Keep table, UI controls, and render-metrics components under the same theme scope.
- Use `color-scheme` for light and dark scopes so form controls and scrollbars align with the theme.
- Check keyboard focus, hover, active, disabled, pinned-column, and empty states after changing colors.
- Preserve WCAG AA contrast for text, controls, and focus indicators.

Do not:

- Style private classes such as `.data-cell`, `.chip`, or `.sort-button` from the consuming app unless you are intentionally accepting internal CSS coupling.
- Override Angular component internals with `::ng-deep`.
- Remove visible focus indicators.
- Encode business meaning only through color. Semantic tones should still be understandable through text, labels, or surrounding context.

## AI Agent Checklist

When an AI agent is asked to theme a consuming app:

1. Find the wrapper that contains `<nat-table>` and any `ng-advanced-table-ui` or `ng-advanced-table-utils` components.
2. Add or update product tokens on that wrapper first.
3. Use direct `--nat-table-*` overrides only for table-specific exceptions.
4. Prefer `NatTableSurface` for stock controls unless the user explicitly wants custom controls.
5. Do not edit library CSS in `node_modules` or target private component classes from the app.
6. Verify light and dark scopes if both exist.
7. Verify focus-visible states and contrast after changing `--nat-table-focus-ring-color`, text colors, header colors, chip colors, pager colors, or semantic tone colors.
