# ng-advanced-table

`ng-advanced-table` is a signals-first Angular data table built on [TanStack Table](https://tanstack.com/table). It ships a standalone `<nat-table>` component with built-in global search, column visibility controls, sticky pinning, pagination, accessible grid semantics, and typed hooks for controlled state.

## What It Solves

- Standalone Angular integration. Import `NatTable` directly into feature components.
- TanStack-powered sorting, filtering, pagination, visibility, and pinning.
- Built-in UI for search, column visibility, page size, pager controls, and pinned columns.
- Controlled or uncontrolled state per slice through `NatTableState`.
- Typed column metadata for labels, alignment, and semantic cell tones.
- Optional per-row render instrumentation through `(rowRendered)`.

## Installation

The current package peer ranges target Angular `21.2+` and TanStack Table `v8`.

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria
```

`@angular/core`, `@angular/common`, and the rest of Angular should already come from your application.

## Quick Start

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
  changePercent: number;
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Component({
  selector: 'app-positions-table',
  imports: [NatTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [initialState]="initialState"
      [pageSizeOptions]="[25, 50, 100]"
      [getRowId]="getRowId"
      ariaLabel="Open positions"
    />
  `,
})
export class PositionsTableComponent {
  readonly rows = signal<PositionRow[]>([
    {
      id: 'pos-001',
      symbol: 'AAPL',
      desk: 'Growth',
      price: 213.54,
      changePercent: 3.2,
    },
    {
      id: 'pos-002',
      symbol: 'MSFT',
      desk: 'Core',
      price: 487.12,
      changePercent: -1.4,
    },
  ]);

  readonly columns: ColumnDef<PositionRow>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      enablePinning: true,
      meta: {
        label: 'Symbol',
      },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'desk',
      header: 'Desk',
      meta: {
        label: 'Desk',
      },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: {
        label: 'Price',
        align: 'end',
      },
      cell: (context) => usd.format(context.getValue<number>()),
    },
    {
      accessorKey: 'changePercent',
      header: '24h %',
      meta: {
        label: '24h %',
        align: 'end',
        cellTone: (context) => {
          const value = context.getValue<number>();

          if (value > 0) {
            return 'positive';
          }

          if (value < 0) {
            return 'negative';
          }

          return 'neutral';
        },
      },
      cell: (context) => `${context.getValue<number>().toFixed(2)}%`,
    },
  ];

  readonly initialState: Partial<NatTableState> = {
    sorting: [{ id: 'changePercent', desc: true }],
    columnPinning: {
      left: ['symbol'],
      right: [],
    },
    pagination: {
      pageIndex: 0,
      pageSize: 25,
    },
  };

  readonly getRowId = (row: PositionRow) => row.id;
}
```

## Column Definitions

`<nat-table>` expects standard TanStack `ColumnDef<TData>` definitions. The library adds a small amount of typed column metadata through `NatTableColumnMeta`:

- `meta.label`: text used for the column visibility chips and ARIA labels. Set this whenever the header is not a plain string.
- `meta.align`: use `'end'` to right-align numeric columns.
- `meta.cellTone`: returns `'positive'`, `'negative'`, `'neutral'`, `'warning'`, or `null`. The result is exposed as a `data-tone` attribute on body cells.

Column behavior still comes from TanStack:

- Set `enablePinning: true` on columns that should expose pin controls.
- Set `enableHiding: false` on columns that must always stay visible.
- Use TanStack `filterFn`, `sortingFn`, accessors, and custom cell renderers as usual.

## State Model

The table supports both uncontrolled and partially controlled usage:

- `initialState` seeds the table once on first render.
- `state` lets you control any subset of `NatTableState`.
- Any slice you pass through `state` becomes controlled. The table will emit `stateChange`, but it will not persist that slice internally unless you feed the updated value back in.
- Global search and column-filter updates reset pagination back to page `0`.
- When `showPagination` is `false`, the table renders all filtered rows.

A common pattern is to control only the state you need for external UI:

```ts
readonly tableState = signal<Partial<NatTableState>>({
  columnFilters: [],
});

onTableStateChange(state: NatTableState): void {
  this.tableState.set({
    columnFilters: state.columnFilters,
  });
}
```

```html
<nat-table
  [data]="rows()"
  [columns]="columns"
  [state]="tableState()"
  ariaLabel="Orders"
  (stateChange)="onTableStateChange($event)"
/>
```

## Public API

### Inputs

| Name                   | Required | Type                                    | Default                             | Notes                                                                       |
| ---------------------- | -------- | --------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| `data`                 | Yes      | `readonly TData[]`                      | none                                | Table rows.                                                                 |
| `columns`              | Yes      | `readonly ColumnDef<TData, unknown>[]`  | none                                | TanStack column definitions.                                                |
| `ariaLabel`            | Yes      | `string`                                | none                                | Accessible name for the table.                                              |
| `pageSizeOptions`      | No       | `readonly number[]`                     | `[10, 25, 50]`                      | Values are sanitized to positive integers.                                  |
| `enableGlobalFilter`   | No       | `boolean`                               | `true`                              | Shows the search input and applies global filtering.                        |
| `searchLabel`          | No       | `string`                                | `'Search rows'`                     | Label for the search field.                                                 |
| `searchPlaceholder`    | No       | `string`                                | `'Search rows'`                     | Placeholder for the search field.                                           |
| `showColumnVisibility` | No       | `boolean`                               | `true`                              | Shows the built-in visibility controls.                                     |
| `showPagination`       | No       | `boolean`                               | `true`                              | Enables page size controls and the pager.                                   |
| `allowColumnPinning`   | No       | `boolean`                               | `true`                              | Enables sticky pinning where the column allows it.                          |
| `emptyStateLabel`      | No       | `string`                                | `'No rows match the current view.'` | Empty-state message.                                                        |
| `globalFilterFn`       | No       | `FilterFn<TData>`                       | built-in generic filter             | Override the default case-insensitive `Object.values(row.original)` search. |
| `initialState`         | No       | `Partial<NatTableState>`                | `{}`                                | Seed state applied once.                                                    |
| `state`                | No       | `Partial<NatTableState>`                | `{}`                                | Controlled slices of table state.                                           |
| `getRowId`             | No       | `(row: TData, index: number) => string` | index-based fallback                | Strongly recommended when your rows have stable ids.                        |
| `emitRowRenderEvents`  | No       | `boolean`                               | `false`                             | Emits one `rowRendered` event per visible row per render cycle.             |

### Outputs

| Name          | Payload                    | Notes                                                                                 |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `stateChange` | `NatTableState`            | Fires whenever the user changes sorting, filters, visibility, pinning, or pagination. |
| `rowRendered` | `NatTableRowRenderedEvent` | Only fires when `emitRowRenderEvents` is enabled. Useful for perf instrumentation.    |

### Template Ref API

The component is exported as `natTable`, so you can grab a template ref:

```html
<nat-table #grid="natTable" ... />
```

That ref exposes:

- `grid.table`: the underlying TanStack `Table<TData>` instance.
- `grid.patchState(...)`: a typed way to apply state updaters from external controls.

`patchState(...)` accepts the same state slices as `NatTableState`, with TanStack-style updater functions or direct values.

### Exported Types

```ts
interface NatTableState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

interface NatTableColumnMeta<TData, TValue> {
  label?: string;
  align?: 'start' | 'end';
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
}
```

## Styling And Theming

`<nat-table>` is 100 % themeable through CSS custom properties. Every color, border, radius, spacing value, font setting, transition, focus ring, and shadow used by the component resolves to a `--nat-table-*` variable, so consumers can restyle any detail without overriding a single class.

### Token Naming

All tokens follow the pattern:

```
--nat-table-<group>-<property>[-<state>]
```

Groups identify the subject (`color`, `space`, `radius`, `font`, `chip`, `pager`, `header`, `cell`, `row`, `pin`, `search`, `card`, …). The `-hover`, `-focus`, `-active`, `-pinned`, `-sorted`, and `-disabled` suffixes name the state being themed, if any.

### Two Layers Of Overrides

1. **Semantic palette tokens.** The fastest way to rebrand the table is to set the nine semantic color tokens. Everything else — borders, hovered chips, focus rings, pinned dividers — is derived from them via `color-mix()`.

   ```css
   .orders-surface {
     --nat-table-color-accent: #00a3ff;
     --nat-table-color-text: #f3fbff;
     --nat-table-color-text-muted: #abc2d2;
     --nat-table-color-surface: rgba(6, 18, 29, 0.78);
     --nat-table-color-surface-elevated: #08141f;
     --nat-table-color-surface-sticky: #102234;
     --nat-table-color-success: #34d399;
     --nat-table-color-danger: #ff7a7a;
     --nat-table-color-warning: #f4c15d;
   }
   ```

2. **Component-level tokens.** Reach for these when you want pixel-level control over a single subcomponent (chip background, pager shadow, header letter spacing, search focus ring, row hover tint, and so on). Override them on the component host (`nat-table`) or any ancestor.

   ```css
   nat-table {
     --nat-table-radius-card: 16px;
     --nat-table-radius-chip: 8px;
     --nat-table-space-cell-y: 12px;
     --nat-table-space-cell-x: 20px;
     --nat-table-chip-background-active: rgba(0, 163, 255, 0.24);
     --nat-table-pager-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.2);
     --nat-table-focus-ring-width: 3px;
   }
   ```

### Backward Compatibility

The legacy shorthand variables (`--accent`, `--surface`, `--surface-elevated`, `--surface-contrast`, `--text`, `--text-soft`, `--success`, `--danger`, `--warning`, `--shadow`) are still honoured as fallbacks for the corresponding `--nat-table-color-*` tokens, so existing themes continue to work. Prefer the `--nat-table-*` names in new code.

### Token Reference

#### Semantic palette

| Token                                                            | Default                      |
| ---------------------------------------------------------------- | ---------------------------- |
| `--nat-table-color-text`                                         | `var(--text, #ecf5fb)`       |
| `--nat-table-color-text-muted`                                   | `var(--text-soft, #a8c3d7)`  |
| `--nat-table-color-accent`                                       | `var(--accent, #57d1ff)`     |
| `--nat-table-color-success`                                      | `var(--success, #5de6a6)`    |
| `--nat-table-color-warning`                                      | `var(--warning, #ffd166)`    |
| `--nat-table-color-danger`                                       | `var(--danger, #ff8d7f)`     |
| `--nat-table-color-surface`                                      | `var(--surface, …)`          |
| `--nat-table-color-surface-elevated`                             | `var(--surface-elevated, …)` |
| `--nat-table-color-surface-sticky`                               | `var(--surface-contrast, …)` |
| `--nat-table-color-border` / `--nat-table-color-border-strong`   | derived                      |
| `--nat-table-color-divider` / `--nat-table-color-divider-subtle` | derived                      |

#### Typography

`--nat-table-font-family`, `--nat-table-font-size-header`, `--nat-table-font-size-label`, `--nat-table-font-size-caption`, `--nat-table-font-size-chip-meta`, `--nat-table-font-size-chip-compact`, `--nat-table-font-size-pager-label`, `--nat-table-font-size-pin-button`, `--nat-table-font-size-empty-state`, `--nat-table-font-weight-pager`, `--nat-table-letter-spacing-header`, `--nat-table-letter-spacing-label`, `--nat-table-letter-spacing-pin-button`, `--nat-table-letter-spacing-pager`, `--nat-table-text-transform-header`, `--nat-table-text-transform-label`, `--nat-table-line-height-empty-state`.

#### Spacing & layout

`--nat-table-space-card`, `--nat-table-space-card-compact`, `--nat-table-space-controls-gap`, `--nat-table-space-control-block-gap`, `--nat-table-space-toolbar-gap`, `--nat-table-space-toolbar-margin-bottom`, `--nat-table-space-table-actions-gap`, `--nat-table-space-pager-gap`, `--nat-table-space-chip-row-gap`, `--nat-table-space-header-content-gap`, `--nat-table-space-cell-y`, `--nat-table-space-cell-x`, `--nat-table-space-empty-state`, `--nat-table-space-host-top`.

#### Radii & sizing

`--nat-table-radius-card`, `--nat-table-radius-card-compact`, `--nat-table-radius-region`, `--nat-table-radius-input`, `--nat-table-radius-chip`, `--nat-table-search-min-height`, `--nat-table-search-padding-x`, `--nat-table-chip-min-height`, `--nat-table-chip-min-height-compact`, `--nat-table-chip-padding-x`, `--nat-table-chip-padding-x-compact`, `--nat-table-chip-min-width-column`, `--nat-table-pager-min-height`, `--nat-table-pager-padding-x`, `--nat-table-pin-min-height`, `--nat-table-pin-padding-x`, `--nat-table-sort-icon-min-width`.

#### Transitions, focus, and disabled

`--nat-table-transition-fast`, `--nat-table-transition-medium`, `--nat-table-transition-slow`, `--nat-table-hover-lift`, `--nat-table-focus-ring-color`, `--nat-table-focus-ring-width`, `--nat-table-focus-ring-offset`, `--nat-table-disabled-opacity`.

#### Card (`.controls`, `.table-card`)

`--nat-table-card-background`, `--nat-table-card-border-color`, `--nat-table-card-border-color-hover`, `--nat-table-card-border-width`, `--nat-table-card-shadow`, `--nat-table-card-backdrop-filter`, `--nat-table-card-divider-color`.

#### Search input

`--nat-table-search-background`, `--nat-table-search-background-focus`, `--nat-table-search-color`, `--nat-table-search-placeholder-color`, `--nat-table-search-border-color`, `--nat-table-search-border-color-hover`, `--nat-table-search-border-color-focus`, `--nat-table-search-focus-ring`.

#### Chips (column visibility, page size)

`--nat-table-chip-color`, `--nat-table-chip-background`, `--nat-table-chip-background-hover`, `--nat-table-chip-background-active`, `--nat-table-chip-border-color`, `--nat-table-chip-border-color-hover`, `--nat-table-chip-border-color-active`, `--nat-table-chip-shadow-active`, `--nat-table-chip-count-color`.

#### Pager

`--nat-table-pager-color`, `--nat-table-pager-background`, `--nat-table-pager-background-hover`, `--nat-table-pager-border-color`, `--nat-table-pager-shadow-hover`, `--nat-table-pager-label-color`, `--nat-table-pager-disabled-opacity`.

#### Table region, headers, rows, cells

`--nat-table-region-background`, `--nat-table-region-border-color`, `--nat-table-region-border-width`, `--nat-table-header-background`, `--nat-table-header-color`, `--nat-table-header-border-color`, `--nat-table-header-border-width`, `--nat-table-row-background`, `--nat-table-row-background-hover`, `--nat-table-row-background-hover-pinned`, `--nat-table-cell-border-color`, `--nat-table-cell-border-width`, `--nat-table-cell-color-positive`, `--nat-table-cell-color-negative`, `--nat-table-cell-color-warning`, `--nat-table-cell-color-neutral`, `--nat-table-empty-state-color`.

#### Sort, pin, pinned columns

`--nat-table-sort-icon-color`, `--nat-table-sort-button-color-sorted`, `--nat-table-pin-background`, `--nat-table-pin-border-color`, `--nat-table-pin-color`, `--nat-table-pin-color-pinned`, `--nat-table-pin-border-color-pinned`, `--nat-table-pin-shadow-pinned`, `--nat-table-pinned-background`, `--nat-table-pinned-divider-color`.

### Markup Hooks

- Header and body cells expose `data-column-id="<columnId>"`.
- Body cells expose `data-tone="positive|negative|neutral|warning"` when `meta.cellTone` returns a value.
- Sticky columns apply pinned classes automatically and compute offsets from real rendered widths.

## Row Render Metrics

If you set `emitRowRenderEvents` to `true`, the table emits:

```ts
interface NatTableRowRenderedEvent {
  rowId: string;
  renderToken: number;
  durationMs: number;
}
```

This is disabled by default because it adds an `afterRenderEffect` per rendered row. It is intended for performance dashboards and is the integration point used by the companion `ng-advanced-table-utils` package.

## Accessibility

- `ariaLabel` is required and becomes the accessible name for the table.
- Sortable headers publish `aria-sort`.
- Search, column visibility, and pagination controls are labeled out of the box.
- Focus-visible styles are included for interactive controls and grid cells.
- The table uses Angular's `@angular/aria/grid` primitives rather than raw div-based grid emulation.

## Companion Package

This repository also publishes `ng-advanced-table-utils`, which adds optional performance-oriented helpers:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`

Use it only if you need render timing overlays or diagnostics. The core table does not depend on it.
